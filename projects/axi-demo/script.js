/* AXI — демо-макет. Все данные ниже условные (DEMO), заменить данными заказчика. */
(() => {
  'use strict';

  /* ===================== ДАННЫЕ (DEMO) ===================== */
  const PACKAGES = [
    { name: 'Эскиз', tag: 'Старт', rate: 1500, weeks: 1,
      desc: 'Два варианта планировки с расстановкой мебели и зонированием. Подходит, если ремонт вы делаете сами.' },
    { name: 'Базовый', tag: 'Основа', rate: 3200, weeks: 3,
      desc: 'Планировка, концепция и эскизы стен. Основа для ремонта с понятным и предсказуемым результатом.' },
    { name: 'Полный', tag: 'Популярный', rate: 4800, weeks: 5,
      desc: '3D-визуализации всех комнат, подбор отделки и света, комплект рабочих чертежей для строителей.' },
    { name: 'Под ключ', tag: 'Всё включено', rate: 7200, weeks: 8,
      desc: 'Полная документация и спецификации. Вы получаете готовый список закупок и чёткий план работ.' },
    { name: 'Премиум', tag: 'Сопровождение', rate: 9800, weeks: 10,
      desc: 'Проект плюс личный куратор: контроль подрядчиков, выезды на объект и сдача по чек-листу.' }
  ];
  const OPTIONS = [
    { id: 'viz',  name: '3D-визуализации',     note: 'Каждая комната в картинке', perM2: 600 },
    { id: 'spec', name: 'Комплектация',        note: 'Списки закупок и поставщики', perM2: 900 },
    { id: 'sup',  name: 'Авторский надзор',    note: 'Выезды на объект', perM2: 1800 },
    { id: 'meas', name: 'Выезд на замер',      note: 'Обмеры и фотофиксация', fixed: 7000 }
  ];
  const URGENCY = [
    { name: 'Стандарт',  note: 'по графику',  k: 1,    t: 1 },
    { name: 'Ускоренно', note: 'срок −30%',   k: 1.25, t: 0.7 },
    { name: 'Экспресс',  note: 'срок −45%',   k: 1.5,  t: 0.55 }
  ];
  const PRICING = { minArea: 20, maxArea: 300, bigAreaFrom: 120, bigAreaDiscount: 0.07, comboFrom: 2, comboDiscount: 0.03 };

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
  $$('[data-link]').forEach(a => a.addEventListener('click', e => {
    const h = a.getAttribute('href');
    if (h && h.startsWith('#')) { e.preventDefault(); scrollToEl(h); }
  }));

  const header = $('#header'), progress = $('#progress');
  const onScroll = () => {
    const y = window.scrollY, max = document.documentElement.scrollHeight - innerHeight;
    header.classList.toggle('scrolled', y > 40);
    progress.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
  };
  addEventListener('scroll', onScroll, { passive: true }); onScroll();

  /* ===================== ТОАСТ ===================== */
  const toastEl = $('#toast'); let toastTimer;
  function toast(msg, linkText, linkHref) {
    toastEl.innerHTML = `<span></span>${linkText ? `<a href="${linkHref}" data-tl>${linkText}</a>` : ''}`;
    toastEl.firstChild.textContent = msg;
    toastEl.hidden = false;
    if (hasGsap && !reduce) gsap.fromTo(toastEl, { y: 30, opacity: 0, xPercent: -50 }, { y: 0, opacity: 1, xPercent: -50, duration: .5, ease: 'power3.out' });
    const l = $('[data-tl]', toastEl);
    if (l) l.addEventListener('click', e => { e.preventDefault(); toastEl.hidden = true; scrollToEl(linkHref); });
    clearTimeout(toastTimer); toastTimer = setTimeout(() => { toastEl.hidden = true; }, 5200);
  }

  /* ===================== КАЛЬКУЛЯТОР ===================== */
  const state = { pkg: 1, area: 70, opts: new Set(), urg: 0 };
  const tv = { v: 0 };
  const el = {
    pkgs: $('#calcPkgs'), opts: $('#calcOpts'), urg: $('#calcUrg'), area: $('#area'), areaOut: $('#areaOut'),
    total: $('#totalVal'), save: $('#saveLine'), lines: $('#lines'), weeks: $('#weeksVal'), perM2: $('#perM2'),
    summary: $('#leadSummary'), field: $('#calcField')
  };

  el.pkgs.innerHTML = PACKAGES.map((p, i) => `
    <label class="opt-card"><input type="radio" name="pkg" value="${i}" ${i === state.pkg ? 'checked' : ''}>
      <div><b>${p.name}</b><small>${fmt(p.rate)} ₽/м²</small></div></label>`).join('');
  el.opts.innerHTML = OPTIONS.map(o => `
    <label class="switch"><input type="checkbox" value="${o.id}">
      <span class="t"><b>${o.name}</b><small>${o.note} · ${o.fixed ? fmt(o.fixed) + ' ₽' : '+' + fmt(o.perM2) + ' ₽/м²'}</small></span>
      <span class="knob"></span></label>`).join('');
  el.urg.innerHTML = URGENCY.map((u, i) => `
    <label><input type="radio" name="urg" value="${i}" ${i === state.urg ? 'checked' : ''}>${u.name}<small>${u.note}</small></label>`).join('');

  function compute() {
    const p = PACKAGES[state.pkg], u = URGENCY[state.urg], a = state.area;
    const lines = [{ n: `${p.name} · ${a} м²`, v: p.rate * a }];
    let sum = p.rate * a;
    OPTIONS.filter(o => state.opts.has(o.id)).forEach(o => {
      const v = o.fixed ? o.fixed : o.perM2 * a; sum += v; lines.push({ n: o.name, v });
    });
    const urgSum = sum * u.k;
    if (u.k !== 1) lines.push({ n: `${u.name} (×${String(u.k).replace('.', ',')})`, v: urgSum - sum });
    let disc = 0;
    if (a >= PRICING.bigAreaFrom) disc += PRICING.bigAreaDiscount;
    if (state.opts.size >= PRICING.comboFrom) disc += PRICING.comboDiscount;
    const save = urgSum * disc, total = urgSum - save;
    if (disc) lines.push({ n: `Скидка ${Math.round(disc * 100)}%`, v: -save });
    const weeks = Math.max(2, Math.round((p.weeks + a / 30) * u.t));
    return { lines, total, save, weeks, perM2: total / a };
  }

  function renderCalc() {
    const c = compute();
    el.areaOut.textContent = `${state.area} м²`;
    el.area.style.setProperty('--p', ((state.area - PRICING.minArea) / (PRICING.maxArea - PRICING.minArea) * 100) + '%');
    el.lines.innerHTML = c.lines.map(l => `<li><span>${l.n}</span><span>${l.v < 0 ? '−' : ''}${fmt(Math.abs(l.v))} ₽</span></li>`).join('');
    el.weeks.textContent = `${c.weeks} ${plural(c.weeks, 'неделя', 'недели', 'недель')}`;
    el.perM2.textContent = `${fmt(c.perM2)} ₽`;
    el.save.hidden = !c.save;
    if (c.save) el.save.textContent = `Вы экономите ${fmt(c.save)} ₽`;
    if (hasGsap && !reduce) {
      gsap.to(tv, { v: c.total, duration: .85, ease: 'power3.out', overwrite: true, onUpdate: () => { el.total.textContent = fmt(tv.v); } });
    } else { tv.v = c.total; el.total.textContent = fmt(c.total); }
    const p = PACKAGES[state.pkg];
    el.summary.innerHTML = `<span>Пакет «${p.name}», ${state.area} м², ${c.weeks} ${plural(c.weeks, 'неделя', 'недели', 'недель')}</span><b>${fmt(c.total)} ₽</b>`;
    el.field.value = `Пакет: ${p.name}; площадь: ${state.area} м²; опции: ${[...state.opts].join(',') || 'нет'}; срочность: ${URGENCY[state.urg].name}; итого: ${fmt(c.total)} ₽`;
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
    d.innerHTML = `<div class="art">${art(i)}</div><div class="meta"><small>${p.tag}</small><b>${p.name}</b><span>от ${fmt(p.rate)} ₽/м²</span></div>`;
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
      c.style.filter = d > .5 ? `brightness(${Math.max(.55, 1 - d * .2).toFixed(2)})` : 'none';
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
    $('#pickTag').textContent = p.tag; $('#pickName').textContent = p.name; $('#pickDesc').textContent = p.desc; $('#pickPrice').textContent = `${fmt(p.rate)} ₽`;
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
  function room(after) {
    const c = after
      ? { wall: ['#1d3578', '#0F1B3D'], floor: '#0a1331', sofa: '#2F5BFF', win: ['#8FB4FF', '#2a4a9c'], rug: '#8FB4FF', glow: true }
      : { wall: ['#4a5166', '#363c4e'], floor: '#272c3b', sofa: 'none', win: ['#9aa3b5', '#7f889b'], rug: 'none', glow: false };
    return `<svg viewBox="0 0 800 400" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <linearGradient id="w${after}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${c.wall[0]}"/><stop offset="1" stop-color="${c.wall[1]}"/></linearGradient>
        <linearGradient id="s${after}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${c.win[0]}"/><stop offset="1" stop-color="${c.win[1]}"/></linearGradient>
        <radialGradient id="l${after}"><stop offset="0" stop-color="#ffd9a0" stop-opacity=".85"/><stop offset="1" stop-color="#ffd9a0" stop-opacity="0"/></radialGradient>
      </defs>
      <rect width="800" height="400" fill="url(#w${after})"/>
      <path d="M0 290h800v110H0z" fill="${c.floor}"/>
      ${after ? '<path d="M0 320h800M0 350h800M0 380h800" stroke="#fff" stroke-opacity=".05"/>' : '<path d="M60 290l-30 110M240 290l-20 110M420 290v110M600 290l20 110" stroke="#fff" stroke-opacity=".07"/>'}
      <rect x="520" y="50" width="190" height="200" rx="4" fill="url(#s${after})" stroke="#fff" stroke-opacity=".35" stroke-width="3"/>
      <path d="M615 50v200M520 150h190" stroke="#fff" stroke-opacity=".4" stroke-width="3"/>
      ${after ? `
        <rect x="170" y="62" width="170" height="100" rx="3" fill="none" stroke="#fff" stroke-opacity=".7" stroke-width="2"/>
        <circle cx="255" cy="112" r="26" fill="#8FB4FF" fill-opacity=".5"/>
        <ellipse cx="300" cy="352" rx="250" ry="30" fill="${c.rug}" fill-opacity=".16"/>
        <rect x="130" y="196" width="340" height="86" rx="22" fill="${c.sofa}" fill-opacity=".92"/>
        <rect x="150" y="160" width="300" height="70" rx="20" fill="${c.sofa}"/>
        <rect x="112" y="206" width="44" height="82" rx="18" fill="#5d86ff"/><rect x="444" y="206" width="44" height="82" rx="18" fill="#5d86ff"/>
        <rect x="610" y="150" width="3" height="140" fill="#fff" fill-opacity=".8"/>
        <path d="M585 150l28-40 28 40z" fill="#fff" fill-opacity=".9"/>
        <circle cx="613" cy="160" r="120" fill="url(#l${after})"/>
        <path d="M730 290c-10-50 0-90 12-110M742 190c-18 6-26 20-26 36M742 190c16 4 26 18 28 34" stroke="#8FB4FF" stroke-width="3" fill="none" stroke-linecap="round"/>
        <rect x="716" y="276" width="50" height="16" rx="4" fill="#fff" fill-opacity=".85"/>`
      : `
        <path d="M130 282V196h340v86M150 196v-40h300v40" fill="none" stroke="#fff" stroke-opacity=".28" stroke-width="2" stroke-dasharray="7 7"/>
        <path d="M130 310h340" stroke="#ff8a9b" stroke-opacity=".6" stroke-dasharray="4 4"/>
        <text x="300" y="332" fill="#ff8a9b" fill-opacity=".8" font-size="13" text-anchor="middle" font-family="sans-serif">3 400 мм</text>
        <rect x="620" y="244" width="46" height="46" rx="3" fill="#5a6177"/><rect x="640" y="214" width="46" height="34" rx="3" fill="#69718a"/>
        <path d="M200 60l140 4M210 70v40" stroke="#fff" stroke-opacity=".2" stroke-width="2"/>
        <path d="M60 80c20-10 30 10 50 0" stroke="#fff" stroke-opacity=".18" fill="none" stroke-width="2"/>`}
    </svg>`;
  }
  $('#baAfter').innerHTML = room(true);
  $('#baBefore').innerHTML = room(false);
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

  /* ===================== АНИМАЦИИ (GSAP) ===================== */
  if (!hasGsap || reduce) {
    $$('[data-count]').forEach(n => n.textContent = n.dataset.count + (n.dataset.suffix || ''));
    $('#stepsFill').style.transform = 'none';
    $$('.step').forEach(s => s.classList.add('on'));
    return;
  }

  // Курсор
  const cur2 = $('#cursor');
  if (finePointer) {
    const qx = gsap.quickTo(cur2, 'x', { duration: .35, ease: 'power3' }), qy = gsap.quickTo(cur2, 'y', { duration: .35, ease: 'power3' });
    addEventListener('pointermove', e => { cur2.classList.add('on'); qx(e.clientX); qy(e.clientY); cur2.classList.toggle('big', !!e.target.closest('a,button,.pcard,input,label,.ba,.slider,.q')); });
    document.addEventListener('mouseleave', () => cur2.classList.remove('on'));
  }

  // Магнитные кнопки
  if (finePointer) $$('.magnetic').forEach(b => {
    b.addEventListener('pointermove', e => { const r = b.getBoundingClientRect(); gsap.to(b, { x: (e.clientX - r.left - r.width / 2) * .22, y: (e.clientY - r.top - r.height / 2) * .32, duration: .4, ease: 'power3.out' }); });
    b.addEventListener('pointerleave', () => gsap.to(b, { x: 0, y: 0, duration: .8, ease: 'elastic.out(1,.45)' }));
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
    onEnter: els => gsap.to(els, { opacity: 1, y: 0, filter: 'blur(0px)', duration: 1, stagger: .12, ease: 'power3.out', overwrite: true,
      onComplete: () => els.forEach(x => { x.classList.add('in'); x.style.removeProperty('transform'); x.style.removeProperty('opacity'); x.style.removeProperty('filter'); }) })
  });

  // Параллакс свечений
  gsap.to('.g1', { y: 260, ease: 'none', scrollTrigger: { start: 0, end: 'max', scrub: true } });
  gsap.to('.g2', { y: -200, ease: 'none', scrollTrigger: { start: 0, end: 'max', scrub: true } });
  gsap.to('.g3', { y: 340, x: -120, ease: 'none', scrollTrigger: { start: 0, end: 'max', scrub: true } });

  // Hero: параллакс от мыши
  const hv = $('#heroVisual');
  if (finePointer) hv.parentElement.addEventListener('pointermove', e => {
    const r = hv.getBoundingClientRect(), nx = (e.clientX - r.left) / r.width - .5, ny = (e.clientY - r.top) / r.height - .5;
    $$('.chip', hv).forEach(c => gsap.to(c, { x: -nx * +c.dataset.depth * 2, y: -ny * +c.dataset.depth * 2, duration: .9, ease: 'power3.out', overwrite: 'auto' }));
  });

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
  intro.to('.pre-line span', { scaleX: 1, duration: 1.1, ease: 'power2.inOut' })
    .to('.pre-logo', { opacity: 0, y: -10, duration: .4 }, '+=.1')
    .to('#preloader', { yPercent: -100, duration: .9, ease: 'power4.inOut' }, '<')
    .to('.hero .line .inner', { y: 0, duration: 1.2, stagger: .12 }, '-=.35')
    .to('[data-hero]', { opacity: 1, y: 0, duration: 1, stagger: .12 }, '-=.9')
    .to('.orb', { opacity: 1, duration: 1.4 }, '-=1.1')
    .fromTo('.chip', { y: 30 }, { opacity: 1, y: 0, duration: 1, stagger: .15 }, '-=1')
    .add(() => $('#preloader').remove());
})();
