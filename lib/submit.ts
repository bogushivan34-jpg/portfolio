import { formEndpoint } from "@/data/content";

function endpoint() {
  if (typeof window !== "undefined" && window.location.hostname === "localhost") return formEndpoint.local;
  return formEndpoint.live;
}

/*
 * Posts a form to the site's Worker (worker/src/index.ts), on the page's own domain. `init` adds fetch options,
 * e.g. keepalive and a low priority for the preview's «Показать» (lib/track.ts).
 */
export async function submitForm(payload: Record<string, unknown>, init: RequestInit = {}): Promise<Response> {
  return fetch(endpoint(), { ...init, method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
}
