/*
 * All the copy on the page, in Russian and English.
 *
 * Every fact comes from the project folders or from Ivan directly. Sources, so the next edit stays honest:
 * - Trouvère: 30 paying monthly subscribers and 40+ Instagram followers given by Ivan (November 2026);
 *   reel figures from Instagram insights (trouvere-social/.../content-plan/src/content/posts.ts);
 *   channels from TROUVERE.APP/PR, Desktop/Bots and trouvere-social (brand kit, reels, Discord).
 * - Telegram bots: Desktop/Bots (Картограф, the MGIK schedule bot, the inspector dashboard).
 * - ArtЛогос: MusicSchoolMeta/specs.md; the outcome is reported by the school's owners.
 * - Южное небо Тавриды: tour/southern-sky-project, tour/flyers; live at неботавриды.рф (screenshot taken 10 November 2026).
 * - ArtЛогос site: live at artlogos.fun.
 * - ПроДостояние.Крым: makam/deploy-reg-ru (page and archive counts), makam/presentation.
 * - Мидийное место: Instagram screenshots; 100–200 likes on the best reels per Ivan.
 * - Education, languages, award: MGIK documents and the diploma scan.
 * - Legal name, tax status, INN and phone: given by Ivan for the YooKassa application (YOOKASSA_REQUIREMENTS.md).
 * - YooKassa: the shop is approved, per Ivan on 15 November 2026; he sends clients its payment links.
 *   Card and SBP are what the legal pages already named; correct `preview.pricing.official.pay` if the shop gives more.
 * - Prices: given by Ivan on 11 November 2026 as provisional ("not a final version"), see `prices` below.
 *
 * Where something was not measured, the copy says so. Keep it that way.
 */

import { aiModels, aiRequestsPerDay } from "./ai-models";

export type Lang = "ru" | "en";
export type L = { ru: string; en: string };

export interface Shot {
  src: string;
  width: number;
  height: number;
  alt: L;
  caption?: L;
}

export interface CaseItem {
  id: string;
  title: L;
  meta: L;
  role: L;
  link?: { label: string; url: string };
  task: L;
  did: L[];
  result: L;
  /** A caveat about the numbers, shown under the result */
  note?: L;
  shot?: Shot;
  /** A short list shown beside the text when the case has no picture */
  panel?: { title: L; items: L[] };
}

export const profile = {
  name: { ru: "Иван Богуш", en: "Ivan Bogush" } as L,
  location: { ru: "Москва / удалённо", en: "Moscow / remote" } as L,
  telegram: "@myfeelinzz",
  telegramUrl: "https://t.me/myfeelinzz",
  email: "bogushiv@mail.ru",
  phone: "+7 999 809-02-08",
  phoneHref: "tel:+79998090208",
  portrait: "/images/ivan_bogush.jpg",
  /* Who the customer pays: shown in the footer and in the legal pages. YooKassa's review looks for these. */
  legalName: { ru: "Богуш Иван Владиславович", en: "Bogush Ivan Vladislavovich" } as L,
  taxStatus: {
    ru: "самозанятый, плательщик налога на профессиональный доход",
    en: "self-employed, professional income tax payer",
  } as L,
  inn: "673207647506",
  /* ФНС's public check of a self-employed person's status: anyone enters the INN and a date. It can't be pre-filled. */
  statusCheckUrl: "https://npd.nalog.ru/check-status/",
};

export const nav: { id: string; label: L; page?: string }[] = [
  { id: "work", label: { ru: "Кейсы", en: "Work" } },
  { id: "approach", label: { ru: "Подход", en: "Approach" } },
  // a tab of its own, not a section of the main page
  { id: "services", label: { ru: "Услуги", en: "Services" }, page: "/services/" },
  { id: "about", label: { ru: "Обо мне", en: "About" } },
];

export const hero = {
  eyebrow: {
    ru: "Сайты · контент · привлечение клиентов",
    en: "Websites · content · customer acquisition",
  } as L,
  title: {
    ru: "Помогаю небольшим проектам находить клиентов — и считаю, что сработало",
    en: "I help small businesses find customers, and I measure what worked",
  } as L,
  lead: {
    ru: "Делаю сайт, контент и каналы привлечения как одну систему: человек узнаёт о вас, понимает, чем вы полезны, и записывается или платит. Сначала проверяю всё на собственном продукте: у Trouvère 30 платящих подписчиков без платной рекламы.",
    en: "I build the website, the content and the acquisition channels as one system: people find you, see how you can help, and book or pay. I test it all on my own product first: Trouvère has 30 paying subscribers with no paid ads.",
  } as L,
  primaryCta: { ru: "Написать в Telegram", en: "Message me on Telegram" } as L,
  secondaryCta: { ru: "Посмотреть кейсы", en: "See the work" } as L,
};

export const proof: { value: L; label: L }[] = [
  {
    value: { ru: "30", en: "30" },
    label: {
      ru: "платящих подписчиков у Trouvère, без платной рекламы",
      en: "paying subscribers at Trouvère, with no paid ads",
    },
  },
  {
    value: { ru: "~10 000", en: "~10,000" },
    label: {
      ru: "просмотров одного Reels на аккаунте с 40 подписчиками",
      en: "views on one reel, from an account with 40 followers",
    },
  },
  {
    value: { ru: "5", en: "5" },
    label: {
      ru: "сайтов под ключ: школа, экскурсии, музейный проект, каталог, приложение",
      en: "websites delivered: a school, tours, a heritage project, a directory, an app",
    },
  },
  {
    value: { ru: "3 место", en: "3rd place" },
    label: {
      ru: "фестиваль социальной рекламы «Выбери жизнь», Москва, 2024",
      en: "“Choose Life” social advertising festival, Moscow, 2024",
    },
  },
];

export const workIntro = {
  title: { ru: "Кейсы", en: "Work" } as L,
  lead: {
    ru: "В каждом — задача, что я сделал и что получилось. Цифры только те, что действительно измеряли.",
    en: "Each one shows the task, what I did and what came of it. The only numbers here are ones that were actually measured.",
  } as L,
};

