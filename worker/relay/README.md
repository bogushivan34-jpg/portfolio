# ivanbogush.ru relay

The site and its contact form run as the Cloudflare Worker `ivanbogush-contact`
(`https://ivanbogush-contact.bogushivan34.workers.dev`, [../README.md](../README.md)). Russian ISPs slow Cloudflare's
addresses down, so **ivanbogush.ru** points at Caddy on a server outside Cloudflare, which passes every request on to
the Worker. Nothing of the site runs on the server and it stores nothing, so a deploy updates both addresses. One path
is the exception: `ivanbogush.ru/bot/*` goes to Ivan's leads bot on the same server
(`Desktop/Bots/portfolio-leads-bot`, 127.0.0.1:8790), which the Worker calls with each message and each «Показать» on
a preview.

Until 2026-11-26 the site was on GitHub Pages and only the form came through here, as `form.ivanbogush.ru`. The
script now serves ivanbogush.ru in its place.

It runs on the same server as the trouvere.ru relay (45.136.228.66, `trouvere-backend/relay`), as its own file:

| File on the server | What it is |
|---|---|
| `/etc/caddy/sites/portfolio.caddy` | the ivanbogush.ru site (root and Caddy can read it: it holds the key) |
| `/etc/caddy/portfolio-relay.key` | the relay key, root only |
| `/etc/caddy/Caddyfile` | the trouvere.ru relay's, plus `import /etc/caddy/sites/*.caddy` at the end |

Trouvère's setup.sh writes that import line too, so rerunning either script keeps both relays.

## Set it up, or change it

```bash
scp worker/relay/setup.sh root@45.136.228.66:portfolio-relay.sh
ssh -t root@45.136.228.66 sh portfolio-relay.sh
```

Enter keeps the server's key (the first run makes one). The script writes the two files, adds the import line if
it's missing (keeping a `.bak-<date>` of the Caddyfile), checks the config, and reloads Caddy gracefully, so
trouvere.ru doesn't drop a request. If Caddy rejects the config, it puts the old files back. Then it checks:

- the server reaches the Worker;
- the Worker knows the key (`GET /health` answers `"relay": true` with it);
- ivanbogush.ru points at the server, https://ivanbogush.ru works, and the site opens through it.

It lists whatever is left. Usually that's:

1. **DNS at reg.ru:** one A record `@` → 45.136.228.66 in place of GitHub Pages' four (185.199.108–111.153), no AAAA
   records, and no `form` record any more. Leave the MX and TXT records alone: they're the mail's (Resend). Caddy
   gets the certificate by itself once the domain points there; run the script again to see every check pass.
2. **The Worker's secret**, from `worker/` (the key never shows on screen):

   ```bash
   ssh root@45.136.228.66 cat /etc/caddy/portfolio-relay.key | npx wrangler secret put RELAY_KEY
   ```

## What the relay does to each request

- Asks Cloudflare for the Worker's hostname (Host and TLS name), since Cloudflare doesn't serve ivanbogush.ru.
- Adds `X-Relay-IP` (the visitor's address) and `X-Relay-Key` (the key). Cloudflare sees only the relay's address,
  so without these every visitor would share one rate limit. The Worker trusts `X-Relay-IP` only with the right
  key (`visitorIp` in `../src/index.ts`).
- Turns a redirect to the workers.dev address back into one to ivanbogush.ru.
- Everything else passes through unchanged, `Origin` included, so the Worker's origin check still applies.
