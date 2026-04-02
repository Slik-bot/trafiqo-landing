// ─── КОНФИГ ──────────────────────────────────────────────
const BOT_TOKEN = 'YOUR_BOT_TOKEN';
const CHAT_ID   = 'YOUR_CHAT_ID';
const SHEET_URL = 'YOUR_APPS_SCRIPT_URL';
const SITE_NAME = 'TRAFIQO Landing';
const TG_URL    = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
const checkRateLimit = () => Date.now() - (+localStorage.getItem('trafiqo_last_submit') || 0) >= 60000;
const escapeHtml = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// ─── ВАЛИДАЦИЯ ───────────────────────────────────────────
const validateForm = (data) => {
  if (data.website) return { valid: false, errors: [] };
  const errors  = [];
  const nameRe  = /^[a-zA-Zа-яА-ЯёЁ\s]{2,}$/u;
  const phoneRe = /^(\+7|8)\d{10}$/;
  const tgRe    = /^@[\w]{4,}$/;
  const contact = data.contact?.trim() ?? '';

  if (!nameRe.test(data.name?.trim() ?? ''))
    errors.push({ field: 'name',    message: 'Введите имя (минимум 2 буквы)' });
  if (!phoneRe.test(contact) && !tgRe.test(contact))
    errors.push({ field: 'contact', message: 'Введите телефон (+7...) или Telegram (@username)' });
  if (!data.service)
    errors.push({ field: 'service', message: 'Выберите услугу' });

  return { valid: errors.length === 0, errors };
};

const formatMessage = (data) => {
  const date = new Date().toLocaleString('ru-RU', { timeZone: 'Europe/Moscow' });
  return [
    `🔔 <b>Новая заявка!</b> — ${SITE_NAME}`,
    `👤 <b>Имя:</b> ${escapeHtml(data.name)}`,
    `📱 <b>Контакт:</b> ${escapeHtml(data.contact)}`,
    `🎯 <b>Услуга:</b> ${escapeHtml(data.service)}`,
    `⏱ <b>Срок:</b> ${escapeHtml(data.deadline || 'не указан')}`,
    `💬 <b>Комментарий:</b> ${escapeHtml(data.comment || '—')}`,
    `🕐 <b>Время:</b> ${date}`
  ].join('\n');
};

// ─── ОТПРАВКА В TELEGRAM ────────────────────────────────
const sendToTelegram = async (data) => {
  try {
    const res = await fetch(TG_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: CHAT_ID, text: formatMessage(data), parse_mode: 'HTML' })
    });
    return res.ok;
  } catch (error) {
    console.error('Telegram send failed:', error);
    return false;
  }
};

// ─── ОТПРАВКА В SHEETS ──────────────────────────────────
const sendToSheets = async (data) => {
  if (!SHEET_URL || SHEET_URL === 'YOUR_APPS_SCRIPT_URL') return true;
  try {
    const res = await fetch(SHEET_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ site: SITE_NAME, date: new Date().toISOString(), ...data })
    });
    return res.ok;
  } catch (error) {
    console.error('Sheets send failed:', error);
    return false;
  }
};

const showSuccess = (form) => { form.setAttribute('hidden', ''); document.querySelector('.contact-form__success')?.removeAttribute('hidden'); };
const showError = (message) => {
  const el = document.querySelector('.contact-form__error');
  if (!el) return;
  const p = el.querySelector('p');
  if (p) p.textContent = message;
  el.removeAttribute('hidden');
  setTimeout(() => el.setAttribute('hidden', ''), 5000);
};
const showFieldError = (form, field, message) => {
  const input = form.querySelector(`[name="${field}"]`);
  if (!input) return;
  input.classList.add('is-error');
  const hint = Object.assign(document.createElement('span'), { className: 'contact-form__hint', textContent: message });
  input.insertAdjacentElement('afterend', hint);
};
const clearErrors = (form) => { form.querySelectorAll('.is-error').forEach(el => el.classList.remove('is-error')); form.querySelectorAll('.contact-form__hint').forEach(el => el.remove()); };

// ─── ГЛАВНЫЙ ОБРАБОТЧИК ─────────────────────────────────
const handleSubmit = async (e) => {
  e.preventDefault();
  const form = e.currentTarget;
  const fd   = new FormData(form);
  const data = Object.fromEntries(fd.entries());

  clearErrors(form);

  if (!checkRateLimit()) { showError('Подождите 60 секунд перед повторной отправкой'); return; }
  const { valid, errors } = validateForm(data);
  if (!valid) {
    errors.forEach(({ field, message }) => showFieldError(form, field, message));
    return;
  }

  const btn = form.querySelector('.contact-form__submit');
  const origText = btn?.textContent;
  if (btn) { btn.disabled = true; btn.textContent = 'Отправляю...'; }

  try {
    const [tgOk, sheetOk] = await Promise.all([
      sendToTelegram(data),
      sendToSheets(data)
    ]);

    if (tgOk || sheetOk) {
      localStorage.setItem('trafiqo_last_submit', Date.now());
      showSuccess(form);
    } else {
      showError('Ошибка отправки. Напишите нам в Telegram напрямую.');
    }
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = origText; }
  }
};

// ─── ИНИЦИАЛИЗАЦИЯ ──────────────────────────────────────
const initForm = () => {
  const form = document.querySelector('.contact-form');
  if (form) form.addEventListener('submit', handleSubmit);

  const quickForm = document.getElementById('contact-form');
  if (quickForm) {
    quickForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = quickForm.querySelector('.quick-form__submit');
      const success = quickForm.querySelector('.quick-form__success');
      const data = Object.fromEntries(new FormData(quickForm));
      data.source = 'quick-form';
      if (data.website || !data.name?.trim() || !data.contact?.trim()) { showError('Заполните имя и контакт'); return; }
      btn.disabled = true; btn.textContent = 'Отправляю...';
      await sendToTelegram(data);
      success.hidden = false; quickForm.reset(); btn.style.display = 'none';
    });
  }
};

document.addEventListener('DOMContentLoaded', initForm);
