/* =====================================================================
   ЛИЧНЫЕ ДАННЫЕ: меняйте только этот блок.
   Мета-теги для превью ссылки (title, og:*) лежат в <head> index.html,
   их нужно поправить там же: Telegram не выполняет JavaScript.
   ===================================================================== */
const CONFIG = {
  name: "AXI.",
  tagline: "Студия веб-дизайна · Сайты под ключ",

  offer: "Сайты, в которые хочется войти",
  offerText: "Проектируем и запускаем сайты под ключ. Концепция, дизайн, тексты, вёрстка и запуск в одних руках.",

  telegram: "na_farme", // без @
  email: "levtarasenko0305@gmail.com",

  facts: [
    { value: "7", label: "проектов в портфолио" },
    { value: "2–4", label: "недели на сайт под ключ" },
    { value: "24 ч", label: "ответ на заявку" },
    { value: "100%", label: "адаптивная вёрстка" },
  ],

  services: [
    { title: "Сайт под ключ", text: "Аналитика, структура, тексты, дизайн, вёрстка, домен и запуск. Вы получаете готовый сайт, который приводит заявки.", meta: "от 2 недель" },
    { title: "Веб-дизайн", text: "Концепция и макеты в Figma для десктопа и телефона. Типографика, сетка и визуальный язык под ваш бренд.", meta: "от 5 дней" },
    { title: "Лендинг", text: "Одна страница под продукт или услугу: сильный первый экран, понятная логика и форма заявки.", meta: "от 7 дней" },
    { title: "Редизайн", text: "Переосмысляем старый сайт: убираем лишнее, усиливаем доверие и переводим на современную адаптивную вёрстку.", meta: "от 10 дней" },
    { title: "Веб-приложения", text: "Личные кабинеты, онлайн-запись, Telegram Mini Apps. Когда сайту нужна логика, а не только витрина.", meta: "по задаче" },
  ],

  about: [
    "Мы работаем как небольшое архитектурное бюро, только в вебе. Сначала разбираемся в бизнесе, аудитории и задаче, потом строим структуру, и только после этого рисуем.",
    "Каждый элемент на странице должен работать. Чистая типографика, воздух и сдержанная палитра делают сайт дороже, а понятная логика превращает посетителей в клиентов.",
    "Дизайн и разработку ведём сами, поэтому макет и готовый сайт совпадают до пикселя. После запуска остаёмся на связи и помогаем с доработками.",
  ],

  stack: [
    { group: "Дизайн", items: ["Figma", "Прототипирование", "UI-кит", "Иллюстрация"] },
    { group: "Разработка", items: ["HTML / CSS", "JavaScript", "TypeScript", "React", "Vite"] },
    { group: "Запуск", items: ["SEO-основа", "Аналитика", "Хостинг и домен", "PWA"] },
  ],

  steps: [
    { title: "Бриф", text: "Короткий созвон или переписка: цели, аудитория, сроки и бюджет. Можно без ТЗ.", meta: "1 день" },
    { title: "Структура", text: "Прототип страниц и тексты. Договариваемся о логике до того, как появится дизайн.", meta: "2–3 дня" },
    { title: "Дизайн", text: "Концепция первого экрана, затем все страницы для десктопа и телефона.", meta: "5–10 дней" },
    { title: "Запуск", text: "Вёрстка, подключение форм и аналитики, домен. Передаём доступы и инструкцию.", meta: "3–7 дней" },
  ],
};

/* ===================================================================== */

const PROJECTS_URL = "projects.json";
// Ссылки на код (links.repo) на сайте не показываются: карточка ведёт на живой проект.
const LIVE_LINKS = [
  ["demo", "Открыть проект"],
  ["bot", "Открыть бота"],
];

document.documentElement.classList.add("js");

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

