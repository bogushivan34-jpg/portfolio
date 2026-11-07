import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://ivanbogush.ru"),
  title: "Иван Богуш · сайт, соцсети и продвижение для частных специалистов",
  description:
    "Делаю личный сайт, оформляю и веду соцсети, считаю, откуда приходят заявки. Для психологов, репетиторов, преподавателей и других специалистов, которые работают на себя. Кейсы: Trouvère, музыкальная школа ArtЛогос, «Южное небо Тавриды», ПроДостояние.Крым.",
  keywords: [
    "Иван Богуш",
    "Ivan Bogush",
    "SMM",
    "PR",
    "сайт для психолога",
    "сайт для репетитора",
    "сайт для частного специалиста",
    "ведение соцсетей",
    "оформление Telegram",
    "Reels",
  ],
  authors: [{ name: "Иван Богуш" }],
  openGraph: {
    title: "Иван Богуш · сайт, соцсети и продвижение",
    description: "Сайт, оформление и ведение соцсетей, аналитика – для специалистов, которые работают на себя.",
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
    <html lang="ru" className="scroll-smooth">
      <body className="bg-white text-[#3e3d3a] antialiased">{children}</body>
    </html>
  );
}
