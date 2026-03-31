// ─── КОНФИГ ──────────────────────────────────────────────
const WEBHOOK_URL = 'https://fenesotired.beget.app/webhook-test/trafiqo-assistant';
const BOT_DELAY = 800;

// ─── СОСТОЯНИЕ ───────────────────────────────────────────
const botState = {
  isOpen: false,
  messages: [],
  isTyping: false
};

// ─── УТИЛИТЫ ─────────────────────────────────────────────
const getBotContainer = () =>
  document.querySelector('.bot-widget__messages');

const scrollToBottom = () => {
  const c = getBotContainer();
  if (c) c.scrollTop = c.scrollHeight;
};

// ─── РЕНДЕР СООБЩЕНИЯ ────────────────────────────────────
const renderMessage = (text, type) => {
  const container = getBotContainer();
  if (!container) return;
  const msg = document.createElement('div');
  msg.className = `bot-message bot-message--${type}`;
  msg.textContent = text;
  container.appendChild(msg);
  requestAnimationFrame(() => {
    msg.classList.add('is-visible');
    scrollToBottom();
  });
};

// ─── ИНДИКАТОР ПЕЧАТАНИЯ ─────────────────────────────────
const showTyping = () => {
  const container = getBotContainer();
  if (!container) return null;
  const el = document.createElement('div');
  el.className = 'bot-typing';
  el.innerHTML = '<span></span><span></span><span></span>';
  el.id = 'botTyping';
  container.appendChild(el);
  scrollToBottom();
  return el;
};

const hideTyping = () => {
  const el = document.getElementById('botTyping');
  if (el) el.remove();
};

// ─── ОТПРАВКА В ВЕБХУК ───────────────────────────────────
const sendToWebhook = async (userMessage) => {
  try {
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: userMessage,
        history: botState.messages,
        source: 'trafiqo-site'
      })
    });
    if (!response.ok) throw new Error('Webhook error');
    const data = await response.json();
    return data.reply || data.text ||
           data.output || data.response ||
           'Понял! Свяжемся с вами в ближайшее время.';
  } catch (error) {
    console.error('Webhook error:', error);
    return 'Что-то пошло не так. Напишите нам напрямую → @trafiqo';
  }
};

// ─── ОБРАБОТКА СООБЩЕНИЯ ─────────────────────────────────
const handleUserMessage = async (text) => {
  if (!text.trim() || botState.isTyping) return;
  botState.isTyping = true;

  renderMessage(text, 'user');
  botState.messages.push({ role: 'user', content: text });

  const typing = showTyping();
  const reply = await sendToWebhook(text);
  hideTyping();

  renderMessage(reply, 'bot');
  botState.messages.push({ role: 'assistant', content: reply });
  botState.isTyping = false;
};

// ─── РЕНДЕР ИНПУТА ───────────────────────────────────────
const renderInput = () => {
  const wrap = document.querySelector('.bot-widget__input-wrap');
  if (!wrap) return;
  wrap.innerHTML = '';

  const input = document.createElement('input');
  input.type = 'text';
  input.className = 'bot-input';
  input.placeholder = 'Напишите сообщение...';
  input.setAttribute('aria-label', 'Сообщение боту');

  const btn = document.createElement('button');
  btn.className = 'bot-send';
  btn.setAttribute('aria-label', 'Отправить');
  btn.innerHTML = `<svg width="16" height="16"
    viewBox="0 0 24 24" fill="none"
    stroke="currentColor" stroke-width="2"
    stroke-linecap="round" stroke-linejoin="round">
    <line x1="22" y1="2" x2="11" y2="13"/>
    <polygon points="22 2 15 22 11 13 2 9 22 2"/>
  </svg>`;

  const submit = () => {
    const val = input.value.trim();
    if (!val) return;
    input.value = '';
    handleUserMessage(val);
  };

  btn.addEventListener('click', submit);
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') submit();
  });

  wrap.appendChild(input);
  wrap.appendChild(btn);
  setTimeout(() => input.focus(), 100);
};

// ─── ОТКРЫТЬ / ЗАКРЫТЬ ───────────────────────────────────
const toggleWidget = () => {
  const widget = document.querySelector('.bot-widget');
  if (!widget) return;

  botState.isOpen = !botState.isOpen;
  widget.classList.toggle('is-open', botState.isOpen);

  const toggle = widget.querySelector('.bot-widget__toggle');
  toggle?.setAttribute('aria-expanded',
    String(botState.isOpen));

  if (botState.isOpen && botState.messages.length === 0) {
    setTimeout(() => {
      renderMessage(
        'Привет! Я помощник TRAFIQO. Расскажите о вашем проекте — помогу разобраться.',
        'bot'
      );
      botState.messages.push({
        role: 'assistant',
        content: 'Привет! Я помощник TRAFIQO. Расскажите о вашем проекте — помогу разобраться.'
      });
      renderInput();
    }, BOT_DELAY);
  }
};

// ─── ИНИЦИАЛИЗАЦИЯ ───────────────────────────────────────
const initBotWidget = () => {
  const widget = document.querySelector('.bot-widget');
  if (!widget) return;

  const toggle = widget.querySelector('.bot-widget__toggle');
  toggle?.addEventListener('click', toggleWidget);

  const closeBtn = document.getElementById('botClose');
  if (closeBtn) {
    closeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (botState.isOpen) toggleWidget();
    });
  }

  const bubble = widget.querySelector('.bot-widget__bubble');
  if (bubble) {
    setTimeout(() => {
      bubble.style.opacity = '1';
      bubble.style.transform = 'translateY(0)';
    }, 3000);
    toggle?.addEventListener('click', () => {
      bubble.style.display = 'none';
    }, { once: true });
  }
};

document.addEventListener('DOMContentLoaded', initBotWidget);