function el(tag, attrs = {}, children = []) {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(attrs)) {
    if (value === undefined || value === null || value === false) continue;
    if (key === "class") node.className = value;
    else if (key === "text") node.textContent = value;
    else node.setAttribute(key, value === true ? "" : value);
  }
  for (const child of [].concat(children)) {
    if (child) node.append(child);
  }
  return node;
}

const pad = (n) => String(n).padStart(2, "0");

/* ---------- Подстановка конфига ---------- */
function applyConfig() {
  const values = { ...CONFIG, telegramHandle: "@" + CONFIG.telegram };
  const hrefs = {
    telegram: "https://t.me/" + CONFIG.telegram,
    email: "mailto:" + CONFIG.email,
  };

  $$("[data-config]").forEach((node) => {
    const value = values[node.dataset.config];
    if (typeof value === "string") node.textContent = value;
  });
  $$("[data-config-href]").forEach((node) => {
    const href = hrefs[node.dataset.configHref];
    if (href) node.href = href;
  });

  const facts = $("[data-config-facts]");
  CONFIG.facts.forEach((fact) => {
    facts.append(
      el("li", { class: "fact" }, [
        el("span", { class: "fact__value", text: fact.value }),
        el("span", { class: "fact__label", text: fact.label }),
      ])
    );
  });

  const services = $("#services-list");
  CONFIG.services.forEach((item, i) => {
    services.append(
      el("li", { class: "service reveal" }, [
        el("span", { class: "service__num", text: pad(i + 1) }),
        el("h3", { class: "service__title", text: item.title }),
        el("p", { class: "service__text", text: item.text }),
        el("span", { class: "service__meta meta", text: item.meta }),
      ])
    );
  });

  const about = $("[data-config-list='about']");
  CONFIG.about.forEach((text) => about.append(el("p", { text })));

  const stack = $("#stack-groups");
  CONFIG.stack.forEach((group) => {
    stack.append(
      el("div", { class: "stack__group reveal" }, [
        el("h3", { class: "stack__title", text: group.group }),
        el("ul", { class: "tags" }, group.items.map((item) => el("li", { class: "tag", text: item }))),
      ])
    );
  });

  const steps = $("#steps");
  CONFIG.steps.forEach((step, i) => {
    steps.append(
      el("li", { class: "step reveal" }, [
        el("span", { class: "step__num", text: pad(i + 1) }),
        el("h3", { class: "step__title", text: step.title }),
        el("p", { class: "step__text", text: step.text }),
        el("span", { class: "step__meta meta", text: step.meta }),
      ])
    );
  });

  $("#year").textContent = new Date().getFullYear();
}

/* ---------- Проекты ---------- */
function projectCard(project, index) {
  const featured = project.featured === true;
  const links = project.links || {};
  const live = LIVE_LINKS.find(([type]) => links[type]);
  // макеты без живой ссылки открываются во весь экран, остальное ведёт в Telegram
  const gallery = !live && project.gallery === true && project.image;
  const href = live ? links[live[0]] : gallery ? project.image : "https://t.me/" + CONFIG.telegram;
  const ctaText = live ? live[1] : gallery ? "Смотреть макет" : "Запросить демо";

  const media = el("div", { class: "card__media" });
  if (project.image) {
    const img = el("img", {
      src: project.image,
      alt: "Проект «" + project.title + "»",
      loading: index < 2 ? "eager" : "lazy",
      decoding: "async",
      width: 1600,
      height: 968,
    });
    // если файл не найден, показываем заглушку
    img.addEventListener("error", () => img.replaceWith(placeholder(project.title)));
    media.append(img);
  } else {
    media.append(placeholder(project.title));
  }

  const link = el("a", {
    class: "card__cover-link",
    href,
    target: gallery ? null : "_blank",
    rel: gallery ? null : "noopener",
    "aria-label": ctaText + ": " + project.title,
    text: project.title,
  });
  if (gallery) {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      openLightbox(project.image, project.title);
    });
  }

  // Вся карточка кликабельна: ссылка в заголовке растянута на неё через ::after
  return el("article", { class: "card" + (featured ? " card--featured" : ""), "data-category": project.category || "" }, [
    media,
    el("div", { class: "card__body" }, [
      el("p", { class: "card__category meta", text: pad(index + 1) + " · " + (project.category || "") }),
      el("h3", { class: "card__title" }, [link]),
      el("p", { class: "card__desc", text: project.description || "" }),
      el("ul", { class: "tags", "aria-label": "Что сделано" }, (project.stack || []).map((t) => el("li", { class: "tag", text: t }))),
      el("span", { class: "card__cta", "aria-hidden": "true" }, [
        document.createTextNode(ctaText),
        el("span", { class: "card__cta-arrow", text: "→" }),
      ]),
    ]),
  ]);
}

