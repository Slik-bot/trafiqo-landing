# RULES.md — Проект TRAFIQO Landing
> Этот файл кладётся в `.claude/rules.md`
> Claude Code читает его автоматически при каждой сессии
> Последнее обновление: Март 2025

---

## ШАГ 0 — ОБЯЗАТЕЛЬНО ПЕРЕД ЛЮБЫМ ДЕЙСТВИЕМ

Прочитай ВСЕ эти файлы:
- `.claude/rules.md` (этот файл)
- `docs/TZ_TRAFIQO_Landing.md`

Подтверди прочтение: выведи по 1 ключевому правилу из каждого файла.

---

## ЛИМИТЫ ФАЙЛОВ — ЖЕЛЕЗНОЕ ПРАВИЛО

| Файл | Макс. строк |
|---|---|
| index.html | < 500 |
| css/style.css | < 800 |
| css/animations.css | < 200 |
| js/main.js | < 500 |
| js/form-handler.js | < 150 |
| js/bot-widget.js | < 150 |
| Любая функция | < 50 строк |

**Алгоритм:**
1. `wc -l <файл>` — ДО изменения
2. Показать план изменений
3. Внести изменения
4. `wc -l <файл>` — ПОСЛЕ
5. `git commit`

Превышение лимита → СТОП. Сообщи. Предложи разделение файла.

---

## ТЕХНИЧЕСКИЙ СТЕК — НЕ МЕНЯТЬ

```
HTML5 + CSS3 + Vanilla JS
Анимации:       GSAP 3.12.5 + ScrollTrigger
Появления:      AOS 2.3.4
Шрифты:         Google Fonts (Syne + Inter — только эти два)
Иконки:         SVG inline (не Font Awesome, не emoji)
```

### CDN — только эти источники:

```
GSAP:         https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js
ScrollTrigger: https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js
AOS JS:       https://unpkg.com/aos@2.3.4/dist/aos.js
AOS CSS:      https://unpkg.com/aos@2.3.4/dist/aos.css
```

---

## ЗАПРЕЩЕНО КАТЕГОРИЧЕСКИ

```
var               → только const / let
console.log       → только console.error в catch-блоках
Inline styles     → всё в CSS (атрибут style= запрещён)
Emoji в UI        → только SVG-иконки
!important        → запрещён (кроме reset)
ID-селекторы      → только классы (BEM)
Вложенные @media  → запрещены
Изображения > 200KB → оптимизировать перед вставкой
z-index > 100     → кроме модалок (1000) и бот-виджета (999)
jQuery / React / Vue → не использовать
```

---

## ЗАПРЕЩЕНО БЕЗ ЯВНОГО УКАЗАНИЯ

```
Добавлять новые CDN-библиотеки
Менять структуру папок
Создавать новые файлы
Удалять секции лендинга
Менять цветовые переменные
```

---

## ПРАВИЛА HTML

```html
<!-- Структура -->
<header>   — навигация
<main>     — весь контент
  <section id="hero">
  <section id="trust">
  <section id="services">
  <section id="process">
  <section id="directions">
  <section id="why-us">
  <section id="faq">
  <section id="contact">
<footer>

<!-- Обязательно на каждом <img> -->
loading="lazy"
alt="описание"

<!-- Форма -->
<form novalidate>   <!-- кастомная JS-валидация -->

<!-- Мета -->
<html lang="ru">
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
```

---

## ПРАВИЛА CSS

### Переменные — только в :root

```css
:root {
  /* Цвета */
  --color-bg:        #07050F;
  --color-glow:      #1A0A3A;
  --color-accent:    #5B2D8E;
  --color-accent-lt: #9B7FE8;
  --color-text:      #F0ECFF;
  --color-text-muted: rgba(232, 228, 240, 0.5);
  --color-text-dim:  rgba(232, 228, 240, 0.25);
  --color-border:    rgba(255, 255, 255, 0.08);

  /* Шрифты */
  --font-display: 'Syne', sans-serif;
  --font-body:    'Inter', sans-serif;

  /* Размеры */
  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 16px;
  --container: 1200px;
}
```

### Методология — BEM-подобная

```css
.section-hero {}
.section-hero__title {}
.section-hero__subtitle {}
.section-hero__cta {}

.service-card {}
.service-card__icon {}
.service-card__title {}
```

### Mobile-first обязательно

```css
/* Базовые стили — для мобайла */
.section-hero__title {
  font-size: clamp(22px, 5vw, 48px);
}

/* Только расширения для планшета */
@media (min-width: 768px) { }

/* Только расширения для десктопа */
@media (min-width: 1200px) { }
```

### Порядок свойств внутри блока

```css
.element {
  /* 1. Позиционирование */
  position: relative;
  top: 0;
  z-index: 1;

  /* 2. Отображение */
  display: flex;
  align-items: center;

  /* 3. Box-model */
  width: 100%;
  padding: 1rem;
  margin: 0;

  /* 4. Типографика */
  font-size: 14px;
  font-weight: 400;
  line-height: 1.6;
  color: var(--color-text);

  /* 5. Визуал */
  background: var(--color-bg);
  border: 0.5px solid var(--color-border);
  border-radius: var(--radius-md);

  /* 6. Анимация */
  transition: transform 0.3s ease, opacity 0.3s ease;
}
```

### Доступность — обязательно

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## ПРАВИЛА JAVASCRIPT

### Структура main.js

