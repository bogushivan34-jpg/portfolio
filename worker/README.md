# Contact form worker

A Cloudflare Worker (`ivanbogush-contact`) behind the form at the bottom of ivanbogush.ru. It checks the enquiry,
then emails it to `MAIL_TO` through [Resend](https://resend.com) from `MAIL_FROM`. Nothing is stored.

- **Reply** goes to the visitor when they left an email address as their contact (`reply_to`).
- **Spam:** a hidden honeypot field, at most 3 submissions per IP per minute (`ratelimits` binding), and only pages
  listed in `ALLOWED_ORIGINS` may post.
- **Consent** (152-ФЗ): the form's checkbox must be ticked, or the Worker answers 400. The time of consent is in
  the email.
- **If sending fails** (no key, Resend down, rate limit), the form shows the enquiry with "send via Telegram" and
  "send by email" buttons, already filled in.
- **Visitors in Russia** reach it through the relay at form.ivanbogush.ru ([relay/](relay/README.md)), because Russian
  ISPs slow Cloudflare down. The form falls back to workers.dev only when the relay can't be reached.

Settings are in `wrangler.jsonc` (`vars`). The secrets are `RESEND_API_KEY` and `RELAY_KEY` (the relay's key).

## Run locally

```bash
npm install
cp .dev.vars.example .dev.vars   # put a Resend key in it, or leave it empty to test the fallback
npm run dev                      # http://localhost:8788
```

The site, run with `npm run dev` in the parent folder (http://localhost:3210), posts to `http://localhost:8788`
when it's on localhost.

`wrangler dev` runs the Worker in workerd, which on Windows needs the
[Microsoft Visual C++ Redistributable](https://learn.microsoft.com/cpp/windows/latest-supported-vc-redist) (x64).
Without it, `npm test` still checks the Worker: it calls the handler directly in Node, with Resend faked.

## Deploy

```bash
npx wrangler login
npm run deploy
npx wrangler secret put RESEND_API_KEY
```

The Worker lives at `https://ivanbogush-contact.bogushivan34.workers.dev`, which is
the fallback in `formEndpoint.live` in `../data/content.ts`, behind the relay.

**Resend:** add and verify `ivanbogush.ru` under Domains (the DNS records go in at reg.ru), then create an API key
with sending access only. `MAIL_FROM` must use that domain.
