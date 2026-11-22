# To do: analytics screenshots for the cases

Note for Ivan, added 2026-11-23. Screenshots of real dashboards are the strongest proof a case can show,
stronger than numbers typed into the page.

Add later, saved to `public/images/` and placed in the case through `data/content.ts` (`shot` / `shots`):

- [ ] **ArtLogos.** The case now shows the funnel from the site's analytics (figures in
      `artlogos-metrics-2026-11-23.md`). The counter was removed from artlogos.fun, but Metrika keeps a removed
      counter's history in the account, so the screenshots can still be taken:
  - [ ] Metrika → Goals report (clicks on «Записаться», Telegram, VK, `tel:`; form start → submit)
  - [ ] Metrika → Scroll map / reach to «Выберите свой ритм» and to the trial form
  - [ ] Metrika → Sources, filtered to local search (Симеиз, Ялта, Крым), for the «каждый 10-й» figure
  - [ ] Google Search Console → Performance (clicks, impressions, queries like «музыкальная школа Симеиз»)
  - If a screenshot shows a different number than the case, correct the case to match the screenshot.
- [ ] **Trouvère.** Telegram bot analytics dashboard (reach, starts, conversion to the app), and the payments
      dashboard behind the 113 paying subscribers.
- [ ] **Южное небо Тавриды.** Booking count from the form and QR-code visits, once there is a season of data.

Before publishing a screenshot: crop out names, phone numbers, emails, user IDs and anything else personal.