```javascript
// ─── КОНСТАНТЫ И КОНФИГ ─────────────────────────────────
const BREAKPOINT_MOBILE = 768;
const BREAKPOINT_TABLET = 1200;

// ─── УТИЛИТЫ ────────────────────────────────────────────
const isMobile = () => window.innerWidth < BREAKPOINT_MOBILE;
const prefersReducedMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ─── ИНИЦИАЛИЗАЦИЯ ──────────────────────────────────────
const initAOS = () => { /* ... */ };
const initHeroAnimation = () => { /* ... */ };
const initParallax = () => { /* ... */ };
const initFAQ = () => { /* ... */ };
const initCountUp = () => { /* ... */ };

// ─── СТАРТ ──────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initAOS();
  initFAQ();
  initCountUp();

  if (!isMobile() && !prefersReducedMotion()) {
    initHeroAnimation();
    initParallax();
  }
});
```

### Структура form-handler.js

```javascript
// ─── КОНФИГ ─────────────────────────────────────────────
const BOT_TOKEN  = 'YOUR_BOT_TOKEN';
const CHAT_ID    = 'YOUR_CHAT_ID';
const SHEET_URL  = 'YOUR_APPS_SCRIPT_URL';
const SITE_NAME  = 'TRAFIQO Landing';

// ─── ФУНКЦИИ ────────────────────────────────────────────
const validateForm = (data) => { /* ... */ };
const sendToTelegram = async (data) => { /* ... */ };
const sendToSheets = async (data) => { /* ... */ };
const showSuccess = () => { /* ... */ };
const showError = () => { /* ... */ };

// ─── ОБРАБОТЧИК ─────────────────────────────────────────
const handleSubmit = async (e) => { /* ... */ };
```

### Правила функций

```javascript
// Каждая функция — одна задача, < 50 строк
// Асинхронность — только async/await, не .then()
// Ошибки — только try/catch с console.error

const sendToTelegram = async (data) => {
  try {
    const response = await fetch(
      `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: CHAT_ID,
          text: formatMessage(data),
          parse_mode: 'HTML'
        })
      }
    );
    return response.ok;
  } catch (error) {
    console.error('Telegram send failed:', error);
    return false;
  }
};
```

---

## ПРАВИЛА АНИМАЦИЙ

### Производительность — что можно и нельзя анимировать

```css
/* МОЖНО — GPU-ускорение */
transform: translateY() translateX() scale() rotate();
opacity: 0 → 1;

/* НЕЛЬЗЯ — вызывает reflow */
width, height, top, left, margin, padding, font-size
```

### Тайминги

```
Загрузка страницы (Hero):  0.6–1.0s, ease-out, stagger 0.15s
Появление при скролле:     0.6–0.8s, ease-out
Hover-эффекты:             0.3s, ease
Параллакс:                 плавный, без рывков
FAQ аккордеон:             0.3s, ease
```

### Параллакс — только на десктопе

```javascript
const initParallax = () => {
  if (isMobile() || prefersReducedMotion()) return;

  gsap.registerPlugin(ScrollTrigger);

  // Только transform — никакого top/left
  gsap.to('.hero__ui-browser', {
    y: -60,
    scrollTrigger: {
      trigger: '#hero',
      start: 'top top',
      end: 'bottom top',
      scrub: 1.5
    }
  });
};
```

### will-change — только активные элементы

```css
/* Только на элементах с активной GSAP-анимацией */
.hero__ui-browser { will-change: transform; }

/* Убирать после анимации */
gsap.to(el, {
  onComplete: () => el.style.willChange = 'auto'
});
```

---

## ПРОИЗВОДИТЕЛЬНОСТЬ

### Изображения

```html
<!-- Hero — без lazy (критический ресурс) -->
<img src="img/logo.svg" alt="TRAFIQO" width="120" height="40">

<!-- Все остальные — lazy -->
<img src="img/icon-site.svg" alt="Сайты" loading="lazy" width="40" height="40">
```

### Лимиты файлов

| Тип | Макс. вес |
|---|---|
| SVG-иконка | 5 KB |
| Логотип SVG | 20 KB |
| OG-изображение | 150 KB |
| Любая растровая картинка | 200 KB |

### Lighthouse — целевые показатели

| Метрика | Мобайл | Десктоп |
|---|---|---|
| Performance | ≥ 85 | ≥ 95 |
| Accessibility | ≥ 90 | ≥ 90 |
| Best Practices | ≥ 90 | ≥ 95 |
| SEO | ≥ 95 | ≥ 95 |

---

## ДИАГНОСТИКА — ПЕРЕД КАЖДЫМ ИЗМЕНЕНИЕМ

```bash
# Размер файла
wc -l <файл>

# Запрещённые паттерны
grep -n "console\.log" <файл>    # → 0
grep -n " style=" <файл>         # → 0
grep -n "!important" <файл>      # → 0 (кроме reset)
grep -n "\bvar\b" <файл>         # → 0
grep -n "jQuery\|\.then(" <файл> # → 0
```

---

## ФОРМАТ КОММИТОВ

```
feat:     добавлена секция hero — index.html
style:    адаптив для tablet — css/style.css
animate:  GSAP параллакс hero — js/main.js
fix:      валидация формы — js/form-handler.js
bot:      сценарий диалога — js/bot-widget.js
perf:     оптимизированы SVG-иконки
seo:      добавлены og-теги и schema.org
```

---

## ПРИНЦИП РАБОТЫ С CLAUDE CODE

1. Одна задача = один файл = один коммит
2. Перед изменением — показать план
3. Если непонятно — спросить, не угадывать
4. Каждую секцию: сначала HTML → CSS → JS
5. После секции — тест на mobile / tablet / desktop
6. Лимиты файлов — проверять всегда
