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
  toggle?.setAttribute('aria-expanded', String(botState.isOpen));

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

const initBotWidget = () => {
  const widget = document.querySelector('.bot-widget');
  if (!widget) return;

  const toggle = widget.querySelector('.bot-widget__toggle');
  const bubble = widget.querySelector('.bot-widget__bubble');

  toggle?.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleWidget();
    if (bubble) bubble.style.display = 'none';
  });

  document.addEventListener('click', (e) => {
    if (e.target.closest('.bot-widget__close')) {
      if (botState.isOpen) toggleWidget();
    }
  });

  if (bubble) {
    setTimeout(() => {
      bubble.style.opacity = '1';
      bubble.style.transform = 'translateY(0)';
    }, 3000);
  }
};

document.addEventListener('DOMContentLoaded', initBotWidget);
