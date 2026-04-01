history.scrollRestoration = 'manual';

const BREAKPOINT_MOBILE = 768;
const BREAKPOINT_TABLET = 1200;
const COUNTUP_DURATION  = 2000;

const isMobile = () => window.innerWidth < BREAKPOINT_MOBILE;
const prefersReducedMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const initAOS = () => {
  AOS.init({
    duration: 700,
    easing: 'ease-out',
    once: true,
    offset: isMobile() ? 40 : 80,
    disable: prefersReducedMotion()
  });
};

const HERO_SELECTORS = [
  '.section-hero .section-label',
  '.section-hero__title',
  '.section-hero__subtitle',
  '.section-hero__cta-group',
  '.ui-browser',
  '.ui-phone',
  '.ui-chat'
];

const initHeroAnimation = () => {
  if (prefersReducedMotion()) return;

  if (typeof gsap === 'undefined') {
    document.querySelectorAll(HERO_SELECTORS.join(','))
      .forEach((el) => { el.style.opacity = '1'; el.style.transform = 'none'; });
    return;
  }

  const tl = gsap.timeline({ delay: 0.1 });

  tl.from('.section-hero .section-label', { opacity: 0, x: -50, duration: 0.7, ease: 'power3.out' })
    .to('.section-hero__title', {
      x: 0, opacity: 1, duration: 1.0, ease: 'power4.out',
      onStart: () => { gsap.set('.section-hero__title', { x: '-100%', opacity: 1 }); }
    }, '-=0.4')
    .from('.section-hero__subtitle', { opacity: 0, x: 40, duration: 0.6, ease: 'power2.out' }, '-=0.5')
    .from('.section-hero__cta-group .btn--primary',   { opacity: 0, y: 30, duration: 0.5, ease: 'back.out(1.7)' }, '-=0.3')
    .from('.section-hero__cta-group .btn--outline',   { opacity: 0, y: 30, duration: 0.5, ease: 'back.out(1.7)' }, '-=0.35')
    .from('.ui-browser', { opacity: 0, x: 60, y: -30, rotation: -3, duration: 1.0, ease: 'power3.out' }, '-=0.6')
    .from('.ui-chat',    { opacity: 0, x: -40, y: 50, rotation: -1, duration: 0.9, ease: 'power3.out' }, '-=0.7')
    .from('.ui-phone',   { opacity: 0, x: 30, y: 60, rotation: 4, duration: 0.9, ease: 'power3.out' }, '-=0.8');
};

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

  gsap.to('.ui-browser', { x: 30, y: -40, ease: 'none', scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: 2.5 } });
  gsap.to('.ui-chat',    { x: -20, y: 30, ease: 'none', scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: 3 } });
  gsap.to('.ui-phone',   { x: 15, y: 50,  ease: 'none', scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: 2 } });
  gsap.to('.section-hero__content', { y: 40, ease: 'none', scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: 3 } });
};

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

const initFAQ = () => {
  const list = document.querySelector('.faq-list');
  if (!list) return;

  const closeItem = (item) => {
    const answer = item.querySelector('.faq-item__answer, .faq-item__body');
    const btn = item.querySelector('.faq-item__question, .faq-item__btn');
    if (!answer) return;
    answer.style.maxHeight = answer.scrollHeight + 'px';
    requestAnimationFrame(() => requestAnimationFrame(() => { answer.style.maxHeight = '0'; }));
    item.classList.remove('is-open');
    btn?.setAttribute('aria-expanded', 'false');
  };

  const openItem = (item) => {
    const answer = item.querySelector('.faq-item__answer, .faq-item__body');
    const btn = item.querySelector('.faq-item__question, .faq-item__btn');
    if (!answer) return;
    item.classList.add('is-open');
    btn?.setAttribute('aria-expanded', 'true');
    answer.style.maxHeight = answer.scrollHeight + 'px';
  };

  list.addEventListener('click', (e) => {
    const btn = e.target.closest('.faq-item__question, .faq-item__btn');
    if (!btn) return;
    const item = btn.closest('.faq-item');
    if (!item) return;
    const isOpen = item.classList.contains('is-open');

    list.querySelectorAll('.faq-item.is-open').forEach(
      openItem => closeItem(openItem)
    );

    if (!isOpen) {
      setTimeout(() => openItem(item), 10);
    }
  });
};

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

const initSmoothScroll = () => {
  const burger = document.querySelector('.header__burger');
  const nav    = document.querySelector('.header__nav');

  document.querySelectorAll('[href="#contact"]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const form = document.getElementById('contact');
      form?.scrollIntoView({ behavior: 'smooth' });
      setTimeout(() => {
        form?.querySelector('input')?.focus();
      }, 600);
    });
  });

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

