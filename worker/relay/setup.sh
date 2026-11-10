#!/bin/sh
# The form.ivanbogush.ru relay (README.md next to this file). Russian ISPs slow Cloudflare down, so the portfolio's
# contact form posts to form.ivanbogush.ru: Caddy on a server outside Cloudflare, which hands each request to the
# Worker (ivanbogush-contact.*.workers.dev) with the visitor's address, signed with the relay key.
#
# It shares the server with the trouvere.ru relay (trouvere-backend/relay/setup.sh) and never rewrites that one's
# config: it writes only /etc/caddy/sites/portfolio.caddy and /etc/caddy/portfolio-relay.key, adds
# `import /etc/caddy/sites/*.caddy` to the Caddyfile if it isn't there yet, and reloads Caddy gracefully, so
# trouvere.ru doesn't drop a request. On a server with no Caddy yet it installs Caddy and writes a minimal Caddyfile.
#
#   scp worker/relay/setup.sh root@<ip>:portfolio-relay.sh
#   ssh -t root@<ip> sh portfolio-relay.sh
#
# The relay key: Enter keeps this server's key (or makes a new one the first time). It lives in
# /etc/caddy/portfolio-relay.key (root only). The Worker needs the same key as its RELAY_KEY secret; from
# portfolio/worker, without the key ever showing on screen:
#   ssh root@<ip> cat /etc/caddy/portfolio-relay.key | npx wrangler secret put RELAY_KEY
# Without a terminal: FORM_RELAY_KEY=<key> sh portfolio-relay.sh. Run it again any time.
# Optional: FORM_DOMAIN (default form.ivanbogush.ru), FORM_UPSTREAM (default ivanbogush-contact.bogushivan34.workers.dev).
set -eu

step() { printf '\n== %s\n' "$*"; }
fail() { printf '\n!! %s\n' "$*" >&2; exit 1; }

SITES=/etc/caddy/sites
SITE=$SITES/portfolio.caddy
KEYFILE=/etc/caddy/portfolio-relay.key
CADDYFILE=/etc/caddy/Caddyfile
IMPORT="import $SITES/*.caddy"

[ "$(id -u)" = 0 ] || fail "Run it as root."
command -v systemctl >/dev/null 2>&1 || fail "This server has no systemd."

# values this script wrote last time, read back from its own site file
kept() { sed -n "s/^# $1: //p" "$SITE" 2>/dev/null || true; }

domain=${FORM_DOMAIN:-$(kept domain)}
domain=${domain:-form.ivanbogush.ru}
upstream=${FORM_UPSTREAM:-$(kept upstream)}
upstream=${upstream:-ivanbogush-contact.bogushivan34.workers.dev}
for name in "$domain" "$upstream"; do
	case $name in "" | *[!a-z0-9.-]*) fail "Not a domain name: $name" ;; esac
done

# ───────────────────────────── the key ─────────────────────────────

step "Relay key"
old=$(cat "$KEYFILE" 2>/dev/null || true)
key=${FORM_RELAY_KEY:-}
made=""
if [ -z "$key" ] && (exec </dev/tty) 2>/dev/null; then
	if [ -n "$old" ]; then hint="Enter keeps this server's key"; else hint="Enter makes a new one"; fi
	trap 'stty echo </dev/tty 2>/dev/null' EXIT
	trap 'stty echo </dev/tty 2>/dev/null; exit 130' INT TERM
	printf 'Paste the Worker'\''s RELAY_KEY (hidden; %s): ' "$hint" >/dev/tty
	stty -echo </dev/tty
	IFS= read -r key </dev/tty || key=""
	stty echo </dev/tty
	printf '\n' >/dev/tty
	key=$(printf '%s' "${key#RELAY_KEY=}" | tr -d ' \t\r')
fi
if [ -z "$key" ] && [ -n "$old" ]; then
	key=$old
	echo "kept this server's key"
elif [ -z "$key" ]; then
	key=$(head -c 32 /dev/urandom | od -An -tx1 | tr -d ' \n')
	made=1
	echo "made a new key (the Worker needs it too: see the end)"
fi
case $key in *[!A-Za-z0-9_-]*) fail "A relay key holds only letters, digits, - and _." ;; esac
[ "${#key}" -ge 32 ] || fail "That key is ${#key} characters long; a relay key has at least 32."
[ -n "$made" ] || echo "key: ${#key} characters, ends in …$(printf '%s' "$key" | tail -c 4)"

