"use client";

import { useEffect, useState } from "react";
import type { Locked } from "@/lib/worksLock";

export interface IndexEntry {
  id: string;
  /** the client's folder in ../peoplebrands, usually their domain */
  client: string;
  title: string;
  published: string;
  updated: string;
  story: boolean;
  pricing: boolean;
  placeholders: boolean;
}

/** where this browser keeps the token once it has opened the list */
const STORAGE_KEY = "works-token";

const fieldClass =
  "mt-1.5 w-full rounded-lg border border-line bg-white px-3.5 py-2.5 text-[16px] text-ink placeholder:text-muted/70 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20";

const bytes = (b64: string) => Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));

/** The list, if the token is right; null if it isn't. */
async function unlock(locked: Locked, token: string): Promise<IndexEntry[] | null> {
  try {
    const base = await crypto.subtle.importKey("raw", new TextEncoder().encode(token), "PBKDF2", false, ["deriveKey"]);
    const key = await crypto.subtle.deriveKey(
      { name: "PBKDF2", salt: bytes(locked.salt), iterations: locked.iter, hash: "SHA-256" },
      base,
      { name: "AES-GCM", length: 256 },
      false,
      ["decrypt"],
    );
    const plain = await crypto.subtle.decrypt({ name: "AES-GCM", iv: bytes(locked.iv) }, key, bytes(locked.data));
    return JSON.parse(new TextDecoder().decode(plain)) as IndexEntry[];
  } catch {
    return null; // a wrong token fails the authentication tag
  }
}

const readToken = () => {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
};
const writeToken = (token: string | null) => {
  try {
    if (token) localStorage.setItem(STORAGE_KEY, token);
    else localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* private mode: the token is asked for again next time */
  }
};

const formatDate = (iso: string) =>
  new Date(`${iso}T00:00:00`).toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" });

/*
 * The list of every client preview, behind a token. The token is asked for once; after it opens the list, this
 * browser keeps it (localStorage) until "forget" is pressed.
 */
export default function WorksIndex({ locked }: { locked: Locked | null }) {
  const [state, setState] = useState<"checking" | "locked" | "open">("checking");
  const [entries, setEntries] = useState<IndexEntry[]>([]);
  const [token, setToken] = useState("");
  const [busy, setBusy] = useState(false);
  const [wrong, setWrong] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const open = (list: IndexEntry[]) => {
    setEntries([...list].sort((a, b) => b.updated.localeCompare(a.updated) || b.published.localeCompare(a.published)));
    setState("open");
  };

  // a token kept from before opens the list straight away; one that no longer fits is dropped
  useEffect(() => {
    if (!locked) return setState("locked");
    const saved = readToken();
    if (!saved) return setState("locked");
    unlock(locked, saved).then((list) => {
      if (list) open(list);
      else {
        writeToken(null);
        setState("locked");
      }
    });
  }, [locked]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!locked) return;
    setBusy(true);
    setWrong(false);
    const value = token.trim();
    const list = await unlock(locked, value);
    setBusy(false);
    if (!list) return setWrong(true);
    writeToken(value);
    setToken("");
    open(list);
  };

  const forget = () => {
    writeToken(null);
    setEntries([]);
    setState("locked");
  };

  const copy = async (id: string) => {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/works/${id}/`);
      setCopied(id);
      setTimeout(() => setCopied((c) => (c === id ? null : c)), 1800);
    } catch {
      /* no clipboard access: the link is still there to open */
    }
  };

  return (
    <main className="wrap max-w-[820px] py-14 md:py-20">
      <a href="/" className="text-[15px] font-semibold text-ink">
        Иван Богуш
      </a>
      <h1 className="h2 mt-8">Превью для клиентов</h1>

      {state === "checking" && <p className="mt-6 text-muted">Проверяю доступ…</p>}

      {state === "locked" && !locked && (
        <p className="mt-6 max-w-[560px]">
          Список не собран: при сборке сайта не было токена <code className="text-[15px]">WORKS_TOKEN</code>. Он
          задаётся в <code className="text-[15px]">.env.local</code> и в секретах репозитория (Settings → Secrets and
          variables → Actions).
        </p>
      )}

      {state === "locked" && locked && (
        <form onSubmit={submit} className="mt-8 max-w-[420px]">
          <label className="block text-[15px] font-medium text-ink">
            Токен доступа
            <input
              type="password"
              name="token"
              required
              autoFocus
              autoComplete="current-password"
              spellCheck={false}
              value={token}
              onChange={(e) => {
                setToken(e.target.value);
                setWrong(false);
              }}
              aria-invalid={wrong}
              aria-describedby={wrong ? "token-wrong" : undefined}
              className={fieldClass}
            />
          </label>
          {wrong && (
            <p id="token-wrong" role="alert" className="mt-2 text-[14px] text-[#a1301f]">
              Токен не подошёл.
            </p>
          )}
          <button type="submit" disabled={busy} className="btn mt-5 disabled:opacity-60">
            {busy ? "Проверяю…" : "Открыть список"}
          </button>
          <p className="mt-4 text-[14px] text-muted">Токен сохранится в этом браузере, второй раз вводить не нужно.</p>
        </form>
      )}

      {state === "open" && (
        <>
          <div className="mt-8 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
            <p className="label">{entries.length} превью</p>
            <button type="button" onClick={forget} className="text-[14px] text-muted transition-colors hover:text-ink">
              Забыть токен в этом браузере
            </button>
          </div>

          {entries.length === 0 ? (
            <p className="mt-4">Пока ни одного превью.</p>
          ) : (
            <ul className="mt-3 divide-y divide-line border-y border-line">
              {entries.map((e) => (
                <li key={e.id} className="flex flex-wrap items-center gap-x-6 gap-y-3 py-5">
                  <div className="min-w-0 flex-1">
                    <a
                      href={`/works/${e.id}/`}
                      target="_blank"
                      rel="noopener"
                      className="text-[18px] font-semibold leading-snug text-ink transition-colors hover:text-accent"
                    >
                      {e.title}
                    </a>
                    <p className="mt-1 text-[14px] leading-[1.5] text-muted">
                      {e.client} · /works/{e.id}
                      <br />
                      {e.updated !== e.published
                        ? `обновлено ${formatDate(e.updated)}, опубликовано ${formatDate(e.published)}`
                        : `опубликовано ${formatDate(e.published)}`}
                    </p>
                    {(e.placeholders || e.pricing || !e.story) && (
                      <p className="mt-2 flex flex-wrap gap-2 text-[12.5px]">
                        {e.placeholders && <span className="rounded-md bg-[#fbeee9] px-2 py-0.5 text-[#a1301f]">заглушки вместо фото</span>}
                        {!e.story && <span className="rounded-md bg-paper px-2 py-0.5 text-body">без истории</span>}
                        {e.pricing && <span className="rounded-md bg-accentSoft px-2 py-0.5 text-accent">своя цена</span>}
                      </p>
                    )}
                  </div>
                  <div className="flex shrink-0 items-center gap-5 text-[15px]">
                    <button type="button" onClick={() => copy(e.id)} className="text-muted transition-colors hover:text-ink">
                      {copied === e.id ? "Скопировано" : "Скопировать ссылку"}
                    </button>
                    <a href={`/works/${e.id}/`} target="_blank" rel="noopener" className="link">
                      Открыть ↗
                    </a>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </main>
  );
}