export const trouvere = {
  title: "Trouvère",
  meta: {
    ru: "Собственный продукт · музыкальное образование · русский и английский · 2026",
    en: "My own product · music education · English and Russian · 2026",
  } as L,
  link: { label: "trouvere.app", url: "https://trouvere.app" },
  summary: {
    ru: "Веб-приложение, которое учит взрослых новичков слышать и понимать музыку. Здесь я отвечаю за бренд, контент и привлечение — и вижу результат в оплатах, а не в лайках.",
    en: "A web app that teaches adult beginners to hear and understand music. I'm responsible for the brand, the content and acquisition, and I see the result in payments, not likes.",
  } as L,
  taskLabel: { ru: "Задача", en: "Task" } as L,
  task: {
    ru: "Найти первых платящих пользователей для нового приложения без рекламного бюджета — только контентом и собственными каналами.",
    en: "Find the first paying users for a new app with no ad budget, using only content and channels we own.",
  } as L,
  metrics: [
    {
      value: { ru: "30", en: "30" },
      label: { ru: "платящих подписчиков: ежемесячная подписка на сайте", en: "paying subscribers on a monthly plan, bought on the site" },
    },
    {
      value: { ru: "40+", en: "40+" },
      label: { ru: "подписчиков в Instagram*", en: "Instagram* followers" },
    },
    {
      value: { ru: "~10 000", en: "~10,000" },
      label: { ru: "просмотров лучшего Reels; 99% зрителей не были подписаны", en: "views on the best reel; 99% of viewers weren't followers" },
    },
    {
      value: { ru: "0 ₽", en: "$0" },
      label: { ru: "потрачено на платную рекламу", en: "spent on paid ads" },
    },
  ] as { value: L; label: L }[],
  insight: {
    ru: "Подписчиков в Instagram* чуть больше сорока, а платящих клиентов — тридцать. Мы не копим аудиторию в соцсети: каждый канал сразу ведёт человека в продукт.",
    en: "Just over forty Instagram* followers, and thirty paying customers. We don't collect an audience on social media: every channel takes people straight into the product.",
  } as L,
  channelsTitle: {
    ru: "Как набрали аудиторию без платной рекламы",
    en: "How we reached people without paid ads",
  } as L,
  channels: [
    {
      title: { ru: "Reels, которые смотрят не подписчики", en: "Reels that travel beyond followers" },
      text: {
        ru: "Короткие анимированные тесты на слух и истории о средневековой музыке. У лучшего ролика около 10 000 просмотров и 500 лайков, и почти все зрители увидели аккаунт впервые.",
        en: "Short animated ear tests and stories about medieval music. The best reel has about 10,000 views and 500 likes, and nearly every viewer was seeing the account for the first time.",
      },
    },
    {
      title: { ru: "Полезные Telegram-боты для сообществ", en: "Useful Telegram bots for communities" },
      text: {
        ru: "Бот решает задачу самого сообщества: ищет фанатские карты для игры или показывает студентам расписание. О Trouvère он упоминает одной строкой и не чаще раза в три дня.",
        en: "Each bot solves the community's own problem: finding fan-made maps for a game, or showing students their timetable. It mentions Trouvère in one line, at most once every three days.",
      },
    },
    {
      title: { ru: "Каталог музыкальных приложений", en: "A directory of music apps" },
      text: {
        ru: "whichmusicapp.com — 74 приложения с фильтрами и сравнением. Он встречает людей в тот момент, когда они выбирают, чем заниматься, и Trouvère там один из вариантов.",
        en: "whichmusicapp.com lists 74 apps with filters and side-by-side comparison. It meets people at the moment they're choosing what to learn with, and Trouvère is one of the options.",
      },
    },
    {
      title: { ru: "Первый урок без регистрации", en: "A first lesson with no sign-up" },
      text: {
        ru: "Человек из ролика или бота сразу пробует продукт: без аккаунта, скачивания и микрофона. Первый остров из 32 уроков бесплатный, подписка открывает следующий.",
        en: "Someone coming from a reel or a bot tries the product at once: no account, no download, no microphone. The first island of 32 lessons is free, and the subscription opens the next one.",
      },
    },
    {
      title: { ru: "Учёт по каждому каналу", en: "Every channel is tracked" },
      text: {
        ru: "Все ссылки размечены UTM-метками, а для ботов сделана своя панель: показы, охват, блокировки. Видно, какой канал приводит людей, а какой нет.",
        en: "Every link carries UTM tags, and the bots have their own dashboard: impressions, reach, blocks. We can see which channel brings people and which doesn't.",
      },
    },
  ] as { title: L; text: L }[],
  next: {
    ru: "Платную рекламу подключим следующим шагом. Теперь понятно, какие сообщения и каналы работают, и бюджет не уйдёт на проверку гипотез.",
    en: "Paid ads are the next step. We now know which messages and channels work, so the budget won't go on guesswork.",
  } as L,
  community: {
    title: {
      ru: "Почему такому продукту нужно сообщество",
      en: "Why a product like this needs a community",
    } as L,
    lead: {
      ru: "Trouvère живёт на подписке: человек платит, пока продолжает заниматься. Ролик или бот может привести его один раз, а возвращают привычка и люди рядом. Поэтому сообщество мы строим с самого начала, а не откладываем на потом.",
      en: "Trouvère runs on a subscription: people pay for as long as they keep learning. A reel or a bot can bring someone in once; what brings them back is a habit and other people learning alongside them. So we're building the community from the start, not leaving it for later.",
    } as L,
    points: [
      {
        title: { ru: "Повод вернуться каждую неделю", en: "A reason to come back every week" },
        text: {
          ru: "По понедельникам на Discord-сервере выходит новый тест на слух, в пятницу — ответ.",
          en: "A new ear test goes up on the Discord server every Monday, and the answer on Friday.",
        },
      },
      {
        title: { ru: "Помощь, когда застрял", en: "Help when you're stuck" },
        text: {
          ru: "В канале помощи можно задать любой вопрос, так что новичок не остаётся с уроком один на один.",
          en: "The help channel takes any question, so a beginner is never left alone with a lesson.",
        },
      },
      {
        title: { ru: "Обратная связь идёт в продукт", en: "Feedback goes into the product" },
        text: {
          ru: "В отдельном канале люди пишут, что исправить и что сделать следующим. Мы узнаём это от них, а не догадываемся.",
          en: "A separate channel is where people tell us what to fix and what to build next. We hear it from them instead of guessing.",
        },
      },
      {
        title: { ru: "Канал, который принадлежит нам", en: "A channel we own" },
        text: {
          ru: "Сервер не зависит от алгоритмов и рекламных кабинетов: до своих людей мы можем дотянуться всегда.",
          en: "The server doesn't depend on algorithms or ad platforms: we can always reach our own people.",
        },
      },
    ] as { title: L; text: L }[],
    shot: {
      src: "/images/trouvere_discord.jpg",
      width: 1600,
      height: 900,
      alt: { ru: "Баннер Discord-сервера Trouvère", en: "The Trouvère Discord server banner" },
      caption: {
        ru: "Discord-сервер оформлен в том же стиле, что приложение и соцсети",
        en: "The Discord server has the same look as the app and the social pages",
      },
    } as Shot,
  },
  brandTitle: { ru: "Бренд и медиа", en: "Brand and media" } as L,
  brand: {
    ru: "Бренд собран с нуля: имя, птичка-маскот Wren, палитра, шрифты и брендбук. Ролики, карусели и обложки делаются из одного набора шаблонов, поэтому приложение, Instagram*, Discord и каталог выглядят как одно целое, а новую серию легко продолжать.",
    en: "The brand was built from scratch: the name, Wren the songbird mascot, the palette, the type and a brand guide. Reels, carousels and covers come from one template kit, so the app, Instagram*, Discord and the directory look like one thing, and a new series is easy to continue.",
  } as L,
  phones: [
    { src: "/images/trouvere_mobile_songs.jpg", width: 780, height: 1688, alt: { ru: "Trouvère: экран песен", en: "Trouvère: the songs screen" } },
    { src: "/images/trouvere_mobile_village.jpg", width: 780, height: 1688, alt: { ru: "Trouvère: карта острова", en: "Trouvère: the island map" } },
    { src: "/images/trouvere_mobile_lesson.jpg", width: 780, height: 1688, alt: { ru: "Trouvère: урок", en: "Trouvère: a lesson" } },
  ] as Shot[],
  shots: [
    {
      src: "/images/trouvere_reels.jpg",
      width: 1800,
      height: 1274,
      alt: { ru: "Обложки Reels Trouvère", en: "Trouvère reel covers" },
      caption: { ru: "Обложки Reels: одна система на все серии", en: "Reel covers: one system for every series" },
    },
    {
      src: "/images/whichmusicapp_home.jpg",
      width: 1800,
      height: 1077,
      alt: { ru: "Каталог whichmusicapp.com", en: "The whichmusicapp.com directory" },
      caption: { ru: "Каталог whichmusicapp.com", en: "The whichmusicapp.com directory" },
    },
    {
      src: "/images/trouvere_carousel.jpg",
      width: 1800,
      height: 1274,
      alt: { ru: "Карусель-знакомство Trouvère", en: "The Trouvère intro carousel" },
      caption: { ru: "Закреплённая карусель-знакомство", en: "The pinned intro carousel" },
    },
  ] as Shot[],
};

