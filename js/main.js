// ─── КОНСТАНТЫ ───────────────────────────────────────────
const BREAKPOINT_MOBILE = 768;
const BREAKPOINT_TABLET = 1200;
const COUNTUP_DURATION  = 2000;

// ─── УТИЛИТЫ ─────────────────────────────────────────────
const isMobile = () => window.innerWidth < BREAKPOINT_MOBILE;
const prefersReducedMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ─── 1. AOS ИНИЦИАЛИЗАЦИЯ ────────────────────────────────
const initAOS = () => {
  AOS.init({
    duration: 700,
    easing: 'ease-out',
    once: true,
    offset: 80,
    disable: prefersReducedMotion()
  });
};

// ─── 2. GSAP HERO АНИМАЦИЯ ───────────────────────────────
const initHeroAnimation = () => {
  if (prefersReducedMotion()) return;
  if (typeof gsap === 'undefined') return;

  const tl = gsap.timeline({ defaults: { ease: 'power2.out', duration: 0.8 } });

  tl.from('.section-hero .section-label', { opacity: 0, y: 30 })
    .from('.section-hero__title',       { opacity: 0, y: 30 }, '-=0.55')
    .from('.section-hero__subtitle',    { opacity: 0, y: 30 }, '-=0.55')
    .from('.section-hero__cta-group',   { opacity: 0, y: 30 }, '-=0.55')
    .from(
      ['.hero__ui-browser', '.hero__ui-phone', '.hero__ui-chat'],
      { opacity: 0, y: 40, stagger: 0.2 },
      '-=0.4'
    );
};

// ─── 3. GSAP ПАРАЛЛАКС ───────────────────────────────────
const initParallax = () => {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

  gsap.registerPlugin(ScrollTrigger);

  const makeParallax = (selector, yVal) => {
    const el = document.querySelector(selector);
    if (!el) return;

    gsap.to(el, {
      y: yVal,
      ease: 'none',
      scrollTrigger: {
        trigger: '#hero',
        start: 'top top',
        end: 'bottom top',
        scrub: 1.5,
        onLeave: () => { el.style.willChange = 'auto'; }
      }
    });
  };

  makeParallax('.hero__ui-browser', -60);
  makeParallax('.hero__ui-phone',   -40);
  makeParallax('.hero__ui-chat',    -30);
};

// ─── 4. БУРГЕР-МЕНЮ ──────────────────────────────────────
const initBurger = () => {
  const burger = document.querySelector('.header__burger');
  const nav    = document.querySelector('.header__nav');
  if (!burger || !nav) return;

  const closeBurger = () => {
    burger.classList.remove('is-open');
    nav.classList.remove('is-open');
    burger.setAttribute('aria-expanded', 'false');
  };

  const openBurger = () => {
    burger.classList.add('is-open');
    nav.classList.add('is-open');
    burger.setAttribute('aria-expanded', 'true');
  };

  burger.addEventListener('click', () => {
    const isOpen = burger.classList.contains('is-open');
    isOpen ? closeBurger() : openBurger();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeBurger();
  });

  document.addEventListener('click', (e) => {
    if (!e.target.closest('.header__container')) closeBurger();
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth >= BREAKPOINT_MOBILE) closeBurger();
  });
};

// ─── 5. FAQ АККОРДЕОН ────────────────────────────────────
const initFAQ = () => {
  const list = document.querySelector('.faq-list');
  if (!list) return;

  const closeItem = (item) => {
    const btn  = item.querySelector('.faq-item__btn');
    const body = item.querySelector('.faq-item__body');
    if (!btn || !body) return;

    item.classList.remove('is-open');
    btn.setAttribute('aria-expanded', 'false');
    body.style.maxHeight = '0';
    setTimeout(() => body.setAttribute('hidden', ''), 350);
  };

  const openItem = (item) => {
    const btn  = item.querySelector('.faq-item__btn');
    const body = item.querySelector('.faq-item__body');
    if (!btn || !body) return;

    item.classList.add('is-open');
    btn.setAttribute('aria-expanded', 'true');
    body.removeAttribute('hidden');
    body.style.maxHeight = body.scrollHeight + 'px';
  };

  list.addEventListener('click', (e) => {
    const btn = e.target.closest('.faq-item__btn');
    if (!btn) return;

    const item    = btn.closest('.faq-item');
    const isOpen  = item.classList.contains('is-open');
    const allItems = list.querySelectorAll('.faq-item');

    allItems.forEach(closeItem);
    if (!isOpen) openItem(item);
  });
};

// ─── 6. COUNT-UP ─────────────────────────────────────────
const animateCount = (el, target) => {
  if (prefersReducedMotion()) {
    el.textContent = target;
    return;
  }

  el.classList.add('is-counting');
  const start     = performance.now();
  const easeOut   = (t) => 1 - (1 - t) ** 3;

  const tick = (now) => {
    const elapsed  = now - start;
    const progress = Math.min(elapsed / COUNTUP_DURATION, 1);
    el.textContent = Math.round(easeOut(progress) * target);

    if (progress < 1) {
      requestAnimationFrame(tick);
    } else {
      el.textContent = target;
      el.classList.remove('is-counting');
    }
  };

  requestAnimationFrame(tick);
};

const initCountUp = () => {
  const targets = document.querySelectorAll('[data-countup]');
  if (!targets.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const el     = entry.target;
      const target = parseInt(el.dataset.countup, 10);
      animateCount(el, target);
      observer.unobserve(el);
    });
  }, { threshold: 0.5 });

  targets.forEach((el) => observer.observe(el));
};

// ─── 7. PROCESS ШАГИ — SCROLLTRIGGER ────────────────────
const initProcessSteps = () => {
  if (typeof ScrollTrigger === 'undefined') return;

  const steps = document.querySelectorAll('.process-step');
  if (!steps.length) return;

  ScrollTrigger.batch(steps, {
    onEnter: (batch) => batch.forEach((el) => el.classList.add('is-active')),
    start: 'top 80%',
    once: true
  });
};

// ─── 8. НАВИГАЦИЯ — ACTIVE LINK ──────────────────────────
const initNavHighlight = () => {
  const sections = document.querySelectorAll('section[id]');
  const links    = document.querySelectorAll('.header__nav-link');
  if (!sections.length || !links.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const id = entry.target.getAttribute('id');
      links.forEach((link) => {
        link.classList.toggle('is-active', link.getAttribute('href') === `#${id}`);
      });
    });
  }, { threshold: 0.5 });

  sections.forEach((section) => observer.observe(section));
};

// ─── 9. ПЛАВНЫЙ СКРОЛЛ К ЯКОРЯМ ─────────────────────────
const initSmoothScroll = () => {
  const burger = document.querySelector('.header__burger');
  const nav    = document.querySelector('.header__nav');

  document.addEventListener('click', (e) => {
    const link = e.target.closest('a[href^="#"]');
    if (!link) return;

    const target = document.querySelector(link.getAttribute('href'));
    if (!target) return;

    e.preventDefault();
    target.scrollIntoView({ behavior: 'smooth' });

    if (nav?.classList.contains('is-open')) {
      burger?.classList.remove('is-open');
      nav.classList.remove('is-open');
      burger?.setAttribute('aria-expanded', 'false');
    }
  });
};

// ─── ИНИЦИАЛИЗАЦИЯ ───────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initAOS();
  initBurger();
  initFAQ();
  initCountUp();
  initSmoothScroll();
  initNavHighlight();
  initHeroAnimation();

  if (!isMobile() && !prefersReducedMotion()) {
    initParallax();
    initProcessSteps();
  }
});