const initHeroChat = () => {
  if (isMobile()) return;
  const container = document.getElementById('heroChat');
  if (!container) return;

  const messages = [
    { type: 'bot',  text: 'Привет! Чем могу помочь?' },
    { type: 'user', text: 'Нужен сайт под бизнес' },
    { type: 'bot',  text: 'Отлично! Расскажите подробнее о задаче' },
    { type: 'user', text: 'Хочу лендинг с анимациями' },
    { type: 'bot',  text: 'Сделаем. Когда хотите начать?' },
    { type: 'user', text: 'Как можно скорее' },
    { type: 'bot',  text: 'Обсудим завтра в 10:00?' }
  ];

  let index = 0;
  const showNext = () => {
    if (index >= messages.length) {
      setTimeout(() => { container.innerHTML = ''; index = 0; showNext(); }, 2000);
      return;
    }
    const msg = messages[index];
    const el = document.createElement('div');
    el.className = `ui-chat__message ${msg.type}`;
    el.textContent = msg.text;
    container.appendChild(el);
    container.scrollTop = container.scrollHeight;
    requestAnimationFrame(() => el.classList.add('is-visible'));
    index++;
    setTimeout(showNext, 1200 + msg.text.length * 30);
  };
  setTimeout(showNext, 1000);
};

const initPhoneScreens = () => {
  const screens = document.querySelectorAll('.ui-phone__screen');
  const dots    = document.querySelectorAll('.ui-phone__nav .ui-ph-dot');
  if (!screens.length) return;

  let current = 0;
  setInterval(() => {
    screens[current].classList.remove('is-active');
    dots[current]?.classList.remove('a');
    current = (current + 1) % screens.length;
    screens[current].classList.add('is-active');
    dots[current]?.classList.add('a');
  }, 2500);
};

const initScrollDots = () => {
  const pairs = [
    {
      wrap: document.querySelector('.services__scroll-wrap'),
      dots: document.querySelectorAll('#servicesDots .scroll-dot')
    }
  ];

  pairs.forEach(({ wrap, dots }) => {
    if (!wrap || !dots.length) return;
    wrap.addEventListener('scroll', () => {
      const total = wrap.scrollWidth - wrap.clientWidth;
      if (!total) return;
      const ratio = wrap.scrollLeft / total;
      const idx = Math.round(ratio * (dots.length - 1));
      dots.forEach((d, i) => d.classList.toggle('is-active', i === idx));
    }, { passive: true });
  });
};

const initSmartHeader = () => {
  const header = document.querySelector(
    'header, .site-header, #main-header'
  );
  if (!header) return;

  let lastScroll = 0;
  let ticking = false;

  const updateHeader = () => {
    const currentScroll = window.scrollY;

    if (currentScroll <= 10) {
      header.classList.remove('is-hidden', 'is-scrolled');
      lastScroll = currentScroll;
      ticking = false;
      return;
    }

    if (currentScroll > 50) {
      header.classList.add('is-scrolled');
    }

    if (currentScroll > lastScroll && currentScroll > 80) {
      header.classList.add('is-hidden');
    } else if (currentScroll < lastScroll) {
      header.classList.remove('is-hidden');
    }

    lastScroll = currentScroll;
    ticking = false;
  };

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(updateHeader);
      ticking = true;
    }
  }, { passive: true });
};

const initReviews = () => {
  if (typeof Swiper === 'undefined') return;

  const reviewsSwiper = new Swiper('.reviews-swiper', {
    slidesPerView: 1,
    spaceBetween: 20,
    loop: true,
    touchStartPreventDefault: false,
    nested: true,
    touchReleaseOnEdges: true,
    resistanceRatio: 0,
    autoplay: false,
    pagination: {
      el: '.reviews-pagination',
      clickable: true
    },
    breakpoints: {
      768: { slidesPerView: 2, spaceBetween: 24 },
      1200: { slidesPerView: 3, spaceBetween: 28 }
    }
  });

  const reviewCards = document.querySelectorAll('.review-card');
  reviewCards.forEach(card => {
    let startY = 0;
    let startX = 0;

    card.addEventListener('touchstart', (e) => {
      startY = e.touches[0].clientY;
      startX = e.touches[0].clientX;
    }, { passive: true });

    card.addEventListener('touchmove', (e) => {
      const dy = Math.abs(e.touches[0].clientY - startY);
      const dx = Math.abs(e.touches[0].clientX - startX);
      if (dy > dx) {
        reviewsSwiper.allowTouchMove = false;
      } else {
        reviewsSwiper.allowTouchMove = true;
      }
    }, { passive: true });

    card.addEventListener('touchend', () => {
      reviewsSwiper.allowTouchMove = true;
    }, { passive: true });
  });
};