export const caseLabels = {
  task: { ru: "Задача", en: "Task" } as L,
  did: { ru: "Что сделал", en: "What I did" } as L,
  result: { ru: "Результат", en: "Result" } as L,
  role: { ru: "Роль", en: "Role" } as L,
};

export const cases: CaseItem[] = [
  {
    id: "artlogos",
    title: { ru: "ArtЛогос", en: "ArtLogos" },
    meta: { ru: "Частная музыкальная школа · Симеиз, Крым · 2024", en: "Private music school · Simeiz, Crimea · 2024" },
    role: { ru: "Позиционирование, стиль, сайт", en: "Positioning, visual style, website" },
    link: { label: "artlogos.fun", url: "https://artlogos.fun" },
    task: {
      ru: "Школа учит очно в Симеизе и онлайн. Нужен был сайт, который объясняет родителям и взрослым ученикам, чем она отличается, и позволяет сразу записаться или оплатить уроки.",
      en: "The school teaches in person in Simeiz and online. It needed a site that explains to parents and adult students what makes it different, and lets them book or pay right away.",
    },
    did: [
      {
        ru: "Вывел позиционирование из названия: «Логос» — академическая школа преподавателей, «Арт» — свобода и музыка дома.",
        en: "Took the positioning from the name: “Logos” is the teachers' academic schooling, “Art” is freedom and music at home.",
      },
      {
        ru: "Добавил тренажёр «Угадай ноту» и подсказку аккордов: человек пробует заниматься ещё до записи.",
        en: "Added a “guess the note” trainer and a chord helper, so people try a lesson before they book.",
      },
      {
        ru: "Собрал запись на пробный урок, 17 отзывов учеников и родителей и онлайн-оплату пакетов уроков.",
        en: "Built trial-lesson booking, 17 reviews from students and parents, and online payment for lesson packs.",
      },
    ],
    result: {
      ru: "По словам владельцев, учеников сейчас достаточно: школа загружена и не ищет новых преподавателей.",
      en: "The owners say they have enough students: the school is full and isn't looking for more teachers.",
    },
    note: {
      ru: "Заявки с сайта отдельно не считали, поэтому процентов конверсии здесь нет.",
      en: "Enquiries from the site weren't tracked separately, so there are no conversion percentages here.",
    },
    shot: {
      src: "/images/artlogos_page1.jpg",
      width: 1631,
      height: 958,
      alt: { ru: "Главная страница сайта школы ArtЛогос", en: "The ArtLogos school home page" },
    },
  },
  {
    id: "southern-sky",
    title: { ru: "Южное небо Тавриды", en: "Southern Sky of Taurida" },
    meta: { ru: "Авторские экскурсии и лекции · Симеизская обсерватория · 2026", en: "Original tours and talks · Simeiz Observatory · 2026" },
    role: { ru: "Сайт с записью, флаеры", en: "Website with booking, flyers" },
    link: { label: "неботавриды.рф", url: "https://неботавриды.рф" },
    task: {
      ru: "У команды астрономов и историков-краеведов была сильная программа, но не было места, куда отправить человека, чтобы он понял, что это, и записался.",
      en: "A team of astronomers and local historians had a strong programme, but nowhere to send people so they could understand it and sign up.",
    },
    did: [
      {
        ru: "Собрал программу в понятную историю: 12 экскурсий и лекций в 5 циклах.",
        en: "Shaped the programme into one clear story: 12 tours and talks in 5 cycles.",
      },
      {
        ru: "Сделал сайт с описанием экскурсий, командой лекторов и формой записи.",
        en: "Built a site with the tours, the lecturers and a booking form.",
      },
      {
        ru: "Подготовил печатные флаеры с QR-кодом, который ведёт прямо на запись.",
        en: "Prepared printed flyers with a QR code that leads straight to booking.",
      },
    ],
    result: {
      ru: "У программы появился цельный путь от первого контакта до заявки: флаер или ссылка, сайт, запись, которая приходит команде.",
      en: "The programme now has one path from first contact to enquiry: a flyer or a link, the site, a booking that reaches the team.",
    },
    shot: {
      src: "/images/southern_sky_site.jpg",
      width: 1600,
      height: 1000,
      alt: { ru: "Главный экран сайта «Южное небо Тавриды»", en: "The Southern Sky of Taurida home screen" },
    },
  },
  {
    id: "prodostoyanie",
    title: { ru: "ПроДостояние.Крым", en: "ProDostoyanie.Crimea" },
    meta: { ru: "Наследие народов Крыма · некоммерческий проект · 2026", en: "Heritage of the peoples of Crimea · non-profit · 2026" },
    role: { ru: "Сайт-галерея, презентация доклада, афиша", en: "Gallery website, conference deck, poster" },
    task: {
      ru: "Руководителю проекта предстояло выступить на всероссийской конференции Российской ассоциации реставраторов и показать проект как работающую площадку, а не набор слайдов.",
      en: "The project lead was to speak at a national conference of the Russian Association of Restorers, and needed to show the project as a working platform rather than a set of slides.",
    },
    did: [
      {
        ru: "Сделал сайт-галерею: музей из залов, архив, досье мастеров, статьи и школа.",
        en: "Built a gallery site: a museum of halls, an archive, master dossiers, articles and a school.",
      },
      {
        ru: "Собрал 3D-зал музыкальных инструментов: экспонат можно повернуть и послушать.",
        en: "Made a 3D hall of musical instruments: each one can be rotated and heard.",
      },
      {
        ru: "Подготовил презентацию доклада на 15 минут и афишу концерта в Ханском дворце для музея-заповедника.",
        en: "Prepared a 15-minute talk deck and a concert poster for the museum-reserve at the Khan's Palace.",
      },
    ],
    result: {
      ru: "2 901 страница, 2 741 запись архива и 115 досье мастеров на одной площадке, готовой к конференции.",
      en: "2,901 pages, 2,741 archive entries and 115 master dossiers on one platform, ready for the conference.",
    },
    note: {
      ru: "Сайт ничего не продаёт и не собирает заявки, поэтому воронкой я его не измеряю.",
      en: "The site sells nothing and collects no leads, so I don't measure it as a funnel.",
    },
    shot: {
      src: "/images/prodostoyanie_museum.jpg",
      width: 1600,
      height: 950,
      alt: { ru: "Музейный раздел сайта «ПроДостояние.Крым»", en: "The museum section of the ProDostoyanie.Crimea site" },
    },
  },
  {
    id: "restaurant",
    title: { ru: "Мидийное место", en: "Midiynoe Mesto" },
    meta: { ru: "Ресторан морепродуктов · ВДНХ, Москва · 2026", en: "Seafood restaurant · VDNKh, Moscow · 2026" },
    role: { ru: "Сценарии, съёмка и монтаж Reels", en: "Reel scripts, shooting and editing" },
    task: {
      ru: "Вести Instagram* ресторана без бюджета на продакшн: снимать прямо в смену, с командой в кадре.",
      en: "Run the restaurant's Instagram* with no production budget: shoot during the shift, with the team on camera.",
    },
    did: [
      {
        ru: "Придумал формат: короткая сценка из зала с подписью-крючком в первом кадре.",
        en: "Set the format: a short scene from the floor with a hook caption on the first frame.",
      },
      {
        ru: "Снимал на телефон в зале и за баром: живые люди вместо постановочных фото блюд.",
        en: "Shot on a phone on the floor and behind the bar: real people instead of staged food photos.",
      },
      {
        ru: "Разбирал каждый ролик — просмотры, досмотры, сохранения — и менял следующий сценарий.",
        en: "Reviewed every reel for views, watch-through and saves, and changed the next script accordingly.",
      },
    ],
    result: {
      ru: "Лучшие ролики набирали 100–200 лайков. Для локального ресторана, чья аудитория — гости и жители района, это хороший уровень.",
      en: "The best reels reached 100–200 likes. For a local restaurant whose audience is its guests and neighbours, that's a good level.",
    },
    shot: {
      src: "/images/restaurant_reels_a.jpg",
      width: 1800,
      height: 1135,
      alt: { ru: "Три ролика ресторана «Мидийное место»", en: "Three reels for Midiynoe Mesto" },
    },
  },
  {
    id: "bots",
    title: { ru: "Telegram-боты и панель аналитики", en: "Telegram bots and an analytics dashboard" },
    meta: { ru: "Собственный канал привлечения для Trouvère · 2026", en: "An owned acquisition channel for Trouvère · 2026" },
    role: { ru: "Идея, разработка, аналитика", en: "Concept, development, analytics" },
    task: {
      ru: "Нужен был канал привлечения, который не зависит от рекламных кабинетов и при этом не раздражает людей.",
      en: "We needed an acquisition channel that doesn't depend on ad platforms and doesn't annoy people.",
    },
    did: [
      {
        ru: "Сделал бота-библиотеку фанатских карт для игрового сообщества: карту можно найти обычными словами.",
        en: "Built a library bot of fan-made maps for a game community: a map can be found in plain words.",
      },
      {
        ru: "Запустил бота с расписанием занятий для студентов вуза; он работает с октября 2026 года.",
        en: "Launched a class-timetable bot for university students; it has been running since October 2026.",
      },
      {
        ru: "Написал свою панель: диалоги, показы упоминаний, охват и блокировки по каждому боту в одном месте.",
        en: "Wrote my own dashboard: conversations, mentions shown, reach and blocks for every bot in one place.",
      },
    ],
    result: {
      ru: "Два бота запущены и работают в своих сообществах. Показы упоминаний видны в панели, переходы — в аналитике приложения, так что понятно, что приносит каждое сообщество.",
      en: "Two bots are live in their communities. Mentions shown appear in the dashboard and clicks in the app's analytics, so it's clear what each community brings.",
    },
    panel: {
      title: { ru: "Что видно в панели по каждому боту", en: "What the dashboard shows for each bot" },
      items: [
        { ru: "Диалоги, команды и нажатия кнопок", en: "Conversations, commands and button presses" },
        { ru: "Сколько раз показано упоминание и скольким людям", en: "How many times a mention was shown, and to how many people" },
        { ru: "Какой вариант текста показывался в каком сообществе", en: "Which wording was shown in which community" },
        { ru: "Блокировки бота в течение недели после показа", en: "Bot blocks within a week of a mention" },
        { ru: "Новые и активные пользователи, откуда они пришли", en: "New and active users, and how they arrived" },
      ],
    },
  },
];

