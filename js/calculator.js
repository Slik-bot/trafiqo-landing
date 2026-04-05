// ─── КОНФИГ ──────────────────────────────────────────────────────────────────
const CALC_CURRENCY_API = 'https://api.exchangerate-api.com/v4/latest/RUB';
const CALC_CACHE_KEY   = 'trafiqo_rates';
const CALC_CACHE_TTL   = 86400000;
const CALC_STATE_KEY   = 'calc_state';

// ─── СОСТОЯНИЕ ───────────────────────────────────────────────────────────────
let cs = { who: null, type: null, options: new Set(), urgency: 1.0, currency: '₽', comment: '', rates: null };
let calcTimerInterval = null;
let currentCheck = { num: '', total: 0, market: 0, t: null };

// ─── УТИЛИТЫ ─────────────────────────────────────────────────────────────────
const qs    = (s) => document.querySelector(s);
const qsa   = (s) => document.querySelectorAll(s);
const fmt   = (n) => n.toLocaleString('ru-RU');
const getType = () => CALC_TYPES.find(t => t.key === cs.type);

const plural = (n) => {
  const m = n % 10, h = n % 100;
  if (m === 1 && h !== 11) return 'опция';
  if ([2, 3, 4].includes(m) && ![12, 13, 14].includes(h)) return 'опции';
  return 'опций';
};

// ─── ВАЛЮТА ──────────────────────────────────────────────────────────────────
const loadRates = async () => {
  try {
    const cached = localStorage.getItem(CALC_CACHE_KEY);
    if (cached) {
      const { ts, data } = JSON.parse(cached);
      if (Date.now() - ts < CALC_CACHE_TTL) { cs.rates = data; return; }
    }
    const res = await fetch(CALC_CURRENCY_API);
    if (!res.ok) return;
    const json = await res.json();
    cs.rates = json.rates;
    localStorage.setItem(CALC_CACHE_KEY, JSON.stringify({ ts: Date.now(), data: json.rates }));
  } catch (e) {
    console.error('Currency fetch failed:', e);
  }
};

const conv = (rub) => {
  if (!cs.rates || cs.currency === '₽') return `${fmt(rub)} ₽`;
  const codes = { '$': 'USD', '€': 'EUR', 'USDT': 'USDT' };
  const rate = cs.rates[codes[cs.currency]] || 1;
  return `${fmt(Math.round(rub * rate))} ${cs.currency}`;
};

// ─── РАСЧЁТ ──────────────────────────────────────────────────────────────────
const calcBase = () => {
  const t = getType();
  if (!t) return 0;
  let sum = t.price;
  cs.options.forEach(name => { const o = (CALC_OPTIONS[t.key] || []).find(x => x.name === name); if (o) sum += o.price; });
  return Math.round(sum * cs.urgency);
};

const calcMarket = () => {
  const t = getType();
  if (!t) return 0;
  let sum = t.market;
  cs.options.forEach(name => { const o = (CALC_OPTIONS[t.key] || []).find(x => x.name === name); if (o) sum += Math.round(o.price * 1.8); });
  return Math.round(sum * cs.urgency);
};

const updateBar = () => {
  const total   = calcBase();
  const t       = getType();
  const unit    = t?.unit || '';
  const barPrice = qs('#calc-bar-price');
  const barCount = qs('#calc-bar-count');
  const barBtn   = qs('#calc-bar-btn');
  const resetBtn = qs('#calc-bar-reset');
  if (barPrice) barPrice.textContent = cs.type ? `от ${conv(total)}${unit}` : '—';
  if (barCount) barCount.textContent = `Выбрано ${cs.options.size} ${plural(cs.options.size)}`;
  if (barBtn)   barBtn.disabled = !cs.type;
  if (resetBtn) resetBtn.hidden = !cs.type;
};

// ─── LOCALSTORAGE ─────────────────────────────────────────────────────────────
const saveState = () => {
  const s = { who: cs.who, type: cs.type, options: [...cs.options], urgency: cs.urgency, currency: cs.currency, comment: cs.comment };
  localStorage.setItem(CALC_STATE_KEY, JSON.stringify(s));
};