const initCursorGlow = () => {
  if (isMobile()) return;
  const glow = document.getElementById('cursorGlow');
  if (!glow) return;

  let visible = false;

  document.addEventListener('mousemove', (e) => {
    glow.style.left = e.clientX + 'px';
    glow.style.top = e.clientY + 'px';
    if (!visible) {
      glow.style.opacity = '1';
      visible = true;
    }
  }, { passive: true });

  document.addEventListener('mouseleave', () => {
    glow.style.opacity = '0';
    visible = false;
  });
};

const initActivityCounter = () => {
  if (isMobile()) return;
  const el = document.getElementById('activityText');
  if (!el) return;

  const phrases = [
    'Последняя заявка — 43 минуты назад',
    'Сейчас в работе 3 проекта',
    'Сегодня ответили на 2 запроса',
    'Последний проект сдан вчера',
    'Новый клиент из Дубая — час назад',
    'Сайт запущен сегодня в 14:30',
    'Заявка из Москвы — 28 минут назад',
    'Бот для клиента сдан сегодня',
    'Команда онлайн — ответим быстро',
    'Проект из СПб завершён вчера'
  ];

  let current = Math.floor(Math.random() * phrases.length);
  el.textContent = phrases[current];

  const rotate = () => {
    el.classList.add('is-fading');

    setTimeout(() => {
      current = (current + 1) % phrases.length;
      el.textContent = phrases[current];
      el.classList.remove('is-fading');
    }, 500);
  };

  setInterval(rotate, 5000);
};

const initPortfolioSlider = () => {
  const track = document.getElementById('portfolioTrack');
  if (!track) return;
  let isDragging = false, startX = 0, scrollLeft = 0;
  track.addEventListener('mousedown', (e) => { isDragging = true; startX = e.pageX - track.offsetLeft; scrollLeft = track.parentElement.scrollLeft; track.style.cursor = 'grabbing'; });
  track.addEventListener('mouseleave', () => { isDragging = false; track.style.cursor = 'grab'; });
  track.addEventListener('mouseup',    () => { isDragging = false; track.style.cursor = 'grab'; });
  track.addEventListener('mousemove', (e) => { if (!isDragging) return; e.preventDefault(); track.parentElement.scrollLeft = scrollLeft - (e.pageX - track.offsetLeft - startX) * 1.5; });
  const slider = track.parentElement;
  slider.addEventListener('scroll', () => { const sw = track.children[0]?.offsetWidth + 24; const idx = Math.round(slider.scrollLeft / sw); document.querySelectorAll('.portfolio-dot').forEach((d, i) => d.classList.toggle('active', i === idx)); }, { passive: true });
};

window.goToSlide = (index) => {
  const track = document.getElementById('portfolioTrack');
  if (!track) return;
  track.parentElement.scrollLeft = (track.children[0]?.offsetWidth + 24) * index;
  document.querySelectorAll('.portfolio-dot').forEach((d, i) => d.classList.toggle('active', i === index));
};

document.addEventListener('DOMContentLoaded', () => {
  if (!isMobile()) {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }
  initAOS();
  initBurger();
  initFAQ();
  initCountUp();
  initSmoothScroll();
  initNavHighlight();
  initHeroAnimation();
  initHeroChat();
  initPhoneScreens();
  initScrollDots();
  initSmartHeader();
  initReviews();
  initActivityCounter();
  initCursorGlow();
  initPortfolioSlider();

  if (!isMobile() && !prefersReducedMotion()) {
    initParallax();
    initProcessSteps();
  }
  document.documentElement.style.scrollBehavior = 'smooth';
  initWidgetCollapse();
});

const initWidgetCollapse = () => {
  const tgWrap = document.getElementById('tgFloatWrap');
  const tgClose = document.getElementById('tgFloatClose');
  const botWidget = document.getElementById('bot-widget');
  const botDismiss = document.getElementById('botDismiss');

  if (tgWrap && tgClose) {
    tgClose.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      tgWrap.classList.toggle('is-collapsed');
    });

    tgWrap.addEventListener('click', (e) => {
      if (tgWrap.classList.contains('is-collapsed')) {
        e.preventDefault();
        tgWrap.classList.remove('is-collapsed');
      }
    });
  }

  if (botWidget && botDismiss) {
    botDismiss.addEventListener('click', (e) => {
      e.stopPropagation();
      botWidget.classList.toggle('is-collapsed');
    });

    botWidget.addEventListener('click', (e) => {
      if (botWidget.classList.contains('is-collapsed')) {
        botWidget.classList.remove('is-collapsed');
      }
    });
  }
};