export const approach = {
  title: { ru: "Подход", en: "Approach" } as L,
  lead: {
    ru: "Четыре правила, по которым я работаю и с клиентами, и над своим продуктом.",
    en: "Four rules I work by, for clients and for my own product.",
  } as L,
  items: [
    {
      title: { ru: "Сначала путь клиента", en: "The customer's path comes first" },
      text: {
        ru: "До дизайна выясняю, как человек о вас узнаёт, что его останавливает и где он записывается или платит. Сайт и контент строю вокруг этого пути.",
        en: "Before any design, I find out how people hear about you, what stops them, and where they book or pay. The site and the content are built around that path.",
      },
    },
    {
      title: { ru: "Внимание зарабатываю пользой", en: "Attention is earned by being useful" },
      text: {
        ru: "Тест на слух, каталог приложений, бот с расписанием: человек сначала получает что-то полезное и только потом узнаёт о продукте. Это работает и без рекламного бюджета.",
        en: "An ear test, a directory of apps, a timetable bot: people get something useful first and hear about the product second. It works even with no ad budget.",
      },
    },
    {
      title: { ru: "Считаю каждый шаг", en: "Every step is counted" },
      text: {
        ru: "Размечаю ссылки, ставлю счётчики и раз в месяц показываю, откуда пришли люди и что менять дальше. Если готового инструмента нет, пишу свой.",
        en: "I tag the links, set up counters, and once a month show where people came from and what to change next. Where no ready tool exists, I write one.",
      },
    },
    {
      title: { ru: "Честные цифры", en: "Honest numbers" },
      text: {
        ru: "Показываю реальную статистику, без накруток. Если что-то не измеряли, так и пишу — как в кейсах выше.",
        en: "I show real statistics, never inflated. Where something wasn't measured, I say so, as in the cases above.",
      },
    },
  ] as { title: L; text: L }[],
};

/*
 * The services store, its own page at /services (app/services, components/store). Each service is a tile with a
 * Lottie animation (public/lottie/<id>.json, written by scripts/build-lottie.mjs) that the visitor drags into a cart.
 * Ivan asked for it on 20 November 2026: "like a game store where you buy cool features for your site", starting
 * with these four, more to come; then for no cards, just the icons "like an app catalogue". No prices here either:
 * the cart ends in a message, not an order.
 */
export type ServiceId =
  | "site"
  | "brand"
  | "bots"
  | "seo"
  | "access"
  | "auth"
  | "pay"
  | "lang"
  | "analytics"
  | "reels"
  | "print"
  | "booking"
  | "ai"
  | "mail";

export interface StoreItem {
  id: ServiceId;
  title: L;
  subtitle: L;
  /** the tile's gradient, light (top left) to deep (bottom right); the deep one also colours its button */
  colors: [string, string];
  /** a background of its own for the tile, in place of the two-colour gradient */
  face?: string;
  /** a caveat behind a «?» beside the title */
  note?: L;
}

/** "A, B или C" */
const listOr = (names: string[], or: string) =>
  names.length < 2 ? names.join("") : `${names.slice(0, -1).join(", ")} ${or} ${names[names.length - 1]}`;
const thousands = (n: number, sep: string) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, sep);