const loadSavedState = () => {
  try {
    const raw = localStorage.getItem(CALC_STATE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) { return null; }
};

const restoreState = (s) => {
  cs.who     = s.who     || null;
  cs.type    = s.type    || null;
  cs.options = new Set(s.options || []);
  cs.urgency = s.urgency || 1.0;
  cs.currency = s.currency || '₽';
  cs.comment = s.comment || '';
};

const resetCalc = () => {
  cs.who = null; cs.type = null; cs.options = new Set(); cs.urgency = 1.0; cs.comment = '';
  localStorage.removeItem(CALC_STATE_KEY);
  renderSteps();
  qs('#calc-steps')?.scrollTo({ top: 0, behavior: 'smooth' });
};

// ─── ХИНТЫ ───────────────────────────────────────────────────────────────────
const toggleHint = (btn, hintId) => {
  const next = btn.nextElementSibling;
  const wasOpen = next?.classList.contains('calc-hint');
  qsa('.calc-hint').forEach(h => h.remove());
  if (wasOpen) return;
  const t = getType();
  const opt = (CALC_OPTIONS[t?.key] || []).find(o => o.name === hintId);
  if (!opt?.hint) return;
  const div = document.createElement('div');
  div.className = 'calc-hint';
  div.textContent = opt.hint;
  btn.insertAdjacentElement('afterend', div);
};

// ─── HTML ШАГОВ ──────────────────────────────────────────────────────────────
const stepWhoHTML = () => `
  <div class="calc-step">
    <p class="calc-step__label">01 — Кто вы?</p>
    <h3 class="calc-step__title">Расскажите о себе</h3>
    <div class="calc-opts calc-opts--who">
      ${WHO_OPTS.map(w => `<button class="calc-opt${cs.who === w.id ? ' calc-opt--on' : ''}" data-who="${w.id}">${w.label}</button>`).join('')}
    </div>
  </div>`;

const stepTypeHTML = () => {
  const t = getType();
  return `
    <div class="calc-step">
      <p class="calc-step__label">02 — Тип проекта</p>
      <h3 class="calc-step__title">Что нужно сделать?</h3>
      <div class="calc-opts calc-opts--types">
        ${CALC_TYPES.map(x => `
          <button class="calc-opt calc-opt--type${cs.type === x.key ? ' calc-opt--on' : ''}" data-type="${x.key}">
            <span class="calc-opt__name">${x.name}</span>
            <span class="calc-opt__price">от ${fmt(x.price)} ₽${x.unit || ''}</span>
          </button>`).join('')}
      </div>
      ${t ? `<div class="calc-included"><span class="calc-included__lbl">Уже входит в цену:</span><span class="calc-included__txt">${t.included}</span></div>` : ''}
    </div>`;
};

const stepAddonsHTML = () => {
  const t = getType();
  if (!t) return '';
  return `
    <div class="calc-step" data-step="addons">
      <p class="calc-step__label">03 — Дополните проект · мультивыбор</p>
      <h3 class="calc-step__title">Что добавим?</h3>
      <div class="calc-opts calc-opts--addons">
        ${(CALC_OPTIONS[t.key] || []).map(o => `
          <button class="calc-opt calc-opt--addon${cs.options.has(o.name) ? ' calc-opt--on' : ''}" data-opt="${o.name}">
            ${o.popular ? '<span class="calc-opt__badge">Популярно</span>' : ''}
            <span class="calc-opt__name">${o.name}${o.hint ? `<span class="calc-opt__info-icon" data-hint-id="${o.name}" aria-label="Подробнее">ⓘ</span>` : ''}</span>
            <span class="calc-opt__price">+${fmt(o.price)} ₽</span>
          </button>`).join('')}
      </div>
    </div>`;
};

const stepUrgencyHTML = () => `
  <div class="calc-step">
    <p class="calc-step__label">04 — Срок</p>
    <h3 class="calc-step__title">Как быстро нужно?</h3>
    <div class="calc-opts calc-opts--urgency">
      ${URGENCY_OPTS.map(u => `
        <button class="calc-opt${cs.urgency === u.mult ? ' calc-opt--on' : ''}" data-urgency="${u.mult}">
          <span class="calc-opt__name">${u.label}</span>
          <span class="calc-opt__sub">${u.sub}</span>
          ${u.mult !== 1.0 ? `<span class="calc-opt__mult">${u.mult > 1 ? '+' : ''}${Math.round((u.mult - 1) * 100)}%</span>` : ''}
        </button>`).join('')}
    </div>
  </div>`;

const stepCurrencyHTML = () => `
  <div class="calc-step">
    <p class="calc-step__label">Валюта</p>
    <h3 class="calc-step__title">Показать цену в</h3>
    <div class="calc-opts calc-opts--currency">
      ${CURRENCIES.map(c => `<button class="calc-opt${cs.currency === c ? ' calc-opt--on' : ''}" data-curr="${c}">${c}</button>`).join('')}
    </div>
  </div>`;

const stepCommentHTML = () => `
  <div class="calc-step">
    <p class="calc-step__label">05 — Комментарий (необязательно)</p>
    <h3 class="calc-step__title">Особые пожелания</h3>
    <textarea class="calc-textarea" id="calc-comment" placeholder="Особые пожелания, сроки, вопросы...">${cs.comment || ''}</textarea>
  </div>`;

// ─── РЕНДЕР И СОБЫТИЯ ────────────────────────────────────────────────────────
const renderSteps = () => {
  const wrap = qs('#calc-steps');
  if (!wrap) return;
  let html = stepWhoHTML();
  if (cs.who) html += stepTypeHTML();
  if (cs.type) html += stepAddonsHTML() + stepUrgencyHTML() + stepCurrencyHTML() + stepCommentHTML();
  wrap.innerHTML = html;
  bindStepEvents();
  updateBar();
  if (cs.type) {
    const addonsEl = wrap.querySelector('[data-step="addons"]');
    if (addonsEl) {
      setTimeout(() => {
        addonsEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  }
};

const bindStepEvents = () => {
  qsa('[data-who]').forEach(b => b.addEventListener('click', () => {
    cs.who = b.dataset.who; saveState(); renderSteps();
  }));
  qsa('[data-type]').forEach(b => b.addEventListener('click', () => {
    cs.type = b.dataset.type; cs.options = new Set(); saveState(); renderSteps();
  }));
  qsa('[data-opt]').forEach(b => b.addEventListener('click', (e) => {
    const hintTrig = e.target.closest('[data-hint-id]');
    if (hintTrig) { toggleHint(b, hintTrig.dataset.hintId); return; }
    const id = b.dataset.opt;
    cs.options.has(id) ? cs.options.delete(id) : cs.options.add(id);
    b.classList.toggle('calc-opt--on');
    saveState(); updateBar();
  }));
  qsa('[data-urgency]').forEach(b => b.addEventListener('click', () => {
    cs.urgency = parseFloat(b.dataset.urgency);
    qsa('[data-urgency]').forEach(x => x.classList.toggle('calc-opt--on', parseFloat(x.dataset.urgency) === cs.urgency));
    saveState(); updateBar();
  }));
  qsa('[data-curr]').forEach(b => b.addEventListener('click', () => {
    cs.currency = b.dataset.curr;
    qsa('[data-curr]').forEach(x => x.classList.toggle('calc-opt--on', x.dataset.curr === cs.currency));
    saveState(); updateBar();
  }));
  const commentEl = qs('#calc-comment');
  if (commentEl) commentEl.addEventListener('input', () => { cs.comment = commentEl.value; saveState(); });
};

// ─── ЧЕК ─────────────────────────────────────────────────────────────────────
const buildCheckLines = (t) => {
  const urg = URGENCY_OPTS.find(u => u.mult === cs.urgency);
  let html = `<div class="calc-check__line"><span>${t.name} (базовая)</span><span>от ${conv(t.price)}${t.unit || ''}</span></div>`;
  cs.options.forEach(name => {
    const o = (CALC_OPTIONS[t.key] || []).find(x => x.name === name);
    if (o) html += `<div class="calc-check__line"><span>${o.name}</span><span>+${conv(o.price)}</span></div>`;
  });
  if (cs.urgency !== 1.0 && urg) {
    const sign = cs.urgency > 1 ? '+' : '';
    html += `<div class="calc-check__line calc-check__line--coeff"><span>Коэффициент (${urg.label})</span><span>${sign}${Math.round((cs.urgency - 1) * 100)}%</span></div>`;
  }
  return html;
};

const getDesc = (t) => {
  const map = CALC_DESCRIPTIONS[t.key];
  if (map) return map[cs.who || 'launch'];
  const who = WHO_OPTS.find(w => w.id === cs.who);
  return `${who ? who.intro + ' ' : ''}${t.desc}`;
};

const buildCompareHTML = (total, market) => `
  <div class="calc-check__compare">
    <div class="calc-check__cmp-row"><span>Аналог у студий:</span><span class="calc-check__strike">от ${conv(market)}</span></div>
    <div class="calc-check__cmp-row"><span>TRAFIQO:</span><span>от ${conv(total)}</span></div>
    <div class="calc-check__cmp-row calc-check__cmp-row--save"><span>Экономия:</span><span class="calc-check__saving">${conv(market - total)}</span></div>
  </div>`;

const buildReceiptHTML = (t, total, market, num, date, desc) => `
  <button class="calc-modal__close" id="calcClose" aria-label="Закрыть">
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M5 5l10 10M15 5L5 15" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
  </button>
  <div class="calc-check" role="region" aria-label="Расчёт стоимости">
    <div id="calc-check-content">
      <div class="calc-check__head"><span class="calc-check__brand">TRAFIQO</span><span class="calc-check__meta"><span id="calc-check-ref">#${num}</span> · ${date}</span></div>
      <div class="calc-check__lines">${buildCheckLines(t)}</div>
      <div class="calc-check__total"><span>Итого</span><strong class="calc-check__total-val">от ${conv(total)}${t.unit || ''}</strong></div>
      ${buildCompareHTML(total, market)}
      <p class="calc-check__desc">${desc}</p>
      <p class="calc-check__timer" id="calc-timer">Действителен ещё 72:00:00</p>
    </div>
    <button class="calc-check__copy" id="calc-copy-btn">Скопировать расчёт</button>
    <button class="calc-check__pdf" onclick="downloadPDF()">Скачать PDF</button>
    <button class="calc-submit btn btn--primary" id="calcSubmit">Обсудить проект</button>
  </div>`;

// ─── ТАЙМЕР ──────────────────────────────────────────────────────────────────
const startTimer = () => {
  const end = Date.now() + 72 * 3600000;
  const tick = () => {
    const rem = end - Date.now();
    if (rem <= 0) { clearInterval(calcTimerInterval); return; }
    const h = Math.floor(rem / 3600000);
    const m = Math.floor((rem % 3600000) / 60000);
    const s = Math.floor((rem % 60000) / 1000);
    const el = qs('#calc-timer');
    if (el) el.textContent = `Действителен ещё ${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };
  tick();
  calcTimerInterval = setInterval(tick, 1000);
};

const stopTimer = () => {
  if (calcTimerInterval) { clearInterval(calcTimerInterval); calcTimerInterval = null; }
};

// ─── КОПИРОВАНИЕ ─────────────────────────────────────────────────────────────
const copyCheck = () => {
  const { num, total, market, t } = currentCheck;
  const lines = [`TRAFIQO · Расчёт #${num} · ${new Date().toLocaleDateString('ru-RU')}`, '---', `${t.name}: от ${fmt(t.price)} ₽${t.unit || ''}`];
  cs.options.forEach(name => {
    const o = (CALC_OPTIONS[t.key] || []).find(x => x.name === name);
    if (o) lines.push(`${o.name}: +${fmt(o.price)} ₽`);
  });
  lines.push('---', `Итого: от ${fmt(total)} ₽`, `Аналог у студий: от ${fmt(market)} ₽`, `Экономия: ${fmt(market - total)} ₽`, '---', 'Действителен 72 часа · trafiqo.store');
  navigator.clipboard.writeText(lines.join('\n')).then(() => {
    const btn = qs('#calc-copy-btn');
    if (!btn) return;
    btn.textContent = 'Скопировано ✓';
    setTimeout(() => { const b = qs('#calc-copy-btn'); if (b) b.textContent = 'Скопировать расчёт'; }, 2000);
  }).catch(e => console.error('Copy failed:', e));
};

// ─── PDF ─────────────────────────────────────────────────────────────────────
const downloadPDF = () => {
  const el = document.createElement('div');
  el.innerHTML = buildPDFContent();
  document.body.appendChild(el);
  const ref = currentCheck.num || 'TR-0000';
  html2pdf()
    .set({
      margin: [15, 15, 15, 15],
      filename: `TRAFIQO-${ref}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, backgroundColor: '#ffffff' },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    })
    .from(el)
    .save()
    .then(() => document.body.removeChild(el));
};

// ─── РЕНДЕР ЧЕКА ─────────────────────────────────────────────────────────────
const renderCheck = () => {
  const modal = qs('#calc-modal');
  if (!modal) return;
  const t = getType();
  const total  = calcBase();
  const market = calcMarket();
  const num    = `TR-${Math.floor(1000 + Math.random() * 9000)}`;
  currentCheck = { num, total, market, t };
  modal.querySelector('.calc-modal__inner').innerHTML = buildReceiptHTML(t, total, market, num, new Date().toLocaleDateString('ru-RU'), getDesc(t));
  qs('#calcClose')?.addEventListener('click', () => { stopTimer(); closeModal(); });
  qs('#calcSubmit')?.addEventListener('click', goToContact);
  qs('#calc-copy-btn')?.addEventListener('click', copyCheck);
  initSwipe(modal.querySelector('.calc-modal__inner'));
  startTimer();
};

const goToContact = () => {
  closeModal();
  document.querySelector('#contact')?.scrollIntoView({ behavior: 'smooth' });
};

// ─── МОДАЛКА ─────────────────────────────────────────────────────────────────
const getMainHTML = (hasSaved) => `
  <div class="calc-modal__drag" aria-hidden="true"><span class="calc-modal__drag-bar"></span></div>
  <button class="calc-modal__close" id="calcClose" aria-label="Закрыть">
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M5 5l10 10M15 5L5 15" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
  </button>
  <div class="calc-modal__header">
    <h2 class="calc-modal__title">Рассчитать проект</h2>
    <p class="calc-modal__sub">Ориентировочная стоимость — точная цена после брифа.</p>
  </div>
  ${hasSaved ? `<div class="calc-continue"><span>Есть незавершённый расчёт</span><button class="calc-continue__btn" id="calc-continue">Продолжить</button></div>` : ''}
  <div class="calc-steps" id="calc-steps"></div>
  <div class="calc-bar" id="calc-bar">
    <div class="calc-bar__info">
      <span class="calc-bar__count" id="calc-bar-count">Выбрано 0 опций</span>
      <span class="calc-bar__price" id="calc-bar-price">—</span>
    </div>
    <div class="calc-bar__actions">
      <button class="calc-bar__reset" id="calc-bar-reset" hidden>Начать заново</button>
      <button class="calc-bar__btn btn btn--primary" id="calc-bar-btn" disabled>Рассчитать</button>
    </div>
  </div>`;

const openModal = () => {
  const saved = loadSavedState();
  cs = { who: null, type: null, options: new Set(), urgency: 1.0, currency: '₽', comment: '', rates: cs.rates };
  loadRates();
  const modal = qs('#calc-modal');
  if (!modal) return;
  modal.querySelector('.calc-modal__inner').innerHTML = getMainHTML(saved?.type);
  qs('#calcClose')?.addEventListener('click', closeModal);
  qs('#calc-bar-btn')?.addEventListener('click', () => { if (cs.type) renderCheck(); });
  qs('#calc-bar-reset')?.addEventListener('click', resetCalc);
  if (saved?.type) {
    qs('#calc-continue')?.addEventListener('click', () => {
      restoreState(saved);
      qs('.calc-continue')?.remove();
      renderSteps();
    });
  }
  renderSteps();
  modal.classList.add('calc-modal--open');
  document.body.classList.add('calc-body--locked');
  initSwipe(modal.querySelector('.calc-modal__inner'));
};

const closeModal = () => {
  stopTimer();
  qs('#calc-modal')?.classList.remove('calc-modal--open');
  document.body.classList.remove('calc-body--locked');
};

const initSwipe = (inner) => {
  if (!inner) return;
  let startY = 0, startScrollTop = 0, deltaY = 0;
  const getScroll = () => inner.querySelector('.calc-steps, .calc-check') || inner;
  inner.addEventListener('touchstart', (e) => {
    startY = e.touches[0].clientY;
    startScrollTop = getScroll().scrollTop;
    deltaY = 0;
  }, { passive: true });
  inner.addEventListener('touchmove', (e) => {
    deltaY = e.touches[0].clientY - startY;
    if (startScrollTop > 0 || deltaY <= 0) return;
    inner.style.transform = `translateY(${Math.min(deltaY, 200)}px)`;
    inner.style.transition = 'none';
  }, { passive: true });
  inner.addEventListener('touchend', () => {
    inner.style.transform = '';
    inner.style.transition = '';
    if (deltaY > 120 && startScrollTop === 0) closeModal();
  }, { passive: true });
};

// ─── ИНИТ ────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  qsa('[data-open-calc]').forEach(btn => btn.addEventListener('click', openModal));
  qs('#calc-modal')?.addEventListener('click', (e) => { if (e.target.id === 'calc-modal') closeModal(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });
});
