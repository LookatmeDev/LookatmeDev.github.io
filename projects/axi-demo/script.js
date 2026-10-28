/* AXI — демо-макет. Все данные ниже условные (DEMO), заменить данными заказчика. */
(() => {
  'use strict';

  /* ===================== ДАННЫЕ (DEMO) ===================== */
  // base: цена основы пакета, per: цена за один экран/страницу/сценарий, unit: [1, 2-4, 5+], weeks: базовый срок
  const PACKAGES = [
    { name: 'Лендинг', tag: 'Одна страница', base: 18000, per: 2500, weeks: 1, unitTitle: 'Количество экранов', unit: ['экран', 'экрана', 'экранов'],
      desc: 'Одностраничный сайт под одно действие: оффер, доказательства, форма заявки. Подходит для услуги, акции или запуска продукта.' },
    { name: 'Сайт компании', tag: 'Несколько страниц', base: 35000, per: 4000, weeks: 2, unitTitle: 'Количество страниц', unit: ['страница', 'страницы', 'страниц'],
      desc: 'Многостраничный сайт: услуги, о компании, кейсы, контакты. Единый стиль и удобная навигация.' },
    { name: 'Каталог и магазин', tag: 'Товары и заказы', base: 70000, per: 3500, weeks: 4, unitTitle: 'Количество страниц', unit: ['страница', 'страницы', 'страниц'],
      desc: 'Каталог товаров с карточками, фильтрами и корзиной. Заказы приходят вам в Telegram или на почту.' },
    { name: 'Telegram Mini App', tag: 'Внутри Telegram', base: 60000, per: 5000, weeks: 3, unitTitle: 'Количество экранов', unit: ['экран', 'экрана', 'экранов'],
      desc: 'Приложение, которое открывается прямо в Telegram: каталог, запись, личный кабинет, оплата Telegram Stars.' },
    { name: 'Telegram-бот', tag: 'Автоответы и заявки', base: 25000, per: 3000, weeks: 1, unitTitle: 'Количество сценариев', unit: ['сценарий', 'сценария', 'сценариев'],
      desc: 'Бот принимает заявки, отвечает на частые вопросы, присылает уведомления и подключается к вашей CRM.' },
    { name: 'Веб-приложение', tag: 'Сложная логика', base: 120000, per: 8000, weeks: 6, unitTitle: 'Количество экранов', unit: ['экран', 'экрана', 'экранов'],
      desc: 'PWA или кабинет с логикой: онлайн-запись, расписание, роли, статистика и push-уведомления.' }
  ];
  const OPTIONS = [
    { id: 'anim', name: 'Премиум-анимации',   note: 'Как на этой странице', perUnit: 800 },
    { id: 'copy', name: 'Тексты от нас',      note: 'Структура и копирайтинг', perUnit: 1200 },
    { id: 'cms',  name: 'Админка',            note: 'Правите цены и тексты сами', fixed: 25000 },
    { id: 'pay',  name: 'Приём оплат',        note: 'ЮKassa или Telegram Stars', fixed: 20000 },
    { id: 'seo',  name: 'SEO и аналитика',    note: 'Метрика и базовая оптимизация', fixed: 12000 }
  ];
  const URGENCY = [
    { name: 'Стандарт',  note: 'по графику',  k: 1,    t: 1 },
    { name: 'Ускоренно', note: 'срок −30%',   k: 1.25, t: 0.7 },
    { name: 'Экспресс',  note: 'срок −45%',   k: 1.5,  t: 0.55 }
  ];
  const PRICING = { min: 1, max: 20, bigFrom: 10, bigDiscount: 0.07, comboFrom: 2, comboDiscount: 0.03 };

  /* ===================== УТИЛИТЫ ===================== */
  // Всегда начинаем с начала страницы, иначе после перезагрузки блоки ниже экрана не успевают появиться
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const fmt = n => Math.round(n).toLocaleString('ru-RU');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const hasGsap = !!window.gsap;

  if (!hasGsap || reduce) {
    // Без GSAP или при reduced-motion показываем всё сразу в финальном состоянии
    if (!hasGsap) document.documentElement.classList.remove('js');
    const pre = $('#preloader'); if (pre) pre.remove();
  }
  if (hasGsap && window.ScrollTrigger) gsap.registerPlugin(ScrollTrigger);

  /* ===================== СКРОЛЛ ===================== */
  let lenis = null;
  if (hasGsap && window.Lenis && !reduce) {
    lenis = new Lenis({ lerp: 0.09, wheelMultiplier: 0.95 });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(t => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }
  const scrollToEl = (sel) => {
    const el = $(sel); if (!el) return;
    if (lenis) lenis.scrollTo(el, { offset: sel === '#top' ? 0 : -10, duration: 1.4 });
    else el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
  };
  const burger = $('#burger'), mnav = $('#mnav');
  function setMenu(open) {
    mnav.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
    if (lenis) open ? lenis.stop() : lenis.start();
    document.body.style.overflow = open ? 'hidden' : '';
    document.body.classList.toggle('menu-open', open);
  }
  burger.addEventListener('click', () => setMenu(!mnav.classList.contains('open')));
  addEventListener('keydown', e => { if (e.key === 'Escape' && mnav.classList.contains('open')) { setMenu(false); burger.focus(); } });
  $$('a', mnav).forEach(a => a.addEventListener('click', () => setMenu(false)));
  $$('[data-link]').forEach(a => a.addEventListener('click', e => {
    const h = a.getAttribute('href');
    if (h && h.startsWith('#')) { e.preventDefault(); scrollToEl(h); }
  }));

  // Бегущая строка: вторая копия для бесшовного цикла
  const mq = $('#mqTrack'); if (mq) mq.innerHTML += mq.innerHTML;

  const header = $('#header'), progress = $('#progress');
  let maxScroll = 1;
  const measureScroll = () => { maxScroll = Math.max(1, document.documentElement.scrollHeight - innerHeight); };
  const onScroll = () => {
    const y = window.scrollY;
    header.classList.toggle('scrolled', y > 40);
    progress.style.transform = `scaleX(${Math.min(1, y / maxScroll)})`;
  };
  new ResizeObserver(() => { measureScroll(); onScroll(); }).observe(document.body);
  addEventListener('resize', measureScroll);
  addEventListener('scroll', onScroll, { passive: true }); measureScroll(); onScroll();

  /* ===================== ТОАСТ ===================== */
  const toastEl = $('#toast'); let toastTimer;
  function toast(msg, linkText, linkHref) {
    toastEl.innerHTML = `<span></span>${linkText ? `<a href="${linkHref}" data-tl>${linkText}</a>` : ''}`;
    toastEl.firstChild.textContent = msg;
    toastEl.hidden = false;
    if (hasGsap && !reduce) gsap.fromTo(toastEl, { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: .5, ease: 'power3.out' });
    const l = $('[data-tl]', toastEl);
    if (l) l.addEventListener('click', e => { e.preventDefault(); toastEl.hidden = true; scrollToEl(linkHref); });
    clearTimeout(toastTimer); toastTimer = setTimeout(() => { toastEl.hidden = true; }, 5200);
  }

  /* ===================== КАЛЬКУЛЯТОР ===================== */
  const state = { pkg: 0, area: 5, opts: new Set(), urg: 0 };
  const unitWord = (p, n) => p.unit[n % 100 > 10 && n % 100 < 15 ? 2 : n % 10 === 1 ? 0 : n % 10 > 1 && n % 10 < 5 ? 1 : 2];
  const tv = { v: 0 };
  const el = {
    pkgs: $('#calcPkgs'), opts: $('#calcOpts'), urg: $('#calcUrg'), area: $('#area'), areaOut: $('#areaOut'),
    total: $('#totalVal'), save: $('#saveLine'), lines: $('#lines'), weeks: $('#weeksVal'), perM2: $('#perM2'), perLabel: $('#perM2').previousElementSibling, unitLabel: $('#unitLabel'),
    summary: $('#leadSummary'), field: $('#calcField')
  };

  el.pkgs.innerHTML = PACKAGES.map((p, i) => `
    <label class="opt-card"><input type="radio" name="pkg" value="${i}" ${i === state.pkg ? 'checked' : ''}>
      <div><b>${p.name}</b><small>от ${fmt(p.base)} ₽</small></div></label>`).join('');
  el.opts.innerHTML = OPTIONS.map(o => `
    <label class="switch"><input type="checkbox" value="${o.id}">
      <span class="t"><b>${o.name}</b><small>${o.note} · ${o.fixed ? fmt(o.fixed) + ' ₽' : '+' + fmt(o.perUnit) + ' ₽ за ед.'}</small></span>
      <span class="knob"></span></label>`).join('');
  el.urg.innerHTML = URGENCY.map((u, i) => `
    <label><input type="radio" name="urg" value="${i}" ${i === state.urg ? 'checked' : ''}>${u.name}<small>${u.note}</small></label>`).join('');

  function compute() {
    const p = PACKAGES[state.pkg], u = URGENCY[state.urg], n = state.area;
    const lines = [{ n: `${p.name}: основа`, v: p.base }, { n: `${n} ${unitWord(p, n)}`, v: p.per * n }];
    let sum = p.base + p.per * n;
    OPTIONS.filter(o => state.opts.has(o.id)).forEach(o => {
      const v = o.fixed ? o.fixed : o.perUnit * n; sum += v; lines.push({ n: o.name, v });
    });
    const urgSum = sum * u.k;
    if (u.k !== 1) lines.push({ n: `${u.name} (×${String(u.k).replace('.', ',')})`, v: urgSum - sum });
    let disc = 0;
    if (n >= PRICING.bigFrom) disc += PRICING.bigDiscount;
    if (state.opts.size >= PRICING.comboFrom) disc += PRICING.comboDiscount;
    const save = urgSum * disc, total = urgSum - save;
    if (disc) lines.push({ n: `Скидка ${Math.round(disc * 100)}%`, v: -save });
    const weeks = Math.max(1, Math.round((p.weeks + n / 4) * u.t));
    return { lines, total, save, weeks, perUnit: total / n };
  }

  function renderCalc() {
    const c = compute(), p = PACKAGES[state.pkg];
    el.unitLabel.textContent = p.unitTitle;
    el.areaOut.textContent = state.area;
    el.area.style.setProperty('--p', ((state.area - PRICING.min) / (PRICING.max - PRICING.min) * 100) + '%');
    el.lines.innerHTML = c.lines.map(l => `<li><span>${l.n}</span><span>${l.v < 0 ? '−' : ''}${fmt(Math.abs(l.v))} ₽</span></li>`).join('');
    el.weeks.textContent = `${c.weeks} ${plural(c.weeks, 'неделя', 'недели', 'недель')}`;
    el.perM2.textContent = `${fmt(c.perUnit)} ₽`;
    el.perLabel.textContent = `Стоимость: 1 ${p.unit[0]}`;
    el.save.hidden = !c.save;
    if (c.save) el.save.textContent = `Вы экономите ${fmt(c.save)} ₽`;
    if (hasGsap && !reduce) {
      gsap.to(tv, { v: c.total, duration: .85, ease: 'power3.out', overwrite: true, onUpdate: () => { el.total.textContent = fmt(tv.v); } });
    } else { tv.v = c.total; el.total.textContent = fmt(c.total); }
    el.summary.innerHTML = `<span>«${p.name}», ${state.area} ${unitWord(p, state.area)}, ${c.weeks} ${plural(c.weeks, 'неделя', 'недели', 'недель')}</span><b>${fmt(c.total)} ₽</b>`;
    el.field.value = `Пакет: ${p.name}; объём: ${state.area} ${unitWord(p, state.area)}; опции: ${[...state.opts].join(',') || 'нет'}; срочность: ${URGENCY[state.urg].name}; итого: ${fmt(c.total)} ₽`;
  }
  function plural(n, a, b, c) { const m = n % 100, d = n % 10; return m > 10 && m < 15 ? c : d === 1 ? a : d > 1 && d < 5 ? b : c; }

  el.pkgs.addEventListener('change', e => { state.pkg = +e.target.value; renderCalc(); });
  el.urg.addEventListener('change', e => { state.urg = +e.target.value; renderCalc(); });
  el.opts.addEventListener('change', e => { e.target.checked ? state.opts.add(e.target.value) : state.opts.delete(e.target.value); renderCalc(); });
  el.area.addEventListener('input', () => { state.area = +el.area.value; renderCalc(); });
  function setPackage(i) {
    state.pkg = i;
    const r = $(`input[name="pkg"][value="${i}"]`, el.pkgs); if (r) r.checked = true;
    renderCalc();
  }
  renderCalc();

  /* ===================== 3D-КАРУСЕЛЬ ===================== */
  function art(i) {
    let s = '<svg viewBox="0 0 200 200" fill="none" stroke="#8FB4FF" stroke-width="1.2" aria-hidden="true">';
    for (let k = 0; k <= i + 1; k++) { const o = 14 + k * 14; s += `<rect x="${o}" y="${o}" width="${200 - o * 2}" height="${200 - o * 2}" rx="${Math.max(18 - k * 2, 2)}" stroke-opacity="${(.9 - k * .12).toFixed(2)}"/>`; }
    s += `<path d="M14 100h172M100 14v172" stroke-opacity=".25" stroke-dasharray="3 5"/>`;
    s += `<circle cx="100" cy="100" r="${10 + i * 4}" fill="#2F5BFF" fill-opacity=".55" stroke="#fff"/></svg>`;
    return s;
  }

  const car = $('#carousel'), ring = $('#ring3d'), N = PACKAGES.length;
  const cards = PACKAGES.map((p, i) => {
    const d = document.createElement('div');
    d.className = 'pcard'; d.dataset.i = i;
    d.innerHTML = `<div class="art">${art(i)}</div><div class="meta"><small>${p.tag}</small><b>${p.name}</b><span>от ${fmt(p.base)} ₽</span></div>`;
    ring.appendChild(d); return d;
  });
  const dotsEl = $('#dots');
  dotsEl.innerHTML = PACKAGES.map((p, i) => `<button role="tab" aria-selected="false" aria-label="${p.name}" data-i="${i}"><i></i></button>`).join('');

  let cur = 0, target = 0, R = 300, ppi = 220, active = -1, raf = 0, hover = false, dragging = false, inView = false, idleUntil = 0;
  const step = 360 / N;

  function layout() {
    const w = car.clientWidth, cw = w < 560 ? 210 : w < 900 ? 240 : 270, ch = Math.round(cw * 1.3), gap = w < 560 ? 26 : 56;
    R = (cw / 2 + gap) / Math.tan(Math.PI / N); ppi = cw * 0.85;
    cards.forEach((c, i) => {
      c.style.setProperty('--cw', cw + 'px'); c.style.setProperty('--ch', ch + 'px');
      c.style.transform = `rotateY(${i * step}deg) translateZ(${R}px)`;
    });
    paint();
  }
  const wrap = d => ((d + N / 2) % N + N) % N - N / 2;
  function paint() {
    ring.style.transform = `translateZ(${-R}px) rotateY(${-cur * step}deg)`;
    cards.forEach((c, i) => {
      const d = Math.abs(wrap(i - cur));
      c.style.opacity = Math.max(.25, 1 - d * .3).toFixed(2);
      c.style.setProperty('--dim', d > .5 ? Math.min(.45, d * .2).toFixed(2) : 0);
    });
  }
  function tick() {
    cur += (target - cur) * 0.12;
    if (Math.abs(target - cur) < 0.0008) cur = target;
    paint();
    raf = cur !== target ? requestAnimationFrame(tick) : 0;
  }
  const kick = () => { if (!raf) raf = requestAnimationFrame(tick); };
  function go(t) { target = t; setActive(); kick(); }
  function setActive() {
    const idx = ((Math.round(target) % N) + N) % N;
    if (idx === active) return;
    active = idx;
    cards.forEach((c, i) => c.classList.toggle('active', i === idx));
    $$('button', dotsEl).forEach((b, i) => b.setAttribute('aria-selected', i === idx));
    const p = PACKAGES[idx];
    $('#pickTag').textContent = p.tag; $('#pickName').textContent = p.name; $('#pickDesc').textContent = p.desc; $('#pickPrice').textContent = `от ${fmt(p.base)} ₽`; $('#pickUnit').textContent = `+ ${fmt(p.per)} ₽ за ${p.unit[0]}`;
    if (hasGsap && !reduce) gsap.fromTo('.pick-info > *, .pick-price', { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: .5, stagger: .05, ease: 'power3.out', overwrite: true });
  }
  const bump = () => { idleUntil = performance.now() + 9000; };

  let sx = 0, st = 0, lx = 0, lt = 0, vel = 0, moved = false, downCard = null;
  car.addEventListener('pointerdown', e => {
    if (e.target.closest('.car-btn')) return;
    dragging = true; moved = false; sx = lx = e.clientX; st = target; lt = performance.now(); vel = 0;
    downCard = e.target.closest('.pcard'); car.classList.add('drag'); bump();
    car.setPointerCapture(e.pointerId);
  });
  car.addEventListener('pointermove', e => {
    if (!dragging) return;
    const dx = e.clientX - sx;
    if (Math.abs(dx) > 5) moved = true;
    const now = performance.now(), dt = Math.max(now - lt, 1);
    vel = 0.8 * vel + 0.2 * (-(e.clientX - lx) / ppi / dt); lx = e.clientX; lt = now;
    target = st - dx / ppi; setActive(); kick();
  });
  const endDrag = () => {
    if (!dragging) return;
    dragging = false; car.classList.remove('drag');
    if (moved) go(Math.round(target + Math.max(-3, Math.min(3, vel * 260))));
    else if (downCard) { const i = +downCard.dataset.i; go(Math.round(cur) + wrap(i - Math.round(cur))); }
  };
  car.addEventListener('pointerup', endDrag); car.addEventListener('pointercancel', endDrag);
  car.addEventListener('wheel', e => { if (Math.abs(e.deltaX) > Math.abs(e.deltaY) && Math.abs(e.deltaX) > 20) { e.preventDefault(); go(Math.round(target) + Math.sign(e.deltaX)); bump(); } }, { passive: false });
  car.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft') { e.preventDefault(); go(Math.round(target) - 1); bump(); }
    if (e.key === 'ArrowRight') { e.preventDefault(); go(Math.round(target) + 1); bump(); }
  });
  $('#carPrev').addEventListener('click', () => { go(Math.round(target) - 1); bump(); });
  $('#carNext').addEventListener('click', () => { go(Math.round(target) + 1); bump(); });
  dotsEl.addEventListener('click', e => { const b = e.target.closest('button'); if (b) { go(Math.round(target) + wrap(+b.dataset.i - Math.round(target))); bump(); } });
  car.addEventListener('mouseenter', () => hover = true); car.addEventListener('mouseleave', () => hover = false);
  new IntersectionObserver(([en]) => { inView = en.isIntersecting; }, { threshold: .3 }).observe(car);
  if (!reduce) setInterval(() => { if (inView && !hover && !dragging && performance.now() > idleUntil && !document.hidden) go(Math.round(target) + 1); }, 4200);
  addEventListener('resize', layout);

  layout(); setActive();

  // «Добавить в расчёт»: полёт точки к кнопке в шапке
  $('#pickAdd').addEventListener('click', e => {
    const idx = active;
    setPackage(idx);
    const head = $('#headCalc');
    if (hasGsap && !reduce) {
      const b = e.currentTarget.getBoundingClientRect(), h = head.getBoundingClientRect();
      const dot = document.createElement('i'); dot.className = 'fly'; document.body.appendChild(dot);
      gsap.fromTo(dot, { x: b.left + b.width / 2, y: b.top + b.height / 2, scale: 1.4, opacity: 1 },
        { x: h.left + h.width / 2, y: h.top + h.height / 2, scale: .4, duration: .8, ease: 'power2.inOut',
          onComplete: () => { dot.remove(); head.classList.remove('pulse'); void head.offsetWidth; head.classList.add('pulse'); } });
    }
    toast(`Пакет «${PACKAGES[idx].name}» добавлен в расчёт`, 'К расчёту', '#calc');
  });

  /* ===================== ДО / ПОСЛЕ ===================== */
  function landing(after) {
    if (!after) return `<svg viewBox="0 0 800 400" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <rect width="800" height="400" fill="#3a4156"/>
      <rect x="0" y="0" width="800" height="52" fill="#2d3346"/>
      <rect x="30" y="18" width="70" height="16" rx="3" fill="#6d7690"/>
      ${[430, 500, 570, 640].map(x => `<rect x="${x}" y="20" width="52" height="12" rx="3" fill="#59627b"/>`).join('')}
      <rect x="40" y="86" width="320" height="26" rx="3" fill="#7b849c"/><rect x="40" y="124" width="250" height="26" rx="3" fill="#7b849c"/>
      <rect x="40" y="170" width="300" height="10" rx="3" fill="#59627b"/><rect x="40" y="188" width="270" height="10" rx="3" fill="#59627b"/><rect x="40" y="206" width="180" height="10" rx="3" fill="#59627b"/>
      <rect x="40" y="240" width="110" height="34" rx="3" fill="#8b94ab"/><rect x="160" y="240" width="110" height="34" rx="3" fill="#59627b"/>
      <rect x="450" y="80" width="310" height="200" fill="#2d3346" stroke="#6d7690" stroke-width="2"/><path d="M450 80l310 200M760 80 450 280" stroke="#6d7690" stroke-width="2"/>
      ${[40, 300, 560].map(x => `<rect x="${x}" y="310" width="200" height="70" fill="#4a526a"/><rect x="${x + 14}" y="326" width="120" height="8" rx="2" fill="#6d7690"/><rect x="${x + 14}" y="344" width="150" height="8" rx="2" fill="#59627b"/>`).join('')}
      <text x="400" y="298" fill="#ff8a9b" fill-opacity=".85" font-size="13" text-anchor="middle" font-family="sans-serif" opacity="0">.</text>
    </svg>`;
    return `<svg viewBox="0 0 800 400" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <linearGradient id="la" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#16285A"/><stop offset="1" stop-color="#0A1430"/></linearGradient>
        <radialGradient id="lo" cx=".32" cy=".28"><stop offset="0" stop-color="#8FB4FF"/><stop offset=".45" stop-color="#2F5BFF"/><stop offset="1" stop-color="#0F1B3D"/></radialGradient>
        <radialGradient id="lg"><stop offset="0" stop-color="#2F5BFF" stop-opacity=".55"/><stop offset="1" stop-color="#2F5BFF" stop-opacity="0"/></radialGradient>
      </defs>
      <rect width="800" height="400" fill="url(#la)"/>
      <circle cx="640" cy="170" r="230" fill="url(#lg)"/>
      <rect x="30" y="16" width="26" height="26" rx="8" fill="none" stroke="#fff" stroke-opacity=".5"/><path d="M36 36l7-14 7 14M39 32h8" stroke="#fff" stroke-width="2" fill="none"/>
      <rect x="66" y="23" width="44" height="12" rx="3" fill="#fff"/>
      ${[400, 470, 540].map(x => `<rect x="${x}" y="24" width="46" height="9" rx="4" fill="#fff" fill-opacity=".55"/>`).join('')}
      <rect x="640" y="14" width="130" height="30" rx="15" fill="#fff" fill-opacity=".12" stroke="#fff" stroke-opacity=".25"/>
      <rect x="40" y="90" width="150" height="9" rx="4" fill="#8FB4FF"/>
      <rect x="40" y="116" width="330" height="34" rx="6" fill="#fff"/><rect x="40" y="160" width="270" height="34" rx="6" fill="#fff"/><rect x="40" y="204" width="190" height="34" rx="6" fill="#8FB4FF"/>
      <rect x="40" y="256" width="300" height="9" rx="4" fill="#fff" fill-opacity=".55"/><rect x="40" y="274" width="240" height="9" rx="4" fill="#fff" fill-opacity=".55"/>
      <rect x="40" y="304" width="150" height="40" rx="20" fill="#fff"/><rect x="204" y="304" width="120" height="40" rx="20" fill="none" stroke="#fff" stroke-opacity=".4"/>
      <circle cx="590" cy="190" r="125" fill="url(#lo)"/>
      <circle cx="590" cy="190" r="165" fill="none" stroke="#fff" stroke-opacity=".25" stroke-dasharray="4 6"/>
      <circle cx="590" cy="190" r="205" fill="none" stroke="#fff" stroke-opacity=".12"/>
      <circle cx="494" cy="82" r="5" fill="#fff"/>
      <rect x="470" y="130" width="100" height="56" rx="14" fill="#fff" fill-opacity=".12" stroke="#fff" stroke-opacity=".3"/><rect x="484" y="146" width="40" height="7" rx="3" fill="#fff" fill-opacity=".6"/><rect x="484" y="162" width="60" height="12" rx="4" fill="#fff"/>
      <rect x="690" y="220" width="90" height="56" rx="14" fill="#fff" fill-opacity=".12" stroke="#fff" stroke-opacity=".3"/><rect x="702" y="236" width="36" height="7" rx="3" fill="#fff" fill-opacity=".6"/><rect x="702" y="252" width="56" height="12" rx="4" fill="#fff"/>
      <rect x="420" y="312" width="340" height="58" rx="16" fill="#fff" fill-opacity=".08" stroke="#fff" stroke-opacity=".2"/>
      ${[440, 540, 640].map(x => `<circle cx="${x + 10}" cy="341" r="9" fill="#2F5BFF"/><rect x="${x + 28}" y="331" width="54" height="8" rx="3" fill="#fff"/><rect x="${x + 28}" y="345" width="40" height="6" rx="3" fill="#fff" fill-opacity=".5"/>`).join('')}
    </svg>`;
  }
  $('#baAfter').innerHTML = landing(true);
  $('#baBefore').innerHTML = landing(false);
  const ba = $('#ba'), baRange = $('#baRange');
  const setPos = v => ba.style.setProperty('--pos', v + '%');
  baRange.addEventListener('input', () => setPos(baRange.value));

  /* ===================== FAQ ===================== */
  $$('#faqList .q').forEach(q => q.addEventListener('click', () => {
    const open = q.getAttribute('aria-expanded') === 'true';
    $$('#faqList .q').forEach(x => x.setAttribute('aria-expanded', 'false'));
    q.setAttribute('aria-expanded', String(!open));
  }));

  /* ===================== СЛАЙДЕР ОТЗЫВОВ ===================== */
  const sl = $('#slider'); let sd = false, sX = 0, sL = 0, sMoved = false;
  sl.addEventListener('pointerdown', e => { if (e.pointerType !== 'mouse') return; sd = true; sMoved = false; sX = e.clientX; sL = sl.scrollLeft; });
  addEventListener('pointermove', e => { if (!sd) return; const dx = e.clientX - sX; if (Math.abs(dx) > 4) { sMoved = true; sl.classList.add('drag'); } sl.scrollLeft = sL - dx; });
  addEventListener('pointerup', () => { sd = false; sl.classList.remove('drag'); });

  /* ===================== ФОРМА ===================== */
  const form = $('#leadForm');
  const checks = {
    name: v => v.trim().length >= 2 ? '' : 'Укажите имя, минимум 2 символа',
    contact: v => { v = v.trim(); return (/^@[\w]{4,32}$/.test(v) || v.replace(/\D/g, '').length >= 10 || /^[\w.+-]+@[\w-]+\.\w{2,}$/.test(v)) ? '' : 'Укажите @username, телефон или email'; }
  };
  function validate(name) {
    const f = form.elements[name], wrapF = f.closest('.field'), msg = checks[name](f.value);
    wrapF.classList.toggle('bad', !!msg); $('.err', wrapF).textContent = msg; f.setAttribute('aria-invalid', !!msg); return !msg;
  }
  Object.keys(checks).forEach(n => { form.elements[n].addEventListener('blur', () => validate(n)); form.elements[n].addEventListener('input', () => { if (form.elements[n].closest('.field').classList.contains('bad')) validate(n); }); });
  form.addEventListener('submit', e => {
    e.preventDefault();
    const ok = Object.keys(checks).map(validate).every(Boolean);
    if (!ok) { const bad = $('.field.bad input', form); if (bad) bad.focus(); return; }
    const btn = $('#submitBtn'); btn.classList.add('loading');
    // DEMO: имитация отправки. Здесь подключается Telegram-бот или API.
    console.log('[DEMO] заявка:', Object.fromEntries(new FormData(form)));
    setTimeout(() => {
      btn.classList.remove('loading');
      const ok2 = $('#success'); ok2.hidden = false;
      if (hasGsap && !reduce) gsap.fromTo(ok2, { opacity: 0, scale: .96 }, { opacity: 1, scale: 1, duration: .6, ease: 'power3.out' });
      form.reset();
      setTimeout(() => { ok2.hidden = true; }, 6000);
    }, 1100);
  });

  /* ===================== МЕТКИ «ЧТО КУДА ПОДСТАВИТЬ» ===================== */
  const hintLayer = $('#hintLayer'), hintToggle = $('#hintToggle'), hintTargets = $$('[data-hint]');
  const hintBadges = hintTargets.map(t => {
    const b = document.createElement('div'); b.className = 'hint'; b.innerHTML = '<i></i><span></span>';
    b.lastChild.textContent = t.dataset.hint; hintLayer.appendChild(b); return b;
  });
  const hintInHeader = hintTargets.map(t => !!t.closest('.header'));
  let hintsOn = false, hintRaf = 0, hintUntil = 0, hintW = [];
  const measureHints = () => { hintW = hintBadges.map(b => b.offsetWidth); };
  function placeHints() {
    const vh = innerHeight, vw = innerWidth, top = 78, sy = scrollY;
    const rects = hintTargets.map(t => t.getBoundingClientRect());
    rects.forEach((r, i) => {
      const b = hintBadges[i], inHeader = hintInHeader[i];
      const show = inHeader ? sy < 160 : r.width > 0 && r.bottom > top + 40 && r.top < vh - 30;
      b.classList.toggle('vis', show);
      if (!show) return;
      const y = inHeader ? r.bottom + 12 : Math.min(Math.max(r.top - 14, top), r.bottom - 44);
      const x = Math.max(Math.min(r.left + 12, vw - hintW[i] - 8), 8);
      b.style.transform = `translate3d(${x}px,${y}px,0)`;
    });
    hintRaf = performance.now() < hintUntil ? requestAnimationFrame(placeHints) : 0;
  }
  // Цикл крутится только пока что-то движется, а не постоянно
  function wakeHints(ms = 1200) {
    if (!hintsOn) return;
    hintUntil = Math.max(hintUntil, performance.now() + ms);
    if (!hintRaf) hintRaf = requestAnimationFrame(placeHints);
  }
  addEventListener('scroll', () => wakeHints(), { passive: true });
  addEventListener('resize', () => { measureHints(); wakeHints(); });
  addEventListener('click', () => wakeHints(900));
  if (document.fonts) document.fonts.ready.then(measureHints);
  function setHints(on) {
    hintsOn = on;
    hintLayer.classList.toggle('on', on); document.body.classList.toggle('hints-on', on);
    hintToggle.setAttribute('aria-pressed', String(on));
    if (on) { measureHints(); wakeHints(1500); }
  }
  hintToggle.addEventListener('click', () => setHints(!hintsOn));
  $('#fitHints').addEventListener('click', () => { setHints(true); scrollToEl('#top'); toast('Метки включены. Пролистайте страницу сверху вниз.'); });
  // Включаем метки после вступительной анимации
  // ?clean открывает страницу без меток (для скриншотов и обложек)
  if (!/[?&]clean/.test(location.search)) setTimeout(() => { setHints(true); toast('Белые метки показывают, что подставится под ваш бизнес. Выключить можно кнопкой слева внизу.'); }, reduce ? 300 : 3200);

  /* ===================== АНИМАЦИИ (GSAP) ===================== */
  if (!hasGsap || reduce) {
    $$('[data-count]').forEach(n => n.textContent = n.dataset.count + (n.dataset.suffix || ''));
    $('#stepsFill').style.transform = 'none';
    $$('.step').forEach(s => s.classList.add('on'));
    return;
  }

  // Магнитные кнопки
  if (finePointer) $$('.magnetic').forEach(b => {
    const qx = gsap.quickTo(b, 'x', { duration: .4, ease: 'power3.out' }), qy = gsap.quickTo(b, 'y', { duration: .4, ease: 'power3.out' });
    let r = null;
    b.addEventListener('pointerenter', () => { r = b.getBoundingClientRect(); });
    b.addEventListener('pointermove', e => { if (!r) r = b.getBoundingClientRect(); qx((e.clientX - r.left - r.width / 2) * .22); qy((e.clientY - r.top - r.height / 2) * .32); });
    b.addEventListener('pointerleave', () => { r = null; qx(0); qy(0); });
  });

  // Tilt-карточки
  if (finePointer) $$('.tilt').forEach(t => {
    t.addEventListener('pointermove', e => {
      if (!t.classList.contains('in')) return;
      const r = t.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
      t.style.transform = `perspective(900px) rotateX(${((.5 - y) * 8).toFixed(2)}deg) rotateY(${((x - .5) * 10).toFixed(2)}deg)`;
      t.style.setProperty('--mx', x * 100 + '%'); t.style.setProperty('--my', y * 100 + '%');
    });
    t.addEventListener('pointerleave', () => { t.style.transform = ''; });
  });

  // Появление блоков
  ScrollTrigger.batch('.rv', {
    start: 'top 90%', once: true,
    onEnter: els => gsap.to(els, { opacity: 1, y: 0, duration: 1, stagger: .12, ease: 'power3.out', overwrite: true,
      onComplete: () => els.forEach(x => { x.classList.add('in'); x.style.removeProperty('transform'); x.style.removeProperty('opacity'); }) })
  });

  // Параллакс свечений
  gsap.to('.g1', { y: 260, ease: 'none', scrollTrigger: { start: 0, end: 'max', scrub: true } });
  gsap.to('.g2', { y: -200, ease: 'none', scrollTrigger: { start: 0, end: 'max', scrub: true } });
  gsap.to('.g3', { y: 340, x: -120, ease: 'none', scrollTrigger: { start: 0, end: 'max', scrub: true } });

  // Hero: параллакс от мыши
  const hv = $('#heroVisual');
  if (finePointer) {
    const chips = $$('.chip', hv).map(c => ({ d: +c.dataset.depth * 2, qx: gsap.quickTo(c, 'x', { duration: .9, ease: 'power3.out' }), qy: gsap.quickTo(c, 'y', { duration: .9, ease: 'power3.out' }) }));
    hv.parentElement.addEventListener('pointermove', e => {
      const r = hv.getBoundingClientRect(), nx = (e.clientX - r.left) / r.width - .5, ny = (e.clientY - r.top) / r.height - .5;
      chips.forEach(c => { c.qx(-nx * c.d); c.qy(-ny * c.d); });
    });
  }

  // Процесс: линия и шаги
  const steps = $$('.step'), mm = gsap.matchMedia();
  const stepOn = p => steps.forEach((s, i) => s.classList.toggle('on', p >= i / (steps.length - 1) - .03 && p > 0));
  mm.add('(min-width: 1021px)', () => {
    gsap.fromTo('#stepsFill', { scaleX: 0 }, { scaleX: 1, ease: 'none', scrollTrigger: { trigger: '#steps', start: 'top 72%', end: 'bottom 60%', scrub: .4, onUpdate: s => stepOn(s.progress) } });
  });
  mm.add('(max-width: 1020px)', () => {
    gsap.fromTo('#stepsFill', { scaleY: 0 }, { scaleY: 1, ease: 'none', scrollTrigger: { trigger: '#steps', start: 'top 70%', end: 'bottom 70%', scrub: .4, onUpdate: s => stepOn(s.progress) } });
  });

  // Счётчики
  $$('[data-count]').forEach(n => {
    const end = +n.dataset.count, suf = n.dataset.suffix || '', o = { v: 0 };
    ScrollTrigger.create({ trigger: n, start: 'top 92%', once: true, onEnter: () => gsap.to(o, { v: end, duration: 2, ease: 'power2.out', onUpdate: () => { n.textContent = Math.round(o.v) + suf; } }) });
  });

  // До/после: подсказка-покачивание
  const nudge = { v: 50 };
  ScrollTrigger.create({ trigger: ba, start: 'top 70%', once: true, onEnter: () => gsap.timeline({ delay: .6 })
    .to(nudge, { v: 78, duration: 1, ease: 'power2.inOut', onUpdate: () => { setPos(nudge.v); baRange.value = nudge.v; } })
    .to(nudge, { v: 28, duration: 1.4, ease: 'power2.inOut', onUpdate: () => { setPos(nudge.v); baRange.value = nudge.v; } })
    .to(nudge, { v: 50, duration: 1, ease: 'power2.inOut', onUpdate: () => { setPos(nudge.v); baRange.value = nudge.v; } }) });

  // Прелоадер и вступление hero
  const intro = gsap.timeline({ defaults: { ease: 'power3.out' } });
  intro.to('.pre-line span', { scaleX: 1, duration: .7, ease: 'power2.inOut' })
    .to('.pre-logo, .pre-sub', { opacity: 0, y: -10, duration: .3 })
    .to('#preloader', { yPercent: -100, duration: .75, ease: 'power4.inOut' }, '<')
    .to('.hero .line .inner', { y: 0, duration: 1.1, stagger: .1 }, '-=.35')
    .to('[data-hero]', { opacity: 1, y: 0, duration: 1, stagger: .12 }, '-=.9')
    .to('.orb', { opacity: 1, duration: 1.4 }, '-=1.1')
    .fromTo('.chip', { y: 30 }, { opacity: 1, y: 0, duration: 1, stagger: .15 }, '-=1')
    .add(() => $('#preloader').remove());
})();