export const services = {
  title: { ru: "Услуги", en: "Services" } as L,
  lead: {
    ru: "Соберите набор для своего проекта: перетащите в корзину то, что нужно. Стоимость и сроки посчитаю под ваш набор.",
    en: "Put together a set for your project: drag what you need into the cart. I'll work out the cost and timing for your set.",
  } as L,
  hint: {
    ru: "Иконки можно брать и бросать в корзину",
    en: "Pick up an icon and throw it in the cart",
  } as L,
  add: { ru: "В корзину", en: "Add" } as L,
  added: { ru: "В корзине", en: "In cart" } as L,
  more: { ru: "Подробнее", en: "More" } as L,
  items: [
    {
      id: "site",
      title: { ru: "Сайт под ключ", en: "Website, done for you" },
      subtitle: {
        ru: "Дизайн, тексты, запуск на домене и форма заявки",
        en: "Design, copy, launch on your domain, an enquiry form",
      },
      colors: ["#6f9bff", "#3a3fd9"],
    },
    {
      id: "brand",
      title: { ru: "Бренд для соцсетей и контент-план", en: "Social brand and content plan" },
      subtitle: {
        ru: "Оформление профиля, шаблоны постов и план публикаций",
        en: "Profile design, post templates and a posting plan",
      },
      colors: ["#ff9a6b", "#e8407a"],
    },
    {
      id: "bots",
      title: { ru: "Telegram-боты", en: "Telegram bots" },
      subtitle: {
        ru: "Запись, расписание и ответы клиентам без вашего участия",
        en: "Bookings, timetables and answers to customers, on their own",
      },
      // Telegram's blue: the tile is Telegram's paper plane with a bot attached
      colors: ["#41c3fb", "#1786d0"],
    },
    {
      id: "seo",
      title: { ru: "SEO + GEO", en: "SEO + GEO" },
      subtitle: {
        ru: "Чтобы вас находили в поиске и советовали нейросети",
        en: "Found in search engines and recommended by AI assistants",
      },
      colors: ["#4fe0a0", "#0b8f68"],
    },
    // added 20 November 2026, in Ivan's words
    {
      id: "access",
      title: { ru: "Доступ без VPN", en: "Access without a VPN" },
      subtitle: {
        ru: "Настрою сайт для пользователей из России или для России и зарубежных IP",
        en: "Set up for visitors in Russia, or for Russian and foreign IPs alike",
      },
      colors: ["#5f6b7d", "#1b2029"],
    },
    {
      id: "auth",
      title: { ru: "Пользовательская база", en: "User accounts" },
      subtitle: {
        ru: "Вход для пользователей через Google, Яндекс или другие соцсети",
        en: "Sign-in with Google, Yandex or other social networks",
      },
      colors: ["#b07dff", "#5b34e6"],
    },
    {
      id: "pay",
      title: { ru: "Онлайн-оплата на сайте", en: "Online payments on your site" },
      subtitle: { ru: "Приём платежей через ЮKassa", en: "Payments through YooKassa" },
      colors: ["#ffd166", "#ee8400"],
    },
    {
      id: "lang",
      title: { ru: "Вторая языковая версия", en: "A second language version" },
      subtitle: {
        ru: "Тот же сайт на втором языке, с переключателем",
        en: "The same site in a second language, with a switch",
      },
      colors: ["#45e3d3", "#0b8590"],
    },
    {
      id: "analytics",
      title: { ru: "Аналитика и отчёт", en: "Analytics and reports" },
      subtitle: {
        ru: "Метки на ссылках, счётчики на сайте и отчёт раз в месяц: откуда пришли заявки",
        en: "Tagged links, site counters and a monthly report on where enquiries came from",
      },
      colors: ["#5b6bff", "#1a1f78"],
    },
    {
      id: "reels",
      title: { ru: "Reels под ключ", en: "Reels, done for you" },
      subtitle: { ru: "Сценарий, съёмка и монтаж коротких видео", en: "Script, shooting and editing of short videos" },
      colors: ["#ff72b6", "#a3168f"],
    },
    {
      id: "print",
      title: { ru: "Печатные материалы с QR-кодом", en: "Print with a QR code" },
      subtitle: {
        ru: "Листовки, плакаты и визитки, которые ведут на сайт",
        en: "Flyers, posters and cards that lead to your site",
      },
      colors: ["#cdeb5a", "#4f8f0c"],
    },
    {
      id: "booking",
      title: { ru: "Онлайн-запись", en: "Online booking" },
      subtitle: {
        ru: "Клиент сам выбирает свободное время на сайте и получает напоминание",
        en: "Customers pick a free slot on the site and get a reminder",
      },
      colors: ["#ff7d6e", "#cf1f2b"],
    },
    {
      id: "ai",
      title: { ru: "ИИ-помощник на сайте", en: "AI assistant on your site" },
      subtitle: {
        ru: "Встрою на ваш сайт: отвечает клиентам на частые вопросы в любое время",
        en: "Built into your site, answering customers' common questions at any hour",
      },
      colors: ["#5cc8ff", "#7a52f4"],
      face: "linear-gradient(150deg, #5cc8ff 0%, #7a5cff 52%, #ff5fa8 100%)",
      // the models' names are in data/ai-models.ts
      note: {
        ru: `Работает на бесплатных моделях: ${listOr(aiModels, "или")}. До ${thousands(aiRequestsPerDay, " ")} запросов в день.`,
        en: `Runs on free models: ${listOr(aiModels, "or")}. Up to ${thousands(aiRequestsPerDay, ",")} requests a day.`,
      },
    },
    {
      id: "mail",
      title: { ru: "Почта на домене", en: "Email on your domain" },
      subtitle: {
        ru: "Адрес вида hello@вашсайт.ru: приём и отправка писем, а письма с сайта уходят через Resend",
        en: "An address like hello@yoursite.com: send and receive mail, and your site's emails go out through Resend",
      },
      colors: ["#ffaa5e", "#e2560b"],
    },
  ] as StoreItem[],
  cart: {
    name: { ru: "Корзина", en: "Cart" } as L,
    title: { ru: "Ваш набор", en: "Your set" } as L,
    empty: { ru: "Пока пусто. Перетащите сюда услугу.", en: "Empty for now. Drag a service in here." } as L,
    drop: { ru: "Бросайте сюда", en: "Drop it here" } as L,
    note: {
      ru: "Напишите, и я посчитаю стоимость и сроки этого набора.",
      en: "Send it to me and I'll work out the cost and timing of this set.",
    } as L,
    discuss: { ru: "Обсудить в Telegram", en: "Discuss on Telegram" } as L,
    form: { ru: "или оставить заявку", en: "or send an enquiry" } as L,
    remove: { ru: "Убрать", en: "Remove" } as L,
    close: { ru: "Закрыть", en: "Close" } as L,
    message: { ru: "Здравствуйте! Хочу обсудить набор: ", en: "Hello! I'd like to discuss this set: " } as L,
    addedNote: { ru: "добавлено в корзину", en: "added to the cart" } as L,
    removedNote: { ru: "убрано из корзины", en: "removed from the cart" } as L,
  },
  audienceLabel: { ru: "С кем работаю", en: "Who I work with" } as L,
  audience: {
    ru: "Частные специалисты — психологи, репетиторы, преподаватели; музыкальные и творческие школы; гиды и лекторы; небольшие кафе и студии; авторы собственных продуктов.",
    en: "Independent professionals such as psychologists, tutors and teachers; music and art schools; guides and lecturers; small cafés and studios; people building their own products.",
  } as L,
};

