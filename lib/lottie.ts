import type { LottiePlayer } from "lottie-web";

/*
 * lottie-web's light build (SVG only, no expressions), loaded in the browser on first use. It touches `document`
 * when imported, so it can't be imported at the top of a module the static export renders.
 */
let player: Promise<LottiePlayer> | null = null;

export function loadLottie(): Promise<LottiePlayer> {
  player ??= import("lottie-web/build/player/lottie_light").then((m) => m.default);
  return player;
}