function placeholder(title) {
  return el("div", { class: "card__placeholder", "aria-hidden": "true", text: title.split(/[\s:]+/)[0] });
}

/* ---------- Просмотр макета ---------- */
function openLightbox(src, title) {
  const dialog = $("#lightbox");
  const img = $(".lightbox__img", dialog);
  img.src = src;
  img.alt = "Макет проекта «" + title + "»";
  $(".lightbox__caption", dialog).textContent = title;
  if (typeof dialog.showModal === "function") dialog.showModal();
  else window.open(src, "_blank", "noopener");
}

function initLightbox() {
  const dialog = $("#lightbox");
  $(".lightbox__close", dialog).addEventListener("click", () => dialog.close());
  // клик по затемнённому фону закрывает окно
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) dialog.close();
  });
}

function renderFilters(projects, grid) {
  const filters = $("#filters");
  const counts = new Map();
  projects.forEach((p) => {
    if (p.category) counts.set(p.category, (counts.get(p.category) || 0) + 1);
  });
  if (counts.size < 2) {
    filters.hidden = true;
    return;
  }

  const options = [["Все", projects.length], ...counts];
  const buttons = options.map(([name, count], i) =>
    el("button", { class: "filter", type: "button", "aria-pressed": i === 0 ? "true" : "false", "data-filter": i === 0 ? "*" : name }, [
      document.createTextNode(name),
      el("sup", { class: "filter__count", text: String(count) }),
    ])
  );
  filters.append(...buttons);

  filters.addEventListener("click", (event) => {
    const button = event.target.closest(".filter");
    if (!button) return;
    const value = button.dataset.filter;
    buttons.forEach((b) => b.setAttribute("aria-pressed", String(b === button)));
    $$(".card", grid).forEach((card) => {
      card.classList.toggle("is-hidden", value !== "*" && card.dataset.category !== value);
    });
  });
}

async function loadProjects() {
  const grid = $("#projects-grid");
  try {
    const response = await fetch(PROJECTS_URL, { cache: "no-cache" });
    if (!response.ok) throw new Error("HTTP " + response.status);
    const projects = await response.json();

    // featured-проекты показываем первыми
    projects.sort((a, b) => (b.featured === true) - (a.featured === true));

    grid.replaceChildren(...projects.map((project, i) => projectCard(project, i)));
    if (projects.length === 0) {
      grid.append(el("p", { class: "projects__empty", text: "Проекты скоро появятся." }));
    }
    renderFilters(projects, grid);
    $$(".card", grid).forEach((card) => observeReveal(card));
  } catch (error) {
    console.error("Не удалось загрузить projects.json:", error);
    const message = el("p", { class: "projects__empty" });
    if (location.protocol === "file:") {
      message.append(
        "Браузер не даёт читать projects.json при открытии файла напрямую. Запустите в папке сайта ",
        el("code", { text: "python -m http.server" }),
        " и откройте http://localhost:8000. На GitHub Pages всё работает само."
      );
    } else {
      message.textContent = "Не удалось загрузить проекты. Проверьте, что в projects.json корректный JSON.";
    }
    grid.replaceChildren(message);
  }
}