/*
 * Prices for a site. They are shown in ONE place: the pricing card of a client's preview (/works/<id>, the small
 * card over Ivan's photo, opened with «Стоимость»). The main page has no price list, by Ivan's decision of 14 November 2026.
 * PROVISIONAL: Ivan gave the figures on 11 November 2026 as "not a final version", and what each plan includes on
 * 13 November 2026. On 14 November he asked for Premium to be filled out with "what web designers are commonly
 * paid for" and then cut that list down himself (see the note in the Premium plan).
 *
 * The offer (/oferta) and the payment page (/payment) point to the sample preview, /works/sample/?open=pricing,
 * as the place where the plans and prices are published (data/works.ts). Nothing else on the site links there.
 *
 * The plans build on each other: a plan with `extends` includes everything in that plan and lists only what it adds.
 */
/** the small picture beside a feature line; drawn in components/Plans.tsx */
export type FeatureIcon =
  | "host"
  | "admin"
  | "chart"
  | "access"
  | "login"
  | "geo"
  | "telegram"
  | "pay"
  | "booking"
  | "identity"
  | "lang";

export interface Feature {
  text: L;
  icon?: FeatureIcon;
  /** not everyone needs it: shown with a small "optional" tag */
  optional?: boolean;
  /** a word in `text` that is underlined with a dashed line and explained in a hint on hover or tap */
  term?: { word: string; title: string; hint: L };
}

export interface Tier {
  id: string;
  name: L;
  /** roubles */
  price: number;
  /** the id of the plan this one builds on */
  extends?: string;
  features: Feature[];
}

export const formatPrice = (roubles: number, lang: Lang) =>
  `${String(roubles).replace(/\B(?=(\d{3})+(?!\d))/g, lang === "ru" ? " " : ",")} ₽`;

/*
 * The prepayment: a third of the price, rounded down to the hundred so that it is never more than a third
 * (14 900 → 4 900). The offer (/oferta, «Цена и оплата») says the same.
 */
export const prepayment = (roubles: number) => Math.floor(roubles / 300) * 100;

/** A plan’s name inside a sentence, in that language’s quotation marks. */
export const quoted = (name: string, lang: Lang) => (lang === "ru" ? `«${name}»` : `“${name}”`);

export const prices = {
  tiers: [
    {
      id: "basic",
      name: { ru: "Базовый", en: "Basic" },
      price: 14900,
      features: [
        {
          icon: "host",
          text: {
            ru: "Домен и хостинг: оплачу и настрою сам или подключу ваши",
            en: "Domain and hosting: I pay for and set them up, or connect yours",
          },
        },
        {
          icon: "admin",
          text: {
            ru: "Админка, сделанная под ваш сайт: публикуете новости и обновляете содержимое",
            en: "An admin page built for your site: post news and update the content",
          },
        },
      ],
    },
    {
      id: "extended",
      name: { ru: "Расширенный", en: "Extended" },
      price: 24900,
      extends: "basic",
      features: [
        /* Ivan's wording of 14 November 2026, in place of «Элементы мини-соцсети» */
        {
          icon: "access",
          text: {
            ru: "Доступ без VPN: настрою сайт для пользователей из России или для России и зарубежных IP",
            en: "Access without a VPN: I set the site up for visitors in Russia, or for Russia and foreign IPs",
          },
        },
        {
          icon: "login",
          text: {
            ru: "Вход для пользователей через Google, Яндекс или другие соцсети",
            en: "User sign-in with Google, Yandex or other social accounts",
          },
        },
        {
          icon: "geo",
          text: {
            ru: "GEO: сайт подготовлен к поиску через нейросети",
            en: "GEO: the site is prepared for AI search",
          },
          term: {
            word: "GEO",
            title: "Generative Engine Optimization",
            hint: {
              ru: "Оптимизация под генеративный поиск. Готовлю структуру, разметку и тексты сайта так, чтобы ChatGPT, Алиса и другие ИИ-ассистенты понимали, кто вы и что предлагаете, и могли сослаться на вас в ответе.",
              en: "Optimisation for generative search. I prepare the site's structure, markup and copy so that ChatGPT and other AI assistants understand who you are and what you offer, and can cite you in an answer.",
            },
          },
        },
        {
          icon: "telegram",
          text: {
            ru: "Telegram-бот: заявки с сайта приходят вам в Telegram",
            en: "A Telegram bot: enquiries from the site arrive in your Telegram",
          },
          optional: true,
        },
      ],
    },
    {
      id: "premium",
      name: { ru: "Премиум", en: "Premium" },
      price: 45000,
      extends: "extended",
      features: [
        {
          icon: "pay",
          text: {
            ru: "Онлайн-оплата на сайте: ЮKassa",
            en: "Online payment on the site: YooKassa",
          },
        },
        /*
         * The rest is from Claude's list of what a web designer is usually paid for (14 November 2026), as Ivan
         * left it. He struck four lines as "fluff, already included in cheaper plans": «фирменный стиль», copy
         * for the pages, SEO set-up and a year of small edits; don't list those as extras of any plan. Then he
         * allowed «айдентика бренда» in place of «фирменный стиль». What it consists of (the words after the
         * colon) is Claude's wording, not his.
         */
        {
          icon: "booking",
          text: {
            ru: "Онлайн-запись и интеграции: CRM, календарь, рассылки",
            en: "Online booking and integrations: CRM, calendar, mailing lists",
          },
        },
        {
          icon: "identity",
          text: {
            ru: "Айдентика бренда: логотип, цвета, шрифты, оформление соцсетей",
            en: "Brand identity: logo, colours, type and the look of your social pages",
          },
        },
        {
          icon: "lang",
          text: { ru: "Вторая языковая версия сайта", en: "A second language version of the site" },
          optional: true,
        },
      ],
    },
  ] as Tier[],
  /** the line that stands for the plan a plan builds on: "Everything in Basic, plus:" */
  everythingIn: { ru: "Всё из варианта", en: "Everything in" } as L,
  plus: { ru: "плюс", en: "plus" } as L,
  optional: { ru: "по желанию", en: "optional" } as L,
  /* The rule for the domain; "the first year" is the offer's wording (/oferta, section on third-party services). */
  domainNote: {
    ru: "Домен оплачиваю на первый год. Если он стоит дороже 1 000 ₽, его стоимость добавляется к цене.",
    en: "I pay for the domain for the first year. If it costs more than 1,000 ₽, its cost is added to the price.",
  } as L,
};

/* The documents a customer agrees to; in Russian only. Linked from the footer and the previews. */
export const legalLinks: { href: string; label: L }[] = [
  { href: "/oferta", label: { ru: "Публичная оферта", en: "Public offer" } },
  { href: "/payment", label: { ru: "Оплата и возврат", en: "Payment and refunds" } },
  { href: "/privacy", label: { ru: "Политика обработки данных", en: "Privacy policy" } },
];

