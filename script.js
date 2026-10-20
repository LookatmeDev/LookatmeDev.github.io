/* =====================================================================
   ЛИЧНЫЕ ДАННЫЕ — меняйте только этот блок.
   Мета-теги для превью ссылки (title, og:*) лежат в <head> index.html,
   их нужно поправить там же: Telegram не выполняет JavaScript.
   ===================================================================== */
const CONFIG = {
  name: "Look at me",
  shortName: "LM", // буквы в логотипе
  role: "Middle developer",
  status: "открыт к проектам",
  tagline: "Разрабатываю Telegram-ботов, парсеры и веб-приложения",

  telegram: "na_farme", // без @
  email: "you@example.com",
  github: "LookatmeDev",

  about: [
    "Я middle-разработчик: делаю Telegram-ботов, парсеры и веб-приложения под ключ — от идеи и архитектуры до деплоя и поддержки.",
    "Пишу бэкенд на Go и Python, фронтенд на TypeScript и React. Люблю, когда система простая внутри: понятные модули, тесты и Docker, чтобы проект запускался одной командой.",
    "Сначала разбираюсь в задаче бизнеса, потом пишу код. Показываю промежуточный результат, а не пропадаю на месяц.",
  ],

  facts: [
    { value: "3+", label: "года коммерческой разработки" },
    { value: "20+", label: "запущенных проектов" },
    { value: "8", label: "источников в одном парсере" },
    { value: "24 ч", label: "время ответа на заявку" },
  ],

  stack: [
    { group: "Языки", items: ["Go", "Python", "TypeScript", "JavaScript", "SQL"] },
    { group: "Бэкенд", items: ["FastAPI", "Telegram Bot API", "Supabase Edge Functions", "httpx / asyncio", "BeautifulSoup / lxml", "REST API"] },
    { group: "Фронтенд", items: ["React", "Vite", "Tailwind CSS", "PWA / Workbox", "Web Push", "HTML / CSS"] },
    { group: "Базы данных", items: ["PostgreSQL", "Redis", "Supabase", "RLS-политики"] },
    { group: "Инструменты", items: ["Docker", "Docker Compose", "Git / GitHub", "Pytest", "Vitest", "Playwright", "Claude Code"] },
  ],

  steps: [
    { title: "Что делаю", text: "Telegram-боты и мини-аппы, парсеры и сбор данных, сайты и PWA, интеграции с API и автоматизация рутины.", meta: "боты · парсеры · веб" },
    { title: "Бриф и оценка", text: "Обсуждаем задачу, я предлагаю решение, фиксируем объём работ, стоимость и сроки.", meta: "1–2 дня" },
    { title: "Разработка", text: "Работаю итерациями и показываю промежуточный результат. Вы видите прогресс и можете поправить курс.", meta: "от 3 дней до 4 недель" },
    { title: "Запуск и поддержка", text: "Деплою на ваш сервер или хостинг, передаю код и инструкцию. Исправляю ошибки после запуска.", meta: "2 недели гарантии" },
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

/* ---------- Подстановка конфига ---------- */
function applyConfig() {
  const values = {
    ...CONFIG,
    telegramHandle: "@" + CONFIG.telegram,
    githubHandle: "github.com/" + CONFIG.github,
  };
  const hrefs = {
    telegram: "https://t.me/" + CONFIG.telegram,
    email: "mailto:" + CONFIG.email,
    github: "https://github.com/" + CONFIG.github,
  };

  $$("[data-config]").forEach((node) => {
    const value = values[node.dataset.config];
    if (typeof value === "string") node.textContent = value;
  });
  $$("[data-config-href]").forEach((node) => {
    const href = hrefs[node.dataset.configHref];
    if (href) node.href = href;
  });

  const about = $("[data-config-list='about']");
  CONFIG.about.forEach((text) => about.append(el("p", { text })));

  const facts = $("[data-config-facts]");
  CONFIG.facts.forEach((fact) => {
    facts.append(
      el("li", { class: "fact" }, [
        el("span", { class: "fact__value", text: fact.value }),
        el("span", { class: "fact__label", text: fact.label }),
      ])
    );
  });

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
  CONFIG.steps.forEach((step) => {
    steps.append(
      el("li", { class: "step reveal" }, [
        el("h3", { class: "step__title", text: step.title }),
        el("p", { class: "step__text", text: step.text }),
        step.meta && el("span", { class: "step__meta", text: step.meta }),
      ])
    );
  });

  $("#year").textContent = new Date().getFullYear();
}

/* ---------- Проекты ---------- */
function projectCard(project) {
  const featured = project.featured === true;
  const links = project.links || {};
  const live = LIVE_LINKS.find(([type]) => links[type]);
  const href = live ? links[live[0]] : "https://t.me/" + CONFIG.telegram;
  const ctaText = live ? live[1] : "Запросить демо";

  const media = el("div", { class: "card__media" });
  if (project.image) {
    const img = el("img", {
      src: project.image,
      alt: "Скриншот проекта «" + project.title + "»",
      loading: "lazy",
      decoding: "async",
      width: 800,
      height: 500,
    });
    // если файл не найден — показываем заглушку
    img.addEventListener("error", () => img.replaceWith(placeholder(project.title)));
    media.append(img);
  } else {
    media.append(placeholder(project.title));
  }

  // Вся карточка кликабельна: ссылка в заголовке растянута на неё через ::after
  return el("article", { class: "card" + (featured ? " card--featured" : "") + (live ? " card--live" : ""), "data-category": project.category || "" }, [
    featured && el("span", { class: "card__badge", text: "★ featured" }),
    media,
    el("div", { class: "card__body" }, [
      project.category && el("p", { class: "card__category", text: "# " + project.category }),
      el("h3", { class: "card__title" }, [
        el("a", { class: "card__cover-link", href, target: "_blank", rel: "noopener", "aria-label": ctaText + ": " + project.title, text: project.title }),
      ]),
      el("p", { class: "card__desc", text: project.description || "" }),
      el("ul", { class: "tags", "aria-label": "Стек" }, (project.stack || []).map((t) => el("li", { class: "tag", text: t }))),
      el("span", { class: "card__cta", "aria-hidden": "true" }, [
        document.createTextNode(ctaText),
        el("span", { class: "card__cta-arrow", text: "→" }),
      ]),
    ]),
  ]);
}

function placeholder(title) {
  const initials = title
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
  return el("div", { class: "card__placeholder", "aria-hidden": "true", text: "</" + initials + ">" });
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
      el("span", { class: "filter__count", text: String(count) }),
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

    grid.replaceChildren(...projects.map(projectCard));
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
        " и откройте http://localhost:8000 — на GitHub Pages всё работает само."
      );
    } else {
      message.textContent = "Не удалось загрузить проекты. Проверьте, что projects.json — корректный JSON.";
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

/* ---------- Старт ---------- */
document.addEventListener("DOMContentLoaded", () => {
  applyConfig();
  initNav();
  $$(".reveal").forEach(observeReveal);
  loadProjects();
});
