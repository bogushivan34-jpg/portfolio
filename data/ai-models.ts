/*
 * The free AI models the assistant built into a client's site runs on, and how many questions a day they cover.
 * Shown in the «?» note beside «ИИ-помощник на сайте» at /services (data/content.ts builds the sentence).
 *
 * Edit the names as the models change: keep each in quotes, separated by commas. Two names or four work too:
 * the note joins them with commas and «или» before the last.
 */
export const aiModels = ["Qwen3.8-27", "Gemini 3.5 Flash-Lite", "DeepSeek V4 Flash"];

/** the daily limit the note names */
export const aiRequestsPerDay = 1000;