export const about = {
  title: { ru: "Обо мне", en: "About" } as L,
  bio: [
    {
      ru: "Начинал с репортажной фотографии: в 2022 году снимал студенческие спортивные фестивали. Потом, работая в ресторане, занялся его соцсетями: мы снимали Reels и разбирали их статистику.",
      en: "I started in reportage photography, shooting student sports festivals in 2022. Later, while working in a restaurant, I took on its social media: we shot reels and studied their numbers.",
    },
    {
      ru: "Затем начал делать сайты и заметил, что у многих специалистов сильная работа, которую в интернете просто не видно. Сейчас делаю для них сайт, контент и каналы привлечения как одну систему и развиваю собственный продукт — Trouvère.",
      en: "Then I began building websites and noticed how many professionals do strong work that simply can't be seen online. Now I build their site, content and acquisition channels as one system, and I run my own product, Trouvère.",
    },
  ] as L[],
  facts: [
    {
      label: { ru: "Образование", en: "Education" },
      value: {
        ru: "МГИК, магистратура «Реклама и связи с общественностью», программа «Креатив в коммуникациях», 2026–2028",
        en: "MGIK (Moscow State Institute of Culture), Master's in Advertising and PR, Creative Communications programme, 2026–2028",
      },
    },
    {
      label: { ru: "Языки", en: "Languages" },
      value: {
        ru: "Английский — C1, французский — B1. Англоязычную версию Trouvère и её Instagram* веду сам",
        en: "English C1, French B1. I run Trouvère's English version and its Instagram* myself",
      },
    },
    {
      label: { ru: "Награда", en: "Award" },
      value: {
        ru: "3 место, IX Открытый фестиваль-конкурс социальной рекламы «Выбери жизнь», номинация «Мы вместе», Москва, 2024",
        en: "3rd place, 9th Open Social Advertising Festival “Choose Life”, “We Are Together” category, Moscow, 2024",
      },
    },
    {
      label: { ru: "Формат", en: "How I work" },
      value: {
        ru: "Удалённо или в Москве",
        en: "Remotely or in Moscow",
      },
    },
  ] as { label: L; value: L }[],
};

export const contact = {
  title: { ru: "Расскажите о задаче", en: "Tell me about your project" } as L,
  lead: {
    ru: "Напишите пару строк: чем вы занимаетесь и чего сейчас не хватает. Отвечу, чем могу помочь и с чего начать.",
    en: "Send me a couple of lines: what you do and what's missing right now. I'll reply with how I can help and where to start.",
  } as L,
  orDirect: { ru: "Или напрямую", en: "Or directly" } as L,
  telegramLabel: { ru: "Telegram — быстрее всего", en: "Telegram, the fastest way" } as L,
  emailLabel: { ru: "Почта", en: "Email" } as L,
  phoneLabel: { ru: "Телефон", en: "Phone" } as L,
  legalInRussian: { ru: "", en: "(in Russian)" } as L,
  disclaimer: {
    ru: "* Instagram принадлежит компании Meta, признанной экстремистской организацией и запрещённой на территории РФ.",
    en: "* Instagram is owned by Meta, which is designated an extremist organisation and banned in Russia.",
  } as L,
};

/*
 * The contact form. It posts to the Cloudflare Worker in worker/ (deployed as ivanbogush-contact), which emails the
 * enquiry through Resend. Russian ISPs slow Cloudflare down, so it goes through the relay at form.ivanbogush.ru
 * (worker/relay) first, and straight to workers.dev only if the relay can't be reached. On localhost it posts to the
 * Worker run locally instead.
 */
export const formEndpoint = {
  live: ["https://form.ivanbogush.ru", "https://ivanbogush-contact.bogushivan34.workers.dev"],
  local: ["http://localhost:8788"],
};

export const form = {
  title: { ru: "Оставить заявку", en: "Send an enquiry" } as L,
  name: { ru: "Как вас зовут", en: "Your name" } as L,
  contact: { ru: "Telegram, телефон или почта", en: "Telegram, phone or email" } as L,
  profession: { ru: "Чем вы занимаетесь", en: "What you do" } as L,
  professionHint: { ru: "Например, психолог, репетитор, школа", en: "For example, a psychologist, a tutor, a school" } as L,
  needsLabel: { ru: "Что нужно", en: "What you need" } as L,
  needs: [
    { id: "site", label: { ru: "Сайт", en: "Website" } },
    { id: "content", label: { ru: "Соцсети и контент", en: "Social pages and content" } },
    { id: "channels", label: { ru: "Каналы привлечения", en: "Acquisition channels" } },
    { id: "analytics", label: { ru: "Аналитика", en: "Analytics" } },
    { id: "unsure", label: { ru: "Пока не знаю", en: "Not sure yet" } },
  ] as { id: string; label: L }[],
  message: { ru: "Коротко о задаче", en: "Your task in a few lines" } as L,
  messageHint: {
    ru: "Например: «нет сайта, Instagram* веду от случая к случаю, хочу больше записей»",
    en: "For example: “no website, I post on Instagram* now and then, I want more bookings”",
  } as L,
  required: { ru: "обязательные поля", en: "required fields" } as L,
  consentBefore: { ru: "Даю ", en: "I give my " } as L,
  consentLink: { ru: "согласие на обработку персональных данных", en: "consent to the processing of my personal data" } as L,
  consentMiddle: { ru: " и принимаю ", en: " and accept the " } as L,
  privacyLink: { ru: "политику обработки данных", en: "privacy policy" } as L,
  consentAfter: { ru: ".", en: " (both in Russian)." } as L,
  submit: { ru: "Отправить заявку", en: "Send enquiry" } as L,
  sending: { ru: "Отправляю…", en: "Sending…" } as L,
  replyNote: { ru: "Отвечу в течение дня", en: "I reply within a day" } as L,
  sentTitle: { ru: "Заявка отправлена", en: "Enquiry sent" } as L,
  sentText: {
    ru: "Спасибо! Отвечу в течение дня по контакту, который вы оставили. Если срочно — напишите в Telegram.",
    en: "Thank you! I'll reply within a day using the contact you left. If it's urgent, message me on Telegram.",
  } as L,
  sendAnother: { ru: "Отправить ещё одну", en: "Send another" } as L,
  failTitle: { ru: "Не получилось отправить", en: "Couldn't send it" } as L,
  failText: {
    ru: "Форма сейчас не отвечает. Ваша заявка ниже — отправьте её одной кнопкой, ничего не придётся набирать заново.",
    en: "The form isn't responding right now. Your enquiry is below: send it with one button, without retyping anything.",
  } as L,
  rateLimited: {
    ru: "Слишком много попыток подряд. Подождите минуту или отправьте заявку одной из кнопок ниже.",
    en: "Too many tries in a row. Wait a minute, or send it with one of the buttons below.",
  } as L,
  viaTelegram: { ru: "Отправить в Telegram", en: "Send via Telegram" } as L,
  viaEmail: { ru: "Отправить письмом", en: "Send by email" } as L,
  back: { ru: "Назад к форме", en: "Back to the form" } as L,
  mailSubject: { ru: "Заявка с сайта", en: "Website enquiry" } as L,
};

/*
 * The preview page for a client's site concept: ivanbogush.ru/works/<id> (app/works/[id], data/works.json).
 * The pricing window shows the three options from `prices` above. A work's own `pricing` in data/works.json
 * (a price agreed for that client) replaces them.
 */
export interface Pricing {
  /** null: no figure yet, the page says it's agreed on a call */
  price: L | null;
  timeline?: L;
  includes: L[];
}