# ───────────────────────────── Caddy ─────────────────────────────

step "Caddy"
if command -v caddy >/dev/null 2>&1; then
	echo "already installed: $(caddy version | cut -d' ' -f1)"
elif command -v apt-get >/dev/null 2>&1; then
	export DEBIAN_FRONTEND=noninteractive
	apt-get update -q
	apt-get install -y -q curl gpg ca-certificates
	curl -1sLf https://dl.cloudsmith.io/public/caddy/stable/gpg.key \
		| gpg --batch --yes --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
	curl -1sLf https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt > /etc/apt/sources.list.d/caddy-stable.list
	apt-get update -q
	apt-get install -y -q caddy
elif command -v dnf >/dev/null 2>&1; then
	dnf copr enable -y @caddy/caddy || { dnf install -y 'dnf-command(copr)' && dnf copr enable -y @caddy/caddy; }
	dnf install -y caddy
	command -v curl >/dev/null 2>&1 || dnf install -y curl
else
	fail "No apt or dnf here: pick a Debian, Ubuntu, Fedora, RHEL, Alma or Rocky image."
fi

step "Config"
mkdir -p "$SITES"
stamp=$(date +%Y%m%d-%H%M%S)
backup=""
new_caddyfile=""
old_site=""
old_key=""

# The Caddyfile is never replaced: with none, a minimal one is written; otherwise it only gains the import line.
if [ ! -f "$CADDYFILE" ]; then
	cat > "$CADDYFILE" <<CADDYFILE
# Written by the portfolio relay's setup.sh. Each relay on this server is a file in $SITES.
{
	servers {
		# HTTP/1.1 and HTTP/2 only: QUIC is often blocked in Russia, and the trouvere.ru relay broke over HTTP/3.
		protocols h1 h2
	}
}

$IMPORT
CADDYFILE
	new_caddyfile=1
	echo "wrote a minimal $CADDYFILE"
elif ! grep -qxF "$IMPORT" "$CADDYFILE"; then
	backup=$CADDYFILE.bak-$stamp
	cp -p "$CADDYFILE" "$backup"
	printf '\n# Other relays on this server, one file each (the portfolio relay is portfolio.caddy).\n%s\n' "$IMPORT" >> "$CADDYFILE"
	echo "added '$IMPORT' to $CADDYFILE (the old one is $backup)"
else
	echo "$CADDYFILE already imports $SITES"
fi

[ ! -f "$SITE" ] || { old_site=$SITE.bak-$stamp && cp -p "$SITE" "$old_site"; }
[ ! -f "$KEYFILE" ] || { old_key=$KEYFILE.bak-$stamp && cp -p "$KEYFILE" "$old_key"; }

(umask 077 && printf '%s\n' "$key" > "$KEYFILE")
(
	umask 027
	cat > "$SITE" <<SITEFILE
# Written by the portfolio relay's setup.sh (portfolio/worker/relay); run it again rather than editing here.
# domain: $domain
# upstream: $upstream
# The key below is the Worker's RELAY_KEY secret, so this file is readable by root and Caddy only.

$domain {
	reverse_proxy https://$upstream {
		# Cloudflare only answers for hostnames it serves, so ask for the Worker's, in TLS (SNI) and in Host.
		header_up Host $upstream
		transport http {
			tls_server_name $upstream
		}

		# Cloudflare sees only this server's address. The visitor's goes along, signed with the relay key, so the
		# Worker can use it for its rate limit (anyone could write X-Relay-IP; only the relay knows the key).
		header_up X-Relay-IP {remote_host}
		header_up X-Relay-Key "$key"
	}
}
SITEFILE
)
chgrp caddy "$SITE" 2>/dev/null || true

restore() {
	if [ -n "$old_site" ]; then mv "$old_site" "$SITE"; else rm -f "$SITE"; fi
	if [ -n "$old_key" ]; then mv "$old_key" "$KEYFILE"; else rm -f "$KEYFILE"; fi
	if [ -n "$backup" ]; then cp -p "$backup" "$CADDYFILE"; elif [ -n "$new_caddyfile" ]; then rm -f "$CADDYFILE"; fi
}
# the trouvere.ru relay's Caddyfile reads its values from /etc/caddy/relay.env
if ! out=$(set -a && { [ ! -f /etc/caddy/relay.env ] || . /etc/caddy/relay.env; } && caddy validate --config "$CADDYFILE" --adapter caddyfile 2>&1); then
	printf '%s\n' "$out" | tail -5
	restore
	fail "Caddy doesn't accept the config; put the old files back."
