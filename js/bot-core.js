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
  if (!c) return;
  c.scrollTop = c.scrollHeight;
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
  showTyping();
  const reply = await sendToWebhook(text);
  hideTyping();
  renderMessage(reply, 'bot');
  botState.messages.push({ role: 'assistant', content: reply });
  botState.isTyping = false;
};
