// ─── КОНФИГ ──────────────────────────────────────────────
const BOT_DELAY_SHORT = 600;
const BOT_DELAY_LONG  = 1000;

// ─── СЦЕНАРИЙ ДИАЛОГА ────────────────────────────────────
const STEPS = [
  { id: 'greeting', msg: 'Привет! Помогу оформить заявку. Как вас зовут?',
    type: 'input',   field: 'name',    nextId: 'service' },
  { id: 'service',  msg: (s) => `${s.name}, отлично! Что вас интересует?`,
    type: 'options', field: 'service', nextId: 'budget',
    options: ['Сайт', 'Приложение', 'Бот / Автоматизация', 'Другое'] },
  { id: 'budget',   msg: 'Понял. Есть примерное понимание бюджета?',
    type: 'options', field: 'budget',  nextId: 'contact',
    options: ['До 50 000 ₽', '50–150 000 ₽', 'Выше', 'Пока не знаю'] },
  { id: 'contact',  msg: (s) => `Отлично, ${s.name}! Оставьте контакт — свяжемся в течение 24 часов.`,
    type: 'input',   field: 'contact', nextId: 'end' },
  { id: 'end',      msg: 'Заявка принята! Ждите — скоро свяжемся.', type: 'end' }
];

// ─── СОСТОЯНИЕ + УТИЛИТЫ ─────────────────────────────────
const state      = { isOpen: false, started: false, data: {} };
const botDelay   = (ms) => new Promise((r) => setTimeout(r, ms));
const getBox     = ()   => document.querySelector('.bot-widget__messages');
const scrollDown = (el) => { if (el) el.scrollTop = el.scrollHeight; };

// ─── РЕНДЕР СООБЩЕНИЯ ────────────────────────────────────
const renderMessage = (text, type) => {
  const box = getBox();
  if (!box) return;
  const div = Object.assign(document.createElement('div'), {
    className: `bot-message bot-message--${type}`,
    textContent: text
  });
  box.appendChild(div);
  scrollDown(box);
};

// ─── РЕНДЕР ВАРИАНТОВ ────────────────────────────────────
const renderOptions = (options, onSelect) => {
  const box  = getBox();
  if (!box) return;
  const wrap = Object.assign(document.createElement('div'), { className: 'bot-options' });
  options.forEach((opt) => {
    const btn = Object.assign(document.createElement('button'), {
      className: 'bot-option', textContent: opt
    });
    btn.addEventListener('click', () => {
      renderMessage(opt, 'user');
      wrap.remove();
      onSelect(opt);
    }, { once: true });
    wrap.appendChild(btn);
  });
  box.appendChild(wrap);
  scrollDown(box);
};

// ─── РЕНДЕР ПОЛЯ ВВОДА ───────────────────────────────────
const renderInput = (placeholder, onSubmit) => {
  const box  = getBox();
  if (!box) return;
  const wrap  = Object.assign(document.createElement('div'), { className: 'bot-input-wrap' });
  const input = Object.assign(document.createElement('input'), {
    className: 'bot-input', placeholder
  });
  const btn = Object.assign(document.createElement('button'), {
    className: 'bot-send', textContent: 'Отправить'
  });
  const submit = () => {
    const val = input.value.trim();
    if (!val) return;
    renderMessage(val, 'user');
    wrap.remove();
    onSubmit(val);
  };
  btn.addEventListener('click', submit);
  input.addEventListener('keydown', (e) => { if (e.key === 'Enter') submit(); });
  wrap.append(input, btn);
  box.appendChild(wrap);
  input.focus();
  scrollDown(box);
};

// ─── ИНДИКАТОР ПЕЧАТИ ────────────────────────────────────
const showTyping = () => {
  const box = getBox();
  if (!box) return null;
  const el = Object.assign(document.createElement('div'), {
    className: 'bot-message bot-message--bot bot-typing', textContent: '...'
  });
  box.appendChild(el);
  scrollDown(box);
  return el;
};

// ─── СЛЕДУЮЩИЙ ШАГ ───────────────────────────────────────
const nextStep = async (stepId, userValue) => {
  const step = STEPS.find((s) => s.id === stepId);
  if (!step) return;
  if (userValue !== undefined && step.field) state.data[step.field] = userValue;

  const typing = showTyping();
  await botDelay(stepId === 'greeting' ? BOT_DELAY_SHORT : BOT_DELAY_LONG);
  typing?.remove();

  const text = typeof step.msg === 'function' ? step.msg(state.data) : step.msg;
  renderMessage(text, 'bot');

  if (step.type === 'options') {
    renderOptions(step.options, (val) => nextStep(step.nextId, val));
  } else if (step.type === 'input') {
    const ph = step.field === 'name' ? 'Ваше имя...' : '@username или +7...';
    renderInput(ph, (val) => nextStep(step.nextId, val));
  } else if (step.type === 'end') {
    sendBotData();
  }
};

// ─── ОТПРАВКА ДАННЫХ ─────────────────────────────────────
const sendBotData = async () => {
  try {
    if (typeof sendToTelegram === 'function') await sendToTelegram(state.data);
    if (typeof sendToSheets === 'function')  await sendToSheets(state.data);
  } catch (error) { console.error('Bot send failed:', error); }
};

// ─── ОТКРЫТЬ / ЗАКРЫТЬ ───────────────────────────────────
const toggleWidget = () => {
  const widget = document.querySelector('.bot-widget');
  const chat   = document.querySelector('.bot-widget__chat');
  if (!widget) return;
  state.isOpen = !state.isOpen;
  widget.classList.toggle('is-open', state.isOpen);
  widget.querySelector('.bot-widget__toggle')?.setAttribute('aria-expanded', String(state.isOpen));
  if (chat) state.isOpen ? chat.removeAttribute('hidden') : chat.setAttribute('hidden', '');
  if (state.isOpen && !state.started) { state.started = true; nextStep('greeting'); }
};

// ─── ИНИЦИАЛИЗАЦИЯ ───────────────────────────────────────
const initBotWidget = () => {
  const toggle = document.querySelector('.bot-widget__toggle');
  const bubble = document.querySelector('.bot-widget__bubble');
  if (!toggle) return;
  bubble?.classList.add('is-hidden');
  toggle.addEventListener('click', () => { bubble?.classList.add('is-hidden'); toggleWidget(); });
  setTimeout(() => bubble?.classList.remove('is-hidden'), 3000);
};

document.addEventListener('DOMContentLoaded', initBotWidget);