fi
rm -f "$old_site" "$old_key"
old_site=""
old_key=""
echo "$SITE and $KEYFILE written"

# ───────────────────────────── the server ─────────────────────────────

step "Firewall"
if command -v ufw >/dev/null 2>&1 && ufw status | grep -q "Status: active"; then
	ufw allow 80/tcp >/dev/null && ufw allow 443/tcp >/dev/null && echo "ufw: opened 80 and 443"
elif command -v firewall-cmd >/dev/null 2>&1 && firewall-cmd --state >/dev/null 2>&1; then
	firewall-cmd -q --permanent --add-service=http --add-service=https && firewall-cmd -q --reload && echo "firewalld: opened 80 and 443"
else
	echo "no firewall running"
fi

step "Caddy reload"
systemctl enable -q caddy
if systemctl is-active --quiet caddy; then
	# graceful: requests already in flight (trouvere.ru's too) finish on the old config
	if ! systemctl reload caddy; then
		journalctl -u caddy -n 20 --no-pager
		fail "Caddy refused the new config and kept running on the old one. The new files are in place; fix and run this again."
	fi
	echo "reloaded"
else
	systemctl start caddy
	sleep 2
	systemctl is-active --quiet caddy || { journalctl -u caddy -n 20 --no-pager; fail "Caddy didn't start."; }
	echo "started"
fi

# ───────────────────────────── checks ─────────────────────────────

step "Checks"
todo=""
here=$(curl -4 -s --max-time 10 https://1.1.1.1/cdn-cgi/trace | sed -n 's/^ip=//p' || true)

code=$(curl -s -o /dev/null -w '%{http_code}' --max-time 15 "https://$upstream/health" || true)
if [ "$code" = 200 ]; then echo "ok   this server reaches $upstream"; else echo "!!   this server can't reach https://$upstream (got $code)"; fi

relay=$(printf 'X-Relay-Key: %s\n' "$key" | curl -s --max-time 15 -H @- "https://$upstream/health" | grep -o '"relay":[a-z]*' | cut -d: -f2 || true)
if [ "$relay" = true ]; then
	echo "ok   the Worker knows this relay key"
else
	echo "--   the Worker doesn't take this key yet"
	todo="$todo
- Give the Worker this server's key, from portfolio/worker (the key never shows on screen):

    ssh root@${here:-<this server>} cat $KEYFILE | npx wrangler secret put RELAY_KEY
"
fi

points=$(getent ahostsv4 "$domain" 2>/dev/null | awk '{print $1}' | sort -u | tr '\n' ' ' | sed 's/ $//' || true)
v6=$(getent ahostsv6 "$domain" 2>/dev/null | awk '{print $1}' | grep -v '^::ffff:' | sort -u | tr '\n' ' ' || true)
if [ -n "$here" ] && [ "$points" = "$here" ]; then
	echo "ok   $domain points here ($here)"
	for i in 1 2 3 4 5 6 7 8 9 10 11 12; do
		code=$(curl -s -o /dev/null -w '%{http_code}' --max-time 10 --resolve "$domain:443:127.0.0.1" "https://$domain/health" || true)
		[ "$code" = 200 ] && break
		sleep 5
	done
	if [ "$code" = 200 ]; then
		echo "ok   https://$domain works, certificate and all"
	else
		echo "!!   https://$domain doesn't answer yet"
		todo="$todo
- https://$domain didn't come up within a minute. See why: journalctl -u caddy -n 50 --no-pager"
	fi
else
	echo "--   $domain points at ${points:-nothing}, this server is ${here:-unknown}"
	todo="$todo
- DNS (at reg.ru): an A record for $domain -> ${here:-this server's IPv4}, and no AAAA. Caddy gets the
  certificate by itself a few seconds after it points here; run this again to see every check pass."
fi
[ -z "$v6" ] || todo="$todo
- $domain also has IPv6 (AAAA) records: $v6. Delete them, unless that's this server: Let's Encrypt tries
  IPv6 first."

if [ -n "$todo" ]; then printf '\nLeft to do:%s\n' "$todo"; else printf '\nAll done: the relay is live.\n'; fi
