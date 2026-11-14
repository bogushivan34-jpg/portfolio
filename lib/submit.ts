import { formEndpoint } from "@/data/content";

function endpoints() {
  if (typeof window !== "undefined" && window.location.hostname === "localhost") return formEndpoint.local;
  return formEndpoint.live;
}

/*
 * Posts a form to the contact Worker: through the relay first (form.ivanbogush.ru), then straight to workers.dev,
 * but only when the one before couldn't be reached at all, never after it answered. `init` adds fetch options,
 * e.g. keepalive and a low priority for the preview's «Показать» (lib/track.ts).
 */
export async function submitForm(payload: Record<string, unknown>, init: RequestInit = {}): Promise<Response> {
  const body = JSON.stringify(payload);
  let lastError: unknown;
  for (const url of endpoints()) {
    try {
      return await fetch(url, { ...init, method: "POST", headers: { "Content-Type": "application/json" }, body });
    } catch (err) {
      lastError = err;
    }
  }
  throw lastError;
}
