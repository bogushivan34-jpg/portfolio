import { CaseStudy, ServiceStep, SkillCategory, Audience } from "@/types";

/*
 * Every fact on this page comes from the project folders or from Ivan directly.
 * Sources, so the next edit stays honest:
 * - Trouvère: trouvere-social (Instagram @wren.trouvere), TROUVERE.APP/PR, Instagram stats given by Ivan
 *   (best reel 10 000 views / 500 likes, account at 35 followers).
 * - ArtЛогос: MusicSchoolMeta/specs.md, MGIK self-presentation; result reported by the school's owners.
 * - ПроДостояние.Крым: makam/deploy-reg-ru (page and archive counts), makam/presentation/overview.md.
 * - Мидийное место: Instagram screenshots in mgik-creative-portfolio/materials; 100–200 likes on best reels per Ivan.
 * - Южное небо Тавриды: tour/southern-sky-project, tour/flyers, MyStorage/excursions/plans.md.
 * - Photography and award: MGIK motivational letter, self-presentation, diploma scan.
 */

export const portfolioData = {
  profile: {
    name: "Иван Богуш",
    nameEn: "Ivan Bogush",
    roleRu: "SMM и PR · сайты и продвижение для частных специалистов",
    roleEn: "SMM & PR · websites and promotion for independent professionals",
    shortRoleRu: "SMM · PR · Сайты",
    shortRoleEn: "SMM · PR · Websites",
    locationRu: "Москва / удалённо",
    locationEn: "Moscow / remote",
    telegram: "@myfeelinzz",
    telegramUrl: "https://t.me/myfeelinzz",
    email: "bogushiv@mail.ru",

    heroLeadRu:
      "Делаю личный сайт, оформляю и веду соцсети, считаю, откуда приходят заявки. Для психологов, репетиторов, преподавателей и других специалистов, которые работают на себя и пока обходятся без сайта.",
    heroLeadEn:
      "I build your website, set up and run your social pages, and track where enquiries come from. For psychologists, tutors, teachers and other independent professionals who still work without a site.",

    heroMetrics: [
      { labelRu: "Просмотров Reels", labelEn: "Reel views", value: "~10 000", valueEn: "~10,000", subtextRu: "при 35 подписчиках · Trouvère", subtextEn: "on a 35-follower account · Trouvère" },
      { labelRu: "Лайков на ролик", labelEn: "Likes on one reel", value: "~500", subtextRu: "тот же ролик", subtextEn: "same reel" },
      { labelRu: "Сайтов под ключ", labelEn: "Websites built", value: "5", subtextRu: "школа, экскурсии, музейный проект, каталог, приложение", subtextEn: "school, tours, heritage project, directory, app" },
      { labelRu: "Фестиваль соцрекламы", labelEn: "Social ad festival", value: "3 место", valueEn: "3rd place", subtextRu: "«Выбери жизнь», Москва, 2024", subtextEn: "“Choose Life”, Moscow, 2024" },
    ],

    statementRu:
      "Кадр работает не тогда, когда он технически безупречен, а когда в нём есть сюжет. С сайтом и соцсетями так же: человек должен сразу понять, кто вы и почему стоит записаться.",
    statementEn:
      "A photo works not when it is technically flawless but when it has a story. A website and social pages are the same: people should see at once who you are and why they should book.",
    bioRu:
      "Начинал с фотографии: в 2022 году снимал студенческие спортивные фестивали АССК. Потом, работая в ресторане, занялся SMM: мы снимали Reels и разбирали их метрики. Затем начал делать сайты и заметил, что у многих специалистов сильная работа, но в интернете её не видно. Сейчас делаю для них сайт и соцсети как одну систему, развиваю собственный продукт Trouvère и учусь в магистратуре МГИК по программе «Креатив в коммуникациях».",
    bioEn:
      "I started in photography, shooting student sports festivals (ASSC) in 2022. Later, while working in a restaurant, I took on its social media: we shot reels and studied their numbers. Then I began building websites and noticed that many professionals do strong work that is invisible online. Now I build their site and social pages as one system, run my own product, Trouvère, and study for a master's in Creative Communications at MGIK.",

    portrait: "/images/ivan_bogush.jpg",
    portraitCaptionRu: "SMM · PR · сайты",
    portraitCaptionEn: "SMM · PR · websites",
  },

  caseStudies: [
    {
      id: "trouvere",
      number: "01",
      title: "Trouvère",
      client: "Trouvère · собственный продукт",
      clientEn: "Trouvère · my own product",
      niche: "Музыкальное образование · веб-приложение для взрослых новичков · RU / EN",
      nicheEn: "Music education · web app for adult beginners · RU / EN",
      role: "Бренд, контент, продвижение",
      roleEn: "Brand, content, promotion",
      location: "Онлайн",
      locationEn: "Online",
      period: "2026",
      image: "/images/trouvere_mobile_songs.jpg",
      phoneShots: [
        "/images/trouvere_mobile_songs.jpg",
        "/images/trouvere_mobile_village.jpg",
        "/images/trouvere_mobile_lesson.jpg",
      ],
      link: { label: "trouvere.app", url: "https://trouvere.app" },
      tagline:
        "Игровое приложение, которое учит слышать музыку. На нём я проверяю всё, что потом делаю для клиентов: бренд, Reels, каналы привлечения и аналитику.",
      taglineEn:
        "A game-like app that teaches you to hear music. It is where I test everything I later do for clients: brand, reels, acquisition channels and analytics.",
      challenge:
        "Запустить бренд и поток пользователей для нового приложения без рекламного бюджета. Из России нельзя оплатить рекламу в Meta, а платная реклама в Telegram сейчас несёт юридический риск, поэтому всё строится на контенте и собственных каналах.",
      challengeEn:
        "Launch a brand and a flow of users for a new app with no ad budget. Meta ads can't be paid for from Russia and paid Telegram ads carry legal risk right now, so everything runs on content and owned channels.",
      strategy: [
        "Бренд с нуля: имя, птичка-маскот Wren, палитра, шрифты, брендбук и набор шаблонов для обложек и слайдов.",
        "Instagram* @wren.trouvere: анимированные Reels-тесты на слух («вверх, вниз или на месте?»), серия о средневековой музыке, карусели. Лучший ролик – ~10 000 просмотров и ~500 лайков при 35 подписчиках.",
        "Каналы привлечения: Telegram-боты в тематических сообществах и собственный каталог музыкальных приложений whichmusicapp.com (74 приложения). Ссылки размечены UTM, чтобы видеть, откуда приходят люди.",
        "Следующий шаг – мини-игра для Яндекс Игр с теми же героями, на узнаваемость бренда.",
      ],
      strategyEn: [
        "A brand from scratch: name, Wren the songbird mascot, palette, type, brand guide and a template kit for covers and slides.",
        "Instagram* @wren.trouvere: animated ear-test reels (“up, down or still?”), a series on medieval music, carousels. The best reel reached ~10,000 views and ~500 likes on a 35-follower account.",
        "Acquisition channels: Telegram bots in topic communities and my own directory of music apps, whichmusicapp.com (74 apps). Links carry UTM tags so I can see where people come from.",
        "Next: a mini-game for Yandex Games with the same characters, for brand awareness.",
      ],
      results: {
        heroMetrics: [
          { label: "Просмотров лучшего Reels", labelEn: "Views, best reel", value: "~10 000", valueEn: "~10,000" },
          { label: "Лайков на этом ролике", labelEn: "Likes on that reel", value: "~500" },
          { label: "Подписчиков в аккаунте", labelEn: "Account followers", value: "35" },
          { label: "Канала привлечения работают", labelEn: "Acquisition channels live", value: "3" },
        ],
        funnelTitle: "Как люди приходят в приложение",
        funnelTitleEn: "How people reach the app",
        funnel: [
          { stage: "Reels и карусели в Instagram*", stageEn: "Reels and carousels on Instagram*", count: "~10 000", countEn: "~10,000", conversion: "работает", conversionEn: "live", description: "Просмотров у лучшего ролика: охват далеко за пределами 35 подписчиков", descriptionEn: "Views on the best reel: reach far beyond 35 followers" },
          { stage: "Telegram-боты в сообществах", stageEn: "Telegram bots in communities", count: "боты", countEn: "bots", conversion: "работает", conversionEn: "live", description: "Полезные боты для тематических чатов, с отслеживанием показов", descriptionEn: "Useful bots for topic chats, with impression tracking" },
          { stage: "Каталог whichmusicapp.com", stageEn: "whichmusicapp.com directory", count: "74 приложения", countEn: "74 apps", conversion: "работает", conversionEn: "live", description: "Встречает людей в момент выбора: «каким приложением учиться?»", descriptionEn: "Meets people while they choose: “which app should I learn with?”" },
          { stage: "trouvere.app", stageEn: "trouvere.app", count: "сайт", countEn: "site", conversion: "без регистрации", conversionEn: "no sign-up", description: "Первый урок открывается сразу, без аккаунта и скачивания", descriptionEn: "The first lesson opens at once, no account or download" },
          { stage: "Мини-игра для Яндекс Игр", stageEn: "Mini-game for Yandex Games", count: "в планах", countEn: "planned", conversion: "узнаваемость", conversionEn: "awareness", description: "Те же герои и стиль, чтобы бренд запоминался", descriptionEn: "Same characters and style, so the brand sticks" },
        ],
        source: "Цифры: статистика Instagram* аккаунта @wren.trouvere",
        sourceEn: "Figures: Instagram* insights for @wren.trouvere",
      },
      visualStyle: {
        name: "Сказочная книжка",
        nameEn: "Storybook meadow",
        palette: ["#F6EEDF", "#A99BC4", "#DDB45C", "#C06A45", "#3B3A2E"],
        typography: "Alegreya + Alegreya Sans SC + Caveat",
        description: "Пергамент, рисованные сцены и птичка Wren. Один стиль на всё: приложение, Reels, карусели и каталог.",
        descriptionEn: "Parchment, hand-drawn scenes and Wren the songbird. One style for everything: the app, reels, carousels and the directory.",
      },
      keyArtifacts: [
        { title: "Обложки Reels", titleEn: "Reel covers", type: "reels", description: "Средневековые лады, тест на слух №1 и «бас-гитара в 1250 году».", descriptionEn: "Medieval modes, ear test #1 and “a bass guitar in 1250”.", assetUrl: "/images/trouvere_reels.jpg" },
        { title: "Карусель-знакомство", titleEn: "Intro carousel", type: "brand", description: "Закреплённая карусель из 8 слайдов: что это за приложение и с чего начать.", descriptionEn: "A pinned 8-slide carousel: what the app is and where to start.", assetUrl: "/images/trouvere_carousel.jpg" },
        { title: "Каталог whichmusicapp.com", titleEn: "whichmusicapp.com directory", type: "site", description: "74 приложения для музыки с фильтрами, сравнением и подборками.", descriptionEn: "74 music apps with filters, side-by-side compare and starter kits.", assetUrl: "/images/whichmusicapp_home.jpg" },
        { title: "Урок в приложении", titleEn: "A lesson in the app", type: "site", description: "Каждый урок – сцена, а не тест.", descriptionEn: "Every lesson is a scene, not a quiz.", assetUrl: "/images/trouvere_lesson.jpg" },
      ],
    },
    {
      id: "artlogos",
      number: "02",
      title: "ArtЛогос",
      titleEn: "ArtLogos",
      client: "Музыкальная школа «ArtЛогос», Симеиз",
      clientEn: "ArtLogos music school, Simeiz",
      niche: "Частная школа · дети и взрослые · очно и онлайн",
      nicheEn: "Private school · children and adults · in person and online",
      role: "Позиционирование, стиль, сайт",
      roleEn: "Positioning, visual style, website",
      location: "Крым · онлайн",
      locationEn: "Crimea · online",
      period: "2024",
      image: "/images/artlogos_page1.jpg",
      tagline:
        "Сайт для небольшой частной школы: от разбора названия до записи на урок и оплаты онлайн. Ровно то, что нужно специалисту, который работает на себя.",
      taglineEn:
        "A website for a small private school, from unpacking its name to booking and paying for lessons online. Exactly what an independent professional needs.",
      challenge:
        "Школа работает очно в Симеизе и онлайн. Нужен был сайт, который объясняет родителям и взрослым, чем она отличается, и позволяет сразу записаться или оплатить уроки.",
      challengeEn:
        "The school teaches in person in Simeiz and online. It needed a site that explains to parents and adults what makes it different and lets them book or pay right away.",
      strategy: [
        "Позиционирование из названия: «Логос» – академизм и консерваторская школа преподавателей, «Арт» – свобода, домашнее музицирование и тепло.",
        "Стиль: антиква Playfair Display и рукописный Caveat, пергамент вместо белого фона, терракота, охра и морской синий – Симеиз, перенесённый в интерфейс.",
        "Интерактив: тренажёр «Угадай ноту» и подсказка аккордов. Человек пробует заниматься ещё до записи.",
        "Запись на пробный урок, отзывы учеников и онлайн-оплата пакетов уроков.",
      ],
      strategyEn: [
        "Positioning from the name: “Logos” is academic rigour and conservatory-trained teachers, “Art” is freedom, music at home and warmth.",
        "Style: Playfair Display with handwritten Caveat, parchment instead of white, terracotta, ochre and sea blue: Simeiz carried into the interface.",
        "Interactive pieces: a “guess the note” trainer and a chord helper, so people try a lesson before they book.",
        "Trial-lesson booking, student reviews and online payment for lesson packs.",
      ],
      results: {
        heroMetrics: [
          { label: "Форматы школы", labelEn: "School formats", value: "Очно + онлайн", valueEn: "In person + online" },
          { label: "Активных преподавателей", labelEn: "Active teachers", value: "3–4" },
          { label: "Запись и оплата", labelEn: "Booking and payment", value: "На сайте", valueEn: "On the site" },
          { label: "Отзывов родителей и учеников", labelEn: "Parent and student reviews", value: "17" },
        ],
        funnelTitle: "Результат",
        funnelTitleEn: "Outcome",
        summary:
          "Школа небольшая: одна площадка и 3–4 преподавателя. По словам владельцев, учеников сейчас достаточно, и расширяться или искать новых педагогов они не планируют. Заявки с сайта отдельно не отслеживались, поэтому процентов конверсии здесь нет.",
        summaryEn:
          "It's a small school: one venue and 3–4 teachers. The owners say they have enough students and have no plans to expand or hire more teachers. The school didn't track enquiries from the site separately, so there are no conversion percentages here.",
      },
      visualStyle: {
        name: "Post-Impressionist Editorial",
        palette: ["#F9F6F0", "#E07B60", "#C9963B", "#1E3A8A", "#2B2B2B"],
        typography: "Playfair Display + Caveat",
        description: "Пергамент, терракота и охра, органические линии вместо жёсткой геометрии – как бумага, разрезанная вручную.",
        descriptionEn: "Parchment, terracotta and ochre, organic lines instead of hard geometry, like hand-cut paper.",
      },
      keyArtifacts: [
        { title: "Тренажёр «Угадай ноту»", titleEn: "“Guess the note” trainer", type: "site", description: "Игра на первом экране: человек сразу пробует, а не читает.", descriptionEn: "A game on the first screen: people try it instead of reading.", assetUrl: "/images/artlogos_guess_note.jpg" },
        { title: "Подсказка аккордов", titleEn: "Chord helper", type: "site", description: "Снижает порог входа для новичков.", descriptionEn: "Lowers the barrier for beginners.", assetUrl: "/images/artlogos_chords_hint.jpg" },
        { title: "Отзывы", titleEn: "Reviews", type: "site", description: "Отзывы учеников и родителей.", descriptionEn: "Reviews from students and parents.", assetUrl: "/images/artlogos_reviews.jpg" },
        { title: "Форма записи", titleEn: "Booking form", type: "site", description: "Запись на пробный урок и контакты.", descriptionEn: "Trial-lesson booking and contacts.", assetUrl: "/images/artlogos_contact_form.jpg" },
      ],
    },
    {
      id: "southern-sky",
      number: "03",
      title: "Южное небо Тавриды",
      titleEn: "Southern Sky of Taurida",
      client: "Экскурсионный проект «Южное небо Тавриды»",
      clientEn: "“Southern Sky of Taurida” tour programme",
      niche: "Экскурсии и лекции · астрономы и историки-краеведы",
      nicheEn: "Tours and talks · astronomers and local historians",
      role: "Сайт с записью, флаеры",
      roleEn: "Website with booking, flyers",
      location: "Симеиз, Крым",
      locationEn: "Simeiz, Crimea",
      period: "2026",
      image: "/images/southern_sky_site.jpg",
      tagline:
        "Сайт и флаеры для программы из 12 авторских экскурсий и лекций на базе Симеизской обсерватории. Пример того, как упаковать услуги лекторов и гидов.",
      taglineEn:
        "A website and flyers for a programme of 12 original tours and talks based at the Simeiz Observatory. An example of packaging the services of lecturers and guides.",
      challenge:
        "У команды из астрономов и историков-краеведов была сильная программа, но не было места, куда отправить человека, чтобы он понял, что это, и записался.",
      challengeEn:
        "A team of astronomers and local historians had a strong programme but nowhere to send people so they could understand it and sign up.",
      strategy: [
        "Программа собрана в понятную историю: 12 экскурсий в 5 циклах, «от камня тавров до атома в крови зрителя».",
        "Сайт с описанием экскурсий, командой лекторов и формой записи.",
        "Печатные флаеры с QR-кодом, который ведёт на запись.",
      ],
      strategyEn: [
        "The programme told as one story: 12 tours in 5 cycles, “from the Taurians' stones to the atom in your blood”.",
        "A site describing the tours and the lecturers, with a booking form.",
        "Printed flyers with a QR code that leads to booking.",
      ],
      results: {
        heroMetrics: [
          { label: "Экскурсий и лекций", labelEn: "Tours and talks", value: "12" },
          { label: "Цикла в программе", labelEn: "Programme cycles", value: "5" },
          { label: "Запись", labelEn: "Booking", value: "Онлайн", valueEn: "Online" },
          { label: "Флаеры", labelEn: "Flyers", value: "С QR", valueEn: "With QR" },
        ],
        funnelTitle: "Путь человека",
        funnelTitleEn: "The visitor's path",
        funnel: [
          { stage: "Флаер или ссылка", stageEn: "Flyer or link", count: "QR", description: "Флаер ведёт прямо на программу", descriptionEn: "The flyer leads straight to the programme" },
          { stage: "Сайт с программой", stageEn: "Programme site", count: "12 экскурсий", countEn: "12 tours", description: "Что будет, сколько длится, для кого", descriptionEn: "What happens, how long, who it's for" },
          { stage: "Форма записи", stageEn: "Booking form", count: "онлайн", countEn: "online", description: "Заявка приходит команде", descriptionEn: "The request goes to the team" },
        ],
      },
      visualStyle: {
        name: "Плоский космос",
        nameEn: "Flat cosmos",
        palette: ["#0D0B2E", "#FFCB3D", "#FF8A3D", "#3EC6FF", "#2FE0B8"],
        typography: "Rubik",
        description: "Ночное небо и тёплый свет звёзд, мягкие карточки и дружелюбная иллюстрация – наука без скуки.",
        descriptionEn: "A night sky with warm starlight, soft cards and friendly illustration: science without the dullness.",
      },
      keyArtifacts: [
        { title: "Флаер «Карта звёздного неба»", titleEn: "“Star map” flyer", type: "print", description: "Две стороны: лицевая с QR-кодом и оборот с программой практикума.", descriptionEn: "Two sides: the front with a QR code and the back with the session outline.", assetUrl: "/images/southern_sky_flyers.jpg" },
        { title: "Главный экран сайта", titleEn: "Site home screen", type: "site", description: "«Земля. Небо. Я.» – программа и кнопка записи на первом экране.", descriptionEn: "“Earth. Sky. Me.” – the programme and a booking button up front.", assetUrl: "/images/southern_sky_site.jpg" },
      ],
    },
    {
      id: "prodostoyanie",
      number: "04",
      title: "ПроДостояние.Крым",
      titleEn: "ProDostoyanie.Crimea",
      client: "Проект «ПроДостояние.Крым»",
      clientEn: "ProDostoyanie.Crimea project",
      niche: "Культурное наследие народов Крыма · некоммерческий проект",
      nicheEn: "Cultural heritage of the peoples of Crimea · non-profit",
      role: "Сайт-галерея, презентация доклада",
      roleEn: "Gallery website, conference talk deck",
      location: "Бахчисарай · Санкт-Петербург",
      locationEn: "Bakhchisaray · St Petersburg",
      period: "2026",
      image: "/images/prodostoyanie_museum.jpg",
      tagline:
        "Сайт-галерея наследия народов Крыма к Всероссийской конференции Российской ассоциации реставраторов. Ничего не продаёт – показывает мастеров, их работы и инструменты.",
      taglineEn:
        "A gallery site of Crimean heritage for a national conference of the Russian Association of Restorers. It sells nothing; it shows the masters, their work and their instruments.",
      challenge:
        "Руководителю проекта нужно было выступить на конференции «Сохранение и возрождение малых исторических городов и сельских поселений» (Санкт-Петербург, 2026, секция «Нематериальное наследие») и показать проект живой площадкой, а не словами.",
      challengeEn:
        "The project lead was to speak at the conference “Preserving and Reviving Small Historic Towns and Rural Settlements” (St Petersburg, 2026, intangible heritage section) and needed to show the project as a working platform, not just slides.",
      strategy: [
        "Сайт как рабочий инструмент, а не буклет: музей из залов, архив, досье мастеров, статьи, школа.",
        "3D-зал музыкальных инструментов: кеманча, саз, дудук, сантур и давул – экспонат можно вращать и послушать.",
        "Этика: носители традиции – соавторы, а не объект съёмки. На сайте есть отдельные страницы о принципах и согласии.",
        "Презентация доклада на 15 минут. Для музея-заповедника (БИКАМЗ) – афиша концерта Анатолия Гринденко «Звук, вернувшийся из веков» в Ханском дворце, макет и печать.",
      ],
      strategyEn: [
        "The site as a working tool, not a brochure: a museum of halls, an archive, master dossiers, articles, a school.",
        "A 3D hall of musical instruments: kemancha, saz, duduk, santur and davul. Visitors can rotate each one and hear it.",
        "Ethics: tradition bearers are co-authors, not subjects. The site has dedicated pages on principles and consent.",
        "A 15-minute talk deck. For the Bakhchisaray museum-reserve: a concert poster for Anatoly Grindenko's “Sound Returned from the Ages” at the Khan's Palace, design and print.",
      ],
      results: {
        heroMetrics: [
          { label: "Страниц на сайте", labelEn: "Pages on the site", value: "2 901", valueEn: "2,901" },
          { label: "Записей в архиве", labelEn: "Archive entries", value: "2 741", valueEn: "2,741" },
          { label: "Досье мастеров", labelEn: "Master dossiers", value: "115" },
          { label: "Инструментов в 3D-зале", labelEn: "Instruments in 3D", value: "5" },
        ],
        funnelTitle: "Результат",
        funnelTitleEn: "Outcome",
        summary:
          "Это некоммерческий проект: сайт ничего не продаёт и не собирает заявки, поэтому мерить его воронкой было бы нечестно. Его задача – показать масштаб наследия и людей за ним. Результат – площадка и презентация, подготовленные к всероссийской конференции.",
        summaryEn:
          "This is a non-profit project: the site sells nothing and collects no leads, so a funnel would be the wrong measure. Its job is to show the scale of the heritage and the people behind it. The result is a platform and a talk prepared for a national conference.",
      },
      visualStyle: {
        name: "Галерея на льне",
        nameEn: "Gallery on linen",
        palette: ["#F7F5F3", "#0D0D0D", "#6E6A69", "#9A9796"],
        typography: "Контрастная антиква + гротеск",
        description: "Тёплый льняной фон и монохромный интерфейс: цвет на странице дают только работы мастеров.",
        descriptionEn: "A warm linen ground and a monochrome interface: the only colour on the page comes from the masters' work.",
      },
      keyArtifacts: [
        { title: "Афиша концерта для БИКАМЗ", titleEn: "Concert poster for the museum", type: "print", description: "Цифровой макет и отпечатанный тираж. Ханский дворец, Бахчисарай, 20 февраля 2026.", descriptionEn: "Digital layout and the printed run. Khan's Palace, Bakhchisaray, 20 February 2026.", assetUrl: "/images/bikamz_poster.jpg" },
        { title: "Раздел «Школа»", titleEn: "The School section", type: "site", description: "126 текстов, 115 мастеров, мастер-классы – уроки ведут сами носители традиции.", descriptionEn: "126 texts, 115 masters, workshops: lessons are led by the tradition bearers themselves.", assetUrl: "/images/prodostoyanie_school.jpg" },
      ],
    },
    {
      id: "restaurant",
      number: "05",
      title: "Мидийное место",
      titleEn: "Midiynoe Mesto",
      client: "Ресторан «Мидийное место», ВДНХ",
      clientEn: "Midiynoe Mesto restaurant, VDNKh",
      niche: "Ресторан морепродуктов · локальная аудитория",
      nicheEn: "Seafood restaurant · local audience",
      role: "Сценарии, съёмка и монтаж Reels",
      roleEn: "Reel scripts, shooting and editing",
      location: "Москва",
      locationEn: "Moscow",
      period: "2026",
      image: "/images/restaurant_reels_a.jpg",
      inHero: false,
      tagline:
        "Короткие вертикальные ролики для ресторана: бытовые сценки из зала и с бара, снятые на телефон прямо в смену.",
      taglineEn:
        "Short vertical videos for a restaurant: everyday scenes from the floor and the bar, shot on a phone during the shift.",
      challenge:
        "Вести Instagram* ресторана без продакшн-бюджета: снимать в рабочее время, с командой в кадре, и разбирать, какие ролики смотрят, а какие пролистывают.",
      challengeEn:
        "Run the restaurant's Instagram* with no production budget: shoot during working hours with the team on camera, and work out which reels people watch and which they skip.",
      strategy: [
        "Формат: короткие сценки с крючком-подписью в первом кадре – «Когда заказал всё самое любимое, но не знаешь, с чего начать», «Извините, мы не можем положить мидии в вашу тару».",
        "Съёмка на телефон в зале и за баром: живые люди вместо постановочных фото блюд.",
        "Разбор каждого ролика: просмотры, досмотры, сохранения – и выводы для следующего сценария.",
      ],
      strategyEn: [
        "Format: short scenes with a hook caption on the first frame: “When you ordered all your favourites and don't know where to start”, “Sorry, we can't put mussels in your container”.",
        "Phone shooting on the floor and behind the bar: real people instead of staged food shots.",
        "Every reel reviewed: views, watch-through, saves, and lessons for the next script.",
      ],
      results: {
        heroMetrics: [
          { label: "Лайков у лучших роликов", labelEn: "Likes on the best reels", value: "100–200" },
          { label: "Съёмка", labelEn: "Shooting", value: "В смену", valueEn: "On shift" },
        ],
        funnelTitle: "Результат",
        funnelTitleEn: "Outcome",
        summary:
          "Для локального ресторана 100–200 лайков на ролик – хороший уровень: аудитория такого аккаунта – гости и жители района, а не вся страна. Снято без отдельного бюджета на продакшн.",
        summaryEn:
          "For a local restaurant, 100–200 likes per reel is a good level: the audience is guests and people nearby, not the whole country. All shot with no separate production budget.",
        source: "Цифры: статистика Instagram* ресторана",
        sourceEn: "Figures: the restaurant's Instagram* insights",
      },
      visualStyle: {
        name: "Живая съёмка 9:16",
        nameEn: "Live 9:16 footage",
        description: "Без фильтров и постановки: свет зала, команда в форме, настоящая подача блюд.",
        descriptionEn: "No filters or staging: the room's own light, the team in uniform, real plates.",
      },
      keyArtifacts: [
        { title: "Ролики из зала и с бара", titleEn: "Reels from the floor and bar", type: "reels", description: "Скриншоты опубликованных Reels.", descriptionEn: "Screenshots of published reels.", assetUrl: "/images/restaurant_reels_a.jpg" },
        { title: "Ещё три ролика", titleEn: "Three more reels", type: "reels", description: "Тот же формат: сценка, подпись-крючок, живая подача.", descriptionEn: "Same format: a scene, a hook caption, real service.", assetUrl: "/images/restaurant_reels_b.jpg" },
      ],
    },
    {
      id: "photo",
      number: "06",
      title: "Репортажная фотография",
      titleEn: "Reportage photography",
      client: "АССК и студенческие соревнования",
      clientEn: "ASSC and student competitions",
      niche: "Спорт · фестивали · мероприятия",
      nicheEn: "Sport · festivals · events",
      role: "Фотограф",
      roleEn: "Photographer",
      location: "Москва",
      locationEn: "Moscow",
      period: "2022",
      image: "/images/photo_assk_volleyball.jpg",
      tagline:
        "С этого всё началось: две камеры, маленький бюджет и понимание, что кадр работает, когда в нём есть сюжет.",
      taglineEn:
        "Where it all started: two cameras, a small budget and the lesson that a photo works when it has a story.",
      challenge:
        "Снимать студенческие спортивные фестивали АССК и коммерческие мероприятия так, чтобы фотографии хотелось публиковать.",
      challengeEn:
        "Shoot ASSC student sports festivals and commercial events so the photos are worth publishing.",
      strategy: [
        "Две камеры под разные задачи: портретная и широкоугольная съёмка.",
        "Ставка на момент: прыжок в воздухе, эмоция у сетки, свет над стадионом.",
        "Отбор: из сотни кадров публикуется тот один, который работает.",
      ],
      strategyEn: [
        "Two cameras for different jobs: portrait and wide-angle.",
        "Betting on the moment: a jump in mid-air, emotion at the net, light over the stadium.",
        "Selection: out of a hundred frames, publish the one that works.",
      ],
      results: {
        heroMetrics: [
          { label: "Камеры: портрет и широкий угол", labelEn: "Cameras: portrait and wide", value: "2" },
          { label: "Студенческий спорт", labelEn: "Student sport", value: "АССК", valueEn: "ASSC" },
        ],
      },
      visualStyle: {
        name: "Репортаж",
        nameEn: "Reportage",
        description: "Естественный свет залов и стадионов, движение и лица в моменте.",
        descriptionEn: "The natural light of halls and stadiums, motion and faces in the moment.",
      },
      keyArtifacts: [
        { title: "Скакалка и фестиваль", titleEn: "Rope skipping and a festival", type: "photo", description: "Соревнования АССК и студенческий фестиваль.", descriptionEn: "An ASSC competition and a student festival.", assetUrl: "/images/photo_vertical_pair.jpg" },
        { title: "Университетский хоккей", titleEn: "University hockey", type: "photo", description: "Соревнования, 2022.", descriptionEn: "A competition, 2022.", assetUrl: "/images/photo_hockey_uni_2022.jpg" },
        { title: "Стадион", titleEn: "Stadium", type: "photo", description: "Зеленоград.", descriptionEn: "Zelenograd.", assetUrl: "/images/photo_stadium_zelenograd.jpg" },
      ],
    },
  ] as CaseStudy[],

  services: [
    {
      step: "01",
      title: "Разбор и позиционирование",
      titleEn: "Discovery and positioning",
      includes: "Встреча, разбор ваших услуг, клиентов и конкурентов",
      includesEn: "A call, a look at your services, clients and competitors",
      result: "Короткий текст: кто вы, для кого и почему к вам",
      resultEn: "A short text: who you are, who it's for and why you",
      description:
        "Начинаю не с картинок, а с сути. В ArtЛогос из разбора названия школы выросли и стиль, и тексты, и структура сайта.",
      descriptionEn:
        "I start with substance, not pictures. For ArtLogos, unpacking the school's name gave us the style, the copy and the site structure.",
      image: "/images/artlogos_academ.jpg",
      example: "ArtЛогос",
      exampleEn: "ArtLogos",
    },
    {
      step: "02",
      title: "Личный сайт",
      titleEn: "Your website",
      includes: "Дизайн, тексты, запуск на домене, форма заявки, по необходимости запись и онлайн-оплата",
      includesEn: "Design, copy, launch on your domain, an enquiry form, booking and online payment if needed",
      result: "Адрес, который можно дать клиенту в любом канале",
      resultEn: "One link you can give a client in any channel",
      description:
        "Сайт-визитка или сайт с разделами. Психологу – подход, услуги, отзывы и запись. Репетитору – программы, цены и пробный урок. Лектору – программа и форма записи, как у «Южного неба».",
      descriptionEn:
        "A one-page site or a site with sections. For a psychologist: approach, services, reviews and booking. For a tutor: programmes, prices and a trial lesson. For a lecturer: the programme and a sign-up form, like Southern Sky.",
      image: "/images/southern_sky_site.jpg",
      example: "Южное небо Тавриды",
      exampleEn: "Southern Sky of Taurida",
    },
    {
      step: "03",
      title: "Оформление соцсетей",
      titleEn: "Social page setup",
      includes: "Instagram*, Telegram: шапка профиля, аватар, обложки, закреплённые посты, шаблоны",
      includesEn: "Instagram*, Telegram: bio, avatar, covers, pinned posts, templates",
      result: "Профиль, по которому сразу понятно, чем вы помогаете",
      resultEn: "A profile that shows at a glance how you help",
      description:
        "Профиль и сайт выглядят как одно целое. Беру ваши цвета и шрифты и делаю шаблоны постов, чтобы вы могли публиковать и сами.",
      descriptionEn:
        "Your profile and site look like one whole. I take your colours and type and make post templates, so you can publish on your own too.",
      image: "/images/trouvere_carousel.jpg",
      example: "Trouvère",
    },
    {
      step: "04",
      title: "Ведение аккаунта",
      titleEn: "Account management",
      includes: "Контент-план, посты и карусели, Reels: сценарий, съёмка, монтаж, публикация",
      includesEn: "Content plan, posts and carousels, reels: script, shooting, editing, posting",
      result: "Регулярные публикации без вашего участия в рутине",
      resultEn: "Regular posts without the routine landing on you",
      description:
        "Снимаем на телефон, без студии – так сделаны ролики ресторана на ВДНХ. Анимированные ролики делаю сам, как Reels Trouvère: один из них набрал ~10 000 просмотров.",
      descriptionEn:
        "We shoot on a phone, no studio, the way the VDNKh restaurant reels were made. I make animated reels myself too, like Trouvère's: one reached ~10,000 views.",
      image: "/images/restaurant_reels_b.jpg",
      example: "Мидийное место",
      exampleEn: "Midiynoe Mesto",
    },
    {
      step: "05",
      title: "Аналитика",
      titleEn: "Analytics",
      includes: "UTM-метки на ссылках, счётчики на сайте, разбор статистики соцсетей",
      includesEn: "UTM-tagged links, site counters, social media insights",
      result: "Отчёт раз в месяц: откуда пришли заявки и что делать дальше",
      resultEn: "A monthly report: where enquiries came from and what to do next",
      description:
        "Смотрю не на лайки, а на путь клиента: просмотр → профиль → сайт → заявка. Так устроено привлечение в Trouvère: Instagram*, Telegram-боты и каталог ведут на сайт по размеченным ссылкам.",
      descriptionEn:
        "I look past likes to the client's path: view → profile → site → enquiry. That's how Trouvère's acquisition works: Instagram*, Telegram bots and the directory lead to the site through tagged links.",
      image: "/images/whichmusicapp_compare.jpg",
      example: "Trouvère · whichmusicapp.com",
    },
  ] as ServiceStep[],

  audiences: [
    { who: "Психологи и коучи", whoEn: "Psychologists and coaches", need: "Сайт с подходом и записью, Telegram-канал", needEn: "A site with your approach and booking, a Telegram channel" },
    { who: "Репетиторы и преподаватели", whoEn: "Tutors and teachers", need: "Программы, цены, запись на пробный урок", needEn: "Programmes, prices, trial-lesson booking" },
    { who: "Музыкальные и творческие школы", whoEn: "Music and art schools", need: "Как ArtЛогос: запись и оплата на сайте", needEn: "Like ArtLogos: booking and payment on the site" },
    { who: "Гиды и лекторы", whoEn: "Guides and lecturers", need: "Как «Южное небо»: программа, флаеры, запись", needEn: "Like Southern Sky: programme, flyers, booking" },
    { who: "Мастера и ремесленники", whoEn: "Makers and craftspeople", need: "Галерея работ и рассказ о себе", needEn: "A gallery of work and your story" },
    { who: "Небольшие кафе и студии", whoEn: "Small cafés and studios", need: "Reels и ведение аккаунта", needEn: "Reels and account management" },
  ] as Audience[],

  skillsMatrix: [
    {
      title: "Сайты",
      titleEn: "Websites",
      subtitle: "Дизайн, запуск, запись и оплата",
      subtitleEn: "Design, launch, booking and payment",
      skills: [
        { name: "Дизайн сайтов в Figma", nameEn: "Website design in Figma", note: "ArtЛогос, Южное небо", noteEn: "ArtLogos, Southern Sky" },
        { name: "Сборка и запуск: Next.js, статические сайты", nameEn: "Build and launch: Next.js, static sites", note: "ПроДостояние, whichmusicapp.com", noteEn: "ProDostoyanie, whichmusicapp.com" },
        { name: "Хостинг и домены: reg.ru, Cloudflare", nameEn: "Hosting and domains: reg.ru, Cloudflare", note: "ПроДостояние, Trouvère", noteEn: "ProDostoyanie, Trouvère" },
        { name: "Формы записи и онлайн-оплата", nameEn: "Booking forms and online payment", note: "Робокасса, ArtЛогос", noteEn: "Robokassa, ArtLogos" },
        { name: "Интерактив и 3D на сайте", nameEn: "Interactive pieces and 3D", note: "тренажёр нот, 3D-зал инструментов", noteEn: "note trainer, 3D instrument hall" },
      ],
    },
    {
      title: "Соцсети и контент",
      titleEn: "Social and content",
      subtitle: "Оформление, ведение, ролики",
      subtitleEn: "Setup, management, video",
      skills: [
        { name: "Instagram*, Telegram · оформление и ведение", nameEn: "Instagram*, Telegram · setup and management", note: "Trouvère, ресторан на ВДНХ", noteEn: "Trouvère, VDNKh restaurant" },
        { name: "Reels: сценарий, съёмка на телефон, монтаж", nameEn: "Reels: script, phone shooting, editing", note: "Мидийное место", noteEn: "Midiynoe Mesto" },
        { name: "Анимированные ролики и карусели", nameEn: "Animated reels and carousels", note: "Trouvère", noteEn: "Trouvère" },
        { name: "Telegram-боты", nameEn: "Telegram bots", note: "каналы привлечения Trouvère", noteEn: "Trouvère acquisition channels" },
      ],
    },
    {
      title: "Дизайн и фото",
      titleEn: "Design and photo",
      subtitle: "Бренд, полиграфия, съёмка",
      subtitleEn: "Brand, print, photography",
      skills: [
        { name: "Фирменный стиль и брендбук", nameEn: "Visual identity and brand guide", note: "Trouvère, ArtЛогос", noteEn: "Trouvère, ArtLogos" },
        { name: "Афиши, флаеры, печать", nameEn: "Posters, flyers, print", note: "афиша для БИКАМЗ, флаеры экскурсий", noteEn: "museum poster, tour flyers" },
        { name: "Презентации", nameEn: "Presentations", note: "доклад для конференции", noteEn: "conference talk" },
        { name: "Репортажная фотосъёмка", nameEn: "Reportage photography", note: "АССК, с 2022 года", noteEn: "ASSC, since 2022" },
        { name: "Нейросети в продакшене", nameEn: "Generative AI in production", note: "иллюстрации и анимация", noteEn: "illustration and animation" },
      ],
    },
    {
      title: "Аналитика",
      titleEn: "Analytics",
      subtitle: "Откуда приходят заявки",
      subtitleEn: "Where enquiries come from",
      skills: [
        { name: "UTM-разметка и счётчики", nameEn: "UTM tagging and counters", note: "Trouvère", noteEn: "Trouvère" },
        { name: "Статистика Instagram*", nameEn: "Instagram* insights", note: "просмотры, досмотры, сохранения", noteEn: "views, watch-through, saves" },
        { name: "Метрики воронки: CPV, CPF, CPL, ДРР", nameEn: "Funnel metrics: CPV, CPF, CPL, ad cost share", note: "разбор роликов ресторана", noteEn: "restaurant reel reviews" },
        { name: "Яндекс Метрика", nameEn: "Yandex Metrica", note: "цели и источники заявок", noteEn: "goals and enquiry sources" },
      ],
    },
  ] as SkillCategory[],
};
