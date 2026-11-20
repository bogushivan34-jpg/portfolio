import type { ServiceId } from "@/data/content";

/* The small white picture of a service on its chip in the cart: a still, simplified version of its animation. */
export default function Glyph({ id }: { id: ServiceId }) {
  const common = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };

  switch (id) {
    case "site":
      return (
        <svg {...common}>
          <rect x="3.5" y="5" width="17" height="14" rx="3" />
          <path d="M3.5 9.5h17M8 14h5" />
        </svg>
      );
    case "brand":
      return (
        <svg {...common}>
          <rect x="4" y="4" width="6.5" height="6.5" rx="1.6" />
          <rect x="13.5" y="4" width="6.5" height="6.5" rx="1.6" />
          <rect x="4" y="13.5" width="6.5" height="6.5" rx="1.6" />
          <path d="M16.75 20s-3.25-1.9-3.25-4a1.6 1.6 0 0 1 3.25-.6 1.6 1.6 0 0 1 3.25.6c0 2.1-3.25 4-3.25 4Z" fill="currentColor" strokeWidth="1" />
        </svg>
      );
    case "bots":
      // Telegram's paper plane (the path of its logo, in that logo's 240×240 drawing) with a bot's dot on the tail
      return (
        <svg viewBox="38 60 150 132" aria-hidden="true">
          <path
            fill="currentColor"
            d="M54.3 118.8c35-15.2 58.3-25.3 70-30.2 33.3-13.9 40.3-16.3 44.8-16.4 1 0 3.2.2 4.7 1.4 1.2 1 1.5 2.3 1.7 3.3s.4 3.1.2 4.7c-1.8 19-9.6 65.1-13.6 86.3-1.7 9-5 12-8.2 12.3-7 .6-12.3-4.6-19-9-10.6-6.9-16.5-11.2-26.8-18-11.9-7.8-4.2-12.1 2.6-19.1 1.8-1.8 32.5-29.8 33.1-32.3.1-.3.1-1.5-.6-2.1-.7-.6-1.7-.4-2.5-.2-1.1.2-17.9 11.4-50.6 33.5-4.8 3.3-9.1 4.9-13 4.8-4.3-.1-12.5-2.4-18.7-4.4-7.5-2.4-13.5-3.7-13-7.9.3-2.2 3.3-4.4 8.9-6.7z"
          />
          <circle cx="164" cy="166" r="20" fill="#7a54fa" stroke="currentColor" strokeWidth="8" />
        </svg>
      );
    case "seo":
      return (
        <svg {...common}>
          <circle cx="10.5" cy="10.5" r="6" />
          <path d="m15 15 5 5M8.5 12.5v-1.5M10.5 12.5V9.5M12.5 12.5V8" />
        </svg>
      );
    case "access":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="8.5" />
          <ellipse cx="12" cy="12" rx="3.6" ry="8.5" />
          <path d="M3.5 12h17" />
        </svg>
      );
    case "auth":
      return (
        <svg {...common}>
          <circle cx="12" cy="8.5" r="3.5" />
          <path d="M5 19.5a7 7 0 0 1 14 0" />
        </svg>
      );
    case "pay":
      return (
        <svg {...common}>
          <rect x="3" y="6" width="18" height="12.5" rx="2.5" />
          <path d="M3 10.5h18M7 15h4" />
        </svg>
      );
    case "lang":
      return (
        <svg {...common}>
          <path d="M3.5 18.5 7.5 6l4 12.5M5 14.5h5M20.5 6v12.5M20.5 6h-3.2a3 3 0 0 0 0 6.2h3.2M18 12.2l-3.5 6.3" />
        </svg>
      );
    case "analytics":
      return (
        <svg {...common}>
          <path d="M4 4v16h16M7.5 15l4-4.5 3 2.5 5-6" />
        </svg>
      );
    case "reels":
      return (
        <svg {...common}>
          <rect x="6" y="3" width="12" height="18" rx="3" />
          <path d="M10.5 9.5v5l4-2.5z" fill="currentColor" />
        </svg>
      );
    case "print":
      return (
        <svg {...common} strokeWidth={1.8}>
          <rect x="4" y="4" width="6" height="6" rx="1" />
          <rect x="14" y="4" width="6" height="6" rx="1" />
          <rect x="4" y="14" width="6" height="6" rx="1" />
          <path d="M14 14h2.5v2.5H14zM17.5 17.5H20V20h-2.5z" fill="currentColor" />
        </svg>
      );
    case "booking":
      return (
        <svg {...common}>
          <rect x="4" y="5" width="16" height="15" rx="3" />
          <path d="M4 10h16M8.5 3v4M15.5 3v4M9 15l2 2 4-4" />
        </svg>
      );
    case "ai":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path
            fill="currentColor"
            d="M11 3.5c.7 4.6 2.6 6.5 7.2 7.2-4.6.7-6.5 2.6-7.2 7.2-.7-4.6-2.6-6.5-7.2-7.2 4.6-.7 6.5-2.6 7.2-7.2ZM18.5 14.5c.3 1.9 1.1 2.7 3 3-1.9.3-2.7 1.1-3 3-.3-1.9-1.1-2.7-3-3 1.9-.3 2.7-1.1 3-3Z"
          />
        </svg>
      );
    case "mail":
      return (
        <svg {...common}>
          <rect x="3" y="6" width="18" height="13" rx="2.5" />
          <path d="m3.5 7 8.5 6.5L20.5 7" />
        </svg>
      );
  }
}
