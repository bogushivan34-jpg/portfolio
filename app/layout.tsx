import type { Metadata } from "next";
// Inter is served from this site (the @fontsource package), so the build never depends on Google Fonts.
import "@fontsource-variable/inter/wght.css";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://ivanbogush.ru"),
  title: "Иван Богуш · сайты, контент и привлечение клиентов",
  description:
    "Помогаю небольшим проектам и частным специалистам находить клиентов: сайт, контент, каналы привлечения и аналитика. Кейсы: Trouvère (30 платящих подписчиков без платной рекламы), музыкальная школа ArtЛогос, «Южное небо Тавриды», ПроДостояние.Крым.",
  keywords: [
    "Иван Богуш",
    "Ivan Bogush",
    "привлечение клиентов",
    "сайт для частного специалиста",
    "сайт для школы",
    "ведение соцсетей",
    "Reels",
    "Telegram-боты",
    "SMM",
    "PR",
  ],
  authors: [{ name: "Иван Богуш" }],
  openGraph: {
    title: "Иван Богуш · сайты, контент и привлечение клиентов",
    description:
      "Сайт, контент и каналы привлечения как одна система — и отчёт о том, что сработало.",
    images: [
      {
        url: "/images/artlogos_page1.jpg",
        width: 1631,
        height: 958,
        alt: "Сайт музыкальной школы ArtЛогос · работа Ивана Богуша",
      },
    ],
    locale: "ru_RU",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
