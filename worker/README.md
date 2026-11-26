# The site's Worker

A Cloudflare Worker (`ivanbogush-contact`) that serves ivanbogush.ru: the site itself, the static export of the
Next.js app in the parent folder (`next build` → `../out`, the Worker's static assets), and the backend of its
forms at `POST /api/form` (`src/index.ts`). Russian ISPs slow Cloudflare down, so ivanbogush.ru points at a relay
outside Cloudflare that passes every request on to the Worker ([relay/](relay/README.md)).

The form checks the enquiry, then emails it to `MAIL_TO` through [Resend](https://resend.com) from `MAIL_FROM`.
The Worker stores nothing.

- **Telegram:** every message, and every press of «Показать» on a preview's first screen (`kind: "event"`), also
  goes to Ivan's leads bot (`LEADS_URL`, with the `LEADS_KEY` secret), after the answer, so the form never waits on
  it. The bot (`Desktop/Bots/portfolio-leads-bot`) notifies him and counts unique visitors per preview.

- **Reply** goes to the visitor when they left an email address as their contact (`reply_to`).
- **Spam:** a hidden honeypot field, at most 3 submissions per IP per minute (`ratelimits` binding), and only pages
  listed in `ALLOWED_ORIGINS` may post.
- **Consent** (152-ФЗ): the form's checkbox must be ticked, or the Worker answers 400. The time of consent is in
  the email.
- **If sending fails** (no key, Resend down, rate limit), the form shows the enquiry with "send via Telegram" and
  "send by email" buttons, already filled in.

Settings are in `wrangler.jsonc` (`vars`). The secrets are `RESEND_API_KEY`, `RELAY_KEY` (the relay's key) and
`LEADS_KEY` (the leads bot's; its README says how to set it).

## Run locally

```bash
npm install
cp .dev.vars.example .dev.vars   # put a Resend key in it, or leave it empty to test the fallback
npm --prefix .. run build        # the site, once: wrangler dev serves ../out
npm run dev                      # http://localhost:8788
```

The site, run with `npm run dev` in the parent folder (http://localhost:3210), posts its forms to
`http://localhost:8788/api/form` when it's on localhost.

`wrangler dev` runs the Worker in workerd, which on Windows needs the
[Microsoft Visual C++ Redistributable](https://learn.microsoft.com/cpp/windows/latest-supported-vc-redist) (x64).
Without it, `npm test` still checks the Worker: it calls the handler directly in Node, with Resend faked.

## Deploy

A push to main deploys: `../.github/workflows/deploy.yml` builds the site and runs `wrangler deploy`. It needs two
repo secrets (Settings → Secrets and variables → Actions): `WORKS_TOKEN` (as in `../.env.local`) and
`CLOUDFLARE_API_TOKEN`, a token made from Cloudflare's "Edit Cloudflare Workers" template.

By hand, which builds the site from this machine's files (`.env.local` included) and deploys it:

```bash
npx wrangler login
npm run deploy
npx wrangler secret put RESEND_API_KEY
```

The Worker lives at `https://ivanbogush-contact.bogushivan34.workers.dev`; ivanbogush.ru reaches it through the relay.

**Resend:** add and verify `ivanbogush.ru` under Domains (the DNS records go in at reg.ru), then create an API key
with sending access only. `MAIL_FROM` must use that domain.

## Mail to pr@ivanbogush.ru

ivanbogush.ru's MX points at Resend, which keeps incoming mail but forwards nothing itself. On `email.received`
Resend calls `POST /inbound` here ([src/inbound.ts](src/inbound.ts)). The Worker checks the webhook's signature,
fetches the message and its attachments, and sends a copy to the `FORWARD_TO` secret:

- **From** `"<sender's name>" <pr@ivanbogush.ru>` (`FORWARD_FROM`): a copy sent as the sender would fail their
  domain's DMARC. The first lines of the copy say who it's from and to whom.
- **Reply** goes to the original sender (`reply_to`).
- Only mail for `FORWARD_FOR` is forwarded (comma-separated; empty means everything the domain receives). The form's
  own emails go to pr@ too (`MAIL_TO`), so they reach the mailbox the same way.
- If anything fails the Worker answers 502 and Resend retries later. A retry never makes a second copy: the send
  carries an `Idempotency-Key` from the email's id.

Setup:

1. Resend → **Webhooks** → Add: URL `https://ivanbogush-contact.bogushivan34.workers.dev/inbound`, event
   `email.received`. Copy its signing secret.
2. Reading received mail needs an API key with **Full access**, not "sending access" only. Create one and replace
   `RESEND_API_KEY` with it.
3. Set the secrets and deploy:

```bash
npx wrangler secret put RESEND_WEBHOOK_SECRET   # whsec_…
npx wrangler secret put FORWARD_TO              # the mailbox the copies go to
npx wrangler secret put RESEND_API_KEY          # the full-access key
npm run deploy
```
