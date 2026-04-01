// ─── КОНФИГ
const WEBHOOK_URL = 'https://fenesotired.beget.app/webhook/trafiqo-assistant';
const BOT_DELAY = 800;

// ─── СОСТОЯНИЕ
const botState = {
  isOpen: false,
  messages: [],
  isTyping: false,
  sessionId: Math.random().toString(36).slice(2, 10)
};

const getBotContainer = () =>
  document.querySelector('.bot-widget__messages');

const scrollToBottom = () => {
  const c = getBotContainer();
  if (!c) return;
  c.scrollTop = c.scrollHeight;
};

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

const sendToWebhook = async (userMessage) => {
  try {
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        session_id: botState.sessionId,
        messages: [...botState.messages],
        new_message: userMessage,
        source: 'trafiqo-site'
      })
    });
    if (!response.ok) throw new Error('error');
    const data = await response.json();
    return data.content?.[0]?.text || data.reply || data.text ||
           data.output || data.response ||
           'Понял! Свяжемся в ближайшее время.';
  } catch (error) {
    console.error('Webhook:', error);
    return 'Напишите нам напрямую — ответим быстро: @trafiqo';
  }
};

const handleUserMessage = async (text) => {
  if (!text.trim() || botState.isTyping) return;
  botState.isTyping = true;
  renderMessage(text, 'user');
  botState.messages.push({ role: 'user', content: text });
  showTyping();
  const reply = await sendToWebhook(text);
  hideTyping();
  renderMessage(reply, 'bot');
  botState.messages.push({
    role: 'assistant', content: reply
  });
  botState.isTyping = false;
};