export const preview = {
  frameTitle: { ru: "Превью сайта", en: "Site preview" } as L,
  close: { ru: "Закрыть", en: "Close" } as L,

  /* The first screen, before the site: its line to the client is the work's own (data/works.ts, Intro) */
  intro: {
    show: { ru: "Показать", en: "Show me" } as L,
  },

  /* Ivan's photo in the corner of the site, and the short menu it opens */
  menu: {
    open: { ru: "Иван Богуш: заметки, отзыв, стоимость", en: "Ivan Bogush: notes, feedback, pricing" } as L,
    notes: { ru: "Заметки к сайту", en: "Notes on the site" } as L,
    feedback: { ru: "Написать, что поправить", en: "Tell me what to change" } as L,
    pricing: { ru: "Стоимость и что дальше", en: "Pricing and next steps" } as L,
    home: { ru: "Обо мне и другие работы", en: "About me and other work" } as L,
  },

  /* The story as small notes beside the photo. The story itself is in the work (data/works.json). */
  notes: {
    note: { ru: "Заметка", en: "Note" } as L,
    prev: { ru: "Предыдущая заметка", en: "Previous note" } as L,
    next: { ru: "Следующая заметка", en: "Next note" } as L,
    hide: { ru: "Скрыть заметку", en: "Hide the note" } as L,
    fold: { ru: "Свернуть в строку", en: "Fold into one line" } as L,
    unfold: { ru: "Развернуть заметку", en: "Open the note" } as L,
    seen: { ru: "Что я увидел", en: "What I saw" } as L,
    sources: { ru: "На что я опирался", en: "What this is based on" } as L,
    toFeedback: { ru: "Написать, что думаете", en: "Tell me what you think" } as L,
    toPricing: { ru: "Стоимость", en: "Pricing" } as L,
    /* the closing note of a work without a story of its own */
    endTitle: { ru: "Что скажете?", en: "What do you think?" } as L,
    endText: {
      ru: "Напишите, что поменять, — внесу правки и пришлю по этой же ссылке.",
      en: "Tell me what to change: I'll make the edits and send them at this same link.",
    } as L,
  },
  placeholders: {
    ru: "Черновик: часть фотографий пока заменена заглушками.",
    en: "Draft: some photos are placeholders for now.",
  } as L,

  feedback: {
    title: { ru: "Что скажете?", en: "What do you think?" } as L,
    lead: {
      ru: "Напишите, что нравится и что поменять: тексты, цвета, порядок блоков, что угодно. Можно писать прямо по ходу просмотра — окно не мешает листать сайт.",
      en: "Tell me what you like and what to change: copy, colours, the order of sections, anything. Write as you browse: this window doesn't block the site.",
    } as L,
    message: { ru: "Ваш отзыв", en: "Your feedback" } as L,
    messageHint: {
      ru: "Например: «первый экран нравится, а блок со школой хочется короче»",
      en: "For example: “love the first screen, the school section could be shorter”",
    } as L,
    name: { ru: "Как к вам обращаться", en: "Your name" } as L,
    contact: { ru: "Куда ответить", en: "Where to reply" } as L,
    contactHint: { ru: "Telegram, телефон или почта", en: "Telegram, phone or email" } as L,
    optional: { ru: "по желанию", en: "optional" } as L,
    submit: { ru: "Отправить отзыв", en: "Send feedback" } as L,
    sending: { ru: "Отправляю…", en: "Sending…" } as L,
    sentTitle: { ru: "Спасибо, отзыв у меня", en: "Thank you, I've got it" } as L,
    sentText: {
      ru: "Внесу правки и пришлю обновлённую версию по этой же ссылке.",
      en: "I'll make the changes and send you the updated version at this same link.",
    } as L,
    another: { ru: "Написать ещё", en: "Write more" } as L,
    failTitle: { ru: "Не получилось отправить", en: "Couldn't send it" } as L,
    failText: {
      ru: "Форма сейчас не отвечает. Отправьте отзыв одной кнопкой — текст уже подставлен.",
      en: "The form isn't responding right now. Send it with one button: the text is already filled in.",
    } as L,
    mailSubject: { ru: "Отзыв на превью сайта", en: "Feedback on the site preview" } as L,
  },

  pricing: {
    title: { ru: "Стоимость и что дальше", en: "Pricing and next steps" } as L,
    priceLabel: { ru: "Стоимость", en: "Price" } as L,
    priceOnCall: {
      ru: "Назову точную сумму после короткого созвона: она зависит от правок и того, нужны ли запись и оплата на сайте.",
      en: "I'll give you an exact figure after a short call: it depends on the edits and whether you need booking and payment on the site.",
    } as L,
    timelineLabel: { ru: "Сроки", en: "Timeline" } as L,
    includesLabel: { ru: "Что входит", en: "What's included" } as L,
    stepsLabel: { ru: "Как дальше", en: "What happens next" } as L,
    optionsLabel: { ru: "Три варианта", en: "Three options" } as L,
    choose: { ru: "Выбрать этот вариант", en: "Choose this option" } as L,
    chooseText: { ru: "Хочу вариант", en: "I'd like the option" } as L,
    /* Ivan's wording of 18 November 2026; «состав» taken out at his request, as unclear to a client */
    steps: [
      { text: { ru: "Вы смотрите превью и пишете, что поменять", en: "You look through the preview and tell me what to change" } },
      {
        text: {
          ru: "Выбираете вариант, и я подтверждаю, что именно сделаю и за какой срок — не дольше недели. Предоплата — только треть стоимости",
          en: "You choose an option, and I confirm exactly what I'll do and how long it takes: a week at most. The prepayment is only a third of the price",
        },
        // the standard plans' thirds are listed under it (Prepayments in components/Plans.tsx)
        prepayment: true,
      },
      {
        text: {
          ru: "Вношу изменения и показываю готовый сайт. Остаток оплачивается перед передачей: файлами или на вашем домене",
          en: "I make the changes and show you the finished site. The rest is paid before the handover: as files, or live on your domain",
        },
      },
    ] as { text: L; prepayment?: boolean }[],
    /*
     * Right under the steps that ask the client to pay first: the facts a client can check for themselves, so that
     * paying a stranger doesn't look like a scam. Ivan asked for it in this card only (15 November 2026), not on the
     * main page or in the first message. The INN comes from `profile.inn` and is not written into these strings.
     */
    official: {
      label: { ru: "Работаю официально", en: "I work officially" } as L,
      status: { ru: "Самозанятый, ИНН", en: "Registered self-employed in Russia, INN" } as L,
      check: { ru: "Проверить статус на сайте ФНС", en: "Check the status with the tax service" } as L,
      pay: {
        ru: "Оплата по ссылке ЮKassa: картой или через СБП. Данные карты я не получаю",
        en: "You pay by a YooKassa link: card or SBP. I never see your card details",
      } as L,
      receipt: {
        // a no-break space keeps the app's name on one line
        ru: "После оплаты вам приходит чек из «Мой налог»",
        en: "After payment you get a receipt from «Мой налог», the tax service's app",
      } as L,
    },
    contactLabel: { ru: "Связаться со мной", en: "Get in touch" } as L,
    telegramCta: { ru: "Написать в Telegram", en: "Message me on Telegram" } as L,
    telegramText: {
      ru: "Здравствуйте! Посмотрел(а) превью сайта: ",
      en: "Hello! I've looked at the site preview: ",
    } as L,
  },
};