/* ---------- Появление при прокрутке ---------- */
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const revealObserver =
  "IntersectionObserver" in window && !reducedMotion
    ? new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-visible");
              revealObserver.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
      )
    : null;

function observeReveal(node) {
  if (!node.classList.contains("reveal")) node.classList.add("reveal");
  if (revealObserver) revealObserver.observe(node);
  else node.classList.add("is-visible");
}

/* ---------- Навигация ---------- */
function initNav() {
  const header = $(".header");
  const toggle = $(".nav-toggle");
  const nav = $("#nav");

  const setOpen = (open) => {
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Закрыть меню" : "Открыть меню");
    nav.classList.toggle("is-open", open);
  };

  toggle.addEventListener("click", () => setOpen(toggle.getAttribute("aria-expanded") !== "true"));
  $$(".nav__link").forEach((link) => link.addEventListener("click", () => setOpen(false)));
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && nav.classList.contains("is-open")) {
      setOpen(false);
      toggle.focus();
    }
  });
  document.addEventListener("click", (e) => {
    if (nav.classList.contains("is-open") && !header.contains(e.target)) setOpen(false);
  });

  const onScroll = () => header.classList.toggle("is-scrolled", window.scrollY > 8);
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // подсветка активного пункта меню
  if ("IntersectionObserver" in window) {
    const links = new Map($$(".nav__link").map((a) => [a.getAttribute("href").slice(1), a]));
    const spy = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const link = links.get(entry.target.id);
          if (link && entry.isIntersecting) {
            links.forEach((a) => a.classList.remove("is-active"));
            link.classList.add("is-active");
          }
        });
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );
    links.forEach((_, id) => {
      const section = document.getElementById(id);
      if (section) spy.observe(section);
    });
  }
}

/* ---------- Telegram Mini App ---------- */
// Telegram добавляет в адрес #tgWebAppData=…, поэтому SDK грузим только внутри Telegram,
// обычные посетители сайта лишний скрипт не скачивают.
const IN_TELEGRAM = /tgWebApp(Data|Version|Platform)/.test(location.hash + location.search);

function initTelegram() {
  if (!IN_TELEGRAM) return;
  document.documentElement.classList.add("tg");

  const script = document.createElement("script");
  script.src = "https://telegram.org/js/telegram-web-app.js";
  script.onload = () => {
    const tg = window.Telegram && window.Telegram.WebApp;
    if (!tg) return;
    tg.ready();
    tg.expand();
    const supports = (version) => tg.isVersionAtLeast && tg.isVersionAtLeast(version);
    if (supports("6.1")) {
      tg.setHeaderColor("#0F1B3D");
      tg.setBackgroundColor("#0F1B3D");
    }
    if (supports("7.10")) tg.setBottomBarColor("#0F1B3D");
    // чтобы приложение не сворачивалось, когда листаешь страницу вниз
    if (supports("7.7")) tg.disableVerticalSwipes();

    // внешние ссылки открываем средствами Telegram, иначе они не откроются из Mini App
    document.addEventListener("click", (event) => {
      const link = event.target.closest("a[href]");
      if (!link) return;
      const url = new URL(link.href, location.href);
      if (!/^https?:$/.test(url.protocol)) return;
      // свои страницы открываем как обычно, кроме ссылок в новой вкладке (демо-проекты)
      if (url.origin === location.origin && link.target !== "_blank") return;
      event.preventDefault();
      if (url.hostname === "t.me") tg.openTelegramLink(url.href);
      else tg.openLink(url.href);
    });
  };
  document.head.append(script);
}

/* ---------- Старт ---------- */
document.addEventListener("DOMContentLoaded", () => {
  initTelegram();
  applyConfig();
  initNav();
  initLightbox();
  $$(".reveal").forEach(observeReveal);
  loadProjects();
});
