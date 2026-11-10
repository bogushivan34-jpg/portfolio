# form.ivanbogush.ru relay

Russian ISPs slow Cloudflare's addresses down, so the contact form posts to **form.ivanbogush.ru**: Caddy on a
server outside Cloudflare that passes each request on to the Worker at
`ivanbogush-contact.bogushivan34.workers.dev`. Nothing runs or is stored on the relay. If the relay can't be reached
at all, the form tries workers.dev directly (`formEndpoint` in `../../data/content.ts`).

It runs on the same server as the trouvere.ru relay (45.136.228.66, `trouvere-backend/relay`), as its own file:

| File on the server | What it is |
|---|---|
| `/etc/caddy/sites/portfolio.caddy` | the form.ivanbogush.ru site (root and Caddy can read it: it holds the key) |
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
- form.ivanbogush.ru points at the server, and https://form.ivanbogush.ru works.

It lists whatever is left. Usually that's:

1. **DNS at reg.ru:** an A record `form` → 45.136.228.66, and no AAAA. Caddy gets the certificate by itself a few
   seconds after it points there.
2. **The Worker's secret**, from `worker/` (the key never shows on screen):

   ```bash
   ssh root@45.136.228.66 cat /etc/caddy/portfolio-relay.key | npx wrangler secret put RELAY_KEY
   ```

Run the script again to see every check pass.

## What the relay does to each request

- Asks Cloudflare for the Worker's hostname (Host and TLS name), since Cloudflare doesn't serve form.ivanbogush.ru.
- Adds `X-Relay-IP` (the visitor's address) and `X-Relay-Key` (the key). Cloudflare sees only the relay's address,
  so without these every visitor would share one rate limit. The Worker trusts `X-Relay-IP` only with the right
  key (`visitorIp` in `../src/index.ts`).
- Everything else passes through unchanged, `Origin` included, so the Worker's CORS check still applies.
