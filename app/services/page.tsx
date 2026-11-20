import type { Metadata } from "next";
import ServicesPage from "@/components/store/ServicesPage";
import { siteCard } from "@/lib/cards";

export const metadata: Metadata = {
  title: "Услуги · Иван Богуш",
  description:
    "Сайт под ключ, бренд для соцсетей и контент-план, Telegram-боты, SEO и GEO. Соберите свой набор, а стоимость и сроки Иван посчитает под него.",
  openGraph: {
    title: "Услуги · Иван Богуш",
    description: "Соберите свой набор: сайт, контент, Telegram-боты, SEO и GEO.",
    images: [siteCard],
    locale: "ru_RU",
    type: "website",
  },
};

export default function Page() {
  return <ServicesPage />;
}
