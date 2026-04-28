'use strict';

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const scrollLock = {
  depth: 0,
  lock() {
    this.depth += 1;
    document.body.classList.add('modal-open');
  },
  unlock() {
    this.depth = Math.max(0, this.depth - 1);
    if (this.depth === 0) document.body.classList.remove('modal-open');
  }
};

function initNav() {
  const nav = document.getElementById('nav');
  if (!nav) return;

  const sync = () => nav.classList.toggle('scrolled', window.scrollY > 12);
  window.addEventListener('scroll', sync, { passive: true });
  sync();
}

function initMobileMenu() {
  const button = document.querySelector('.hamburger');
  const overlay = document.getElementById('menu-overlay');
  if (!button || !overlay) return;

  let isOpen = false;

  const open = () => {
    if (isOpen) return;
    isOpen = true;
    button.classList.add('active');
    button.setAttribute('aria-expanded', 'true');
    button.setAttribute('aria-label', 'Close menu');
    overlay.classList.add('open');
    overlay.setAttribute('aria-hidden', 'false');
    scrollLock.lock();
  };

  const close = () => {
    if (!isOpen) return;
    isOpen = false;
    button.classList.remove('active');
    button.setAttribute('aria-expanded', 'false');
    button.setAttribute('aria-label', 'Open menu');
    overlay.classList.remove('open');
    overlay.setAttribute('aria-hidden', 'true');
    scrollLock.unlock();
  };

  button.addEventListener('click', () => (isOpen ? close() : open()));
  overlay.querySelectorAll('a, button').forEach((el) => el.addEventListener('click', close));
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') close();
  });
}

function initModal() {
  const overlay = document.getElementById('modal-overlay');
  const triggers = document.querySelectorAll('.btn-modal-trigger');
  if (!overlay || !triggers.length) return;

  let isOpen = false;

  const open = () => {
    if (isOpen) return;
    isOpen = true;
    overlay.classList.add('open');
    overlay.setAttribute('aria-hidden', 'false');
    scrollLock.lock();
    const firstField = overlay.querySelector('input, select, textarea');
    if (firstField) setTimeout(() => firstField.focus(), 40);
  };

  const close = () => {
    if (!isOpen) return;
    isOpen = false;
    overlay.classList.remove('open');
    overlay.setAttribute('aria-hidden', 'true');
    scrollLock.unlock();
  };

  triggers.forEach((button) => button.addEventListener('click', open));

  const closeButton = overlay.querySelector('.modal-close');
  if (closeButton) closeButton.addEventListener('click', close);

  overlay.addEventListener('click', (event) => {
    if (event.target === overlay) close();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') close();
  });
}

function initFormValidation() {
  const forms = document.querySelectorAll('form[data-netlify="true"]');
  if (!forms.length) return;

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const showError = (field, message) => {
    field.classList.add('error');
    const error = field.parentElement.querySelector('.field-error');
    if (error) error.textContent = message;
  };

  const clearError = (field) => {
    field.classList.remove('error');
    const error = field.parentElement.querySelector('.field-error');
    if (error) error.textContent = '';
  };

  forms.forEach((form) => {
    form.querySelectorAll('[required]').forEach((field) => {
      field.addEventListener('input', () => clearError(field));
      field.addEventListener('change', () => clearError(field));
    });

    form.addEventListener('submit', (event) => {
      let valid = true;

      form.querySelectorAll('[required]').forEach((field) => {
        const value = field.value.trim();
        if (!value) {
          showError(field, 'This field is required.');
          valid = false;
          return;
        }

        if (field.type === 'email' && !emailPattern.test(value)) {
          showError(field, 'Enter a valid email address.');
          valid = false;
        }

        if (field.type === 'tel' && value.replace(/\D/g, '').length < 10) {
          showError(field, 'Enter a valid phone number.');
          valid = false;
        }
      });

      if (!valid) event.preventDefault();
    });
  });
}

function initFaq() {
  document.querySelectorAll('.faq-item').forEach((item) => {
    const button = item.querySelector('.faq-question');
    const answer = item.querySelector('.faq-answer');
    if (!button || !answer) return;

    button.addEventListener('click', () => {
      const isOpen = button.getAttribute('aria-expanded') === 'true';

      document.querySelectorAll('.faq-item').forEach((other) => {
        const otherButton = other.querySelector('.faq-question');
        const otherAnswer = other.querySelector('.faq-answer');
        if (!otherButton || !otherAnswer || other === item) return;
        otherButton.setAttribute('aria-expanded', 'false');
        otherAnswer.hidden = true;
      });

      button.setAttribute('aria-expanded', String(!isOpen));
      answer.hidden = isOpen;
    });
  });
}

function initLightbox() {
  const lightbox = document.getElementById('lightbox');
  const galleryItems = Array.from(document.querySelectorAll('[data-lightbox]'));
  if (!lightbox || !galleryItems.length) return;

  const image = document.getElementById('lightbox-img');
  const closeButton = lightbox.querySelector('.lightbox-close');
  const prevButton = lightbox.querySelector('.lightbox-prev');
  const nextButton = lightbox.querySelector('.lightbox-next');
  const overlay = lightbox.querySelector('.lightbox-overlay');

  let currentIndex = 0;
  let startX = 0;

  const render = () => {
    const source = galleryItems[currentIndex].querySelector('img');
    if (!source || !image) return;
    image.src = source.src;
    image.alt = source.alt;
  };

  const open = (index) => {
    currentIndex = index;
    render();
    lightbox.classList.add('open');
    lightbox.setAttribute('aria-hidden', 'false');
    scrollLock.lock();
    if (closeButton) closeButton.focus();
  };

  const close = () => {
    lightbox.classList.remove('open');
    lightbox.setAttribute('aria-hidden', 'true');
    scrollLock.unlock();
    galleryItems[currentIndex]?.focus();
  };

  const prev = () => {
    currentIndex = (currentIndex - 1 + galleryItems.length) % galleryItems.length;
    render();
  };

  const next = () => {
    currentIndex = (currentIndex + 1) % galleryItems.length;
    render();
  };

  galleryItems.forEach((item, index) => item.addEventListener('click', () => open(index)));
  closeButton?.addEventListener('click', close);
  prevButton?.addEventListener('click', prev);
  nextButton?.addEventListener('click', next);
  overlay?.addEventListener('click', close);

  document.addEventListener('keydown', (event) => {
    if (!lightbox.classList.contains('open')) return;
    if (event.key === 'Escape') close();
    if (event.key === 'ArrowLeft') prev();
    if (event.key === 'ArrowRight') next();
  });

  lightbox.addEventListener('touchstart', (event) => {
    startX = event.changedTouches[0].clientX;
  }, { passive: true });

  lightbox.addEventListener('touchend', (event) => {
    const distance = event.changedTouches[0].clientX - startX;
    if (Math.abs(distance) < 40) return;
    if (distance > 0) prev();
    if (distance < 0) next();
  }, { passive: true });
}

function initScrollReveal() {
  const elements = document.querySelectorAll('.reveal-on-scroll');
  if (!elements.length) return;

  if (prefersReducedMotion) {
    elements.forEach((element) => element.classList.add('visible'));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -48px 0px'
  });

  elements.forEach((element) => observer.observe(element));
}

function initStatCounters() {
  const counters = document.querySelectorAll('[data-target]');
  if (!counters.length) return;

  const setFinal = (element) => {
    element.textContent = Number(element.dataset.target).toLocaleString();
  };

  if (prefersReducedMotion) {
    counters.forEach(setFinal);
    return;
  }

  const easeOut = (value) => 1 - Math.pow(1 - value, 3);

  const animate = (element) => {
    const target = Number(element.dataset.target);
    const start = performance.now();
    const duration = 1500;

    const frame = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const value = Math.round(easeOut(progress) * target);
      element.textContent = value.toLocaleString();
      if (progress < 1) requestAnimationFrame(frame);
    };

    requestAnimationFrame(frame);
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      animate(entry.target);
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.5 });

  counters.forEach((counter) => {
    counter.textContent = '0';
    observer.observe(counter);
  });
}

function initGalleryParallax() {
  if (prefersReducedMotion || !window.matchMedia('(hover: hover)').matches) return;

  document.querySelectorAll('.gallery-item').forEach((item) => {
    item.addEventListener('mousemove', (event) => {
      const rect = item.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      item.style.transform = `perspective(800px) rotateX(${(-y * 8).toFixed(2)}deg) rotateY(${(x * 8).toFixed(2)}deg)`;
    });

    item.addEventListener('mouseleave', () => {
      item.style.transform = '';
    });
  });
}

function initBeforeAfterSlider() {
  document.querySelectorAll('[data-ba-slider]').forEach((slider) => {
    const after = slider.querySelector('[data-ba-after]');
    const handle = slider.querySelector('[data-ba-handle]');
    if (!after || !handle) return;

    let dragging = false;

    const setPosition = (clientX) => {
      const rect = slider.getBoundingClientRect();
      const percent = Math.min(95, Math.max(5, ((clientX - rect.left) / rect.width) * 100));
      after.style.clipPath = `inset(0 ${100 - percent}% 0 0)`;
      handle.style.left = `${percent}%`;
    };

    slider.addEventListener('pointerdown', (event) => {
      dragging = true;
      slider.setPointerCapture(event.pointerId);
      setPosition(event.clientX);
    });

    slider.addEventListener('pointermove', (event) => {
      if (!dragging) return;
      setPosition(event.clientX);
    });

    const stop = (event) => {
      if (!dragging) return;
      dragging = false;
      if (event.pointerId !== undefined) slider.releasePointerCapture(event.pointerId);
    };

    slider.addEventListener('pointerup', stop);
    slider.addEventListener('pointercancel', stop);
  });
}

function initFooterYear() {
  const year = document.getElementById('footer-year');
  if (year) year.textContent = new Date().getFullYear();
}

document.addEventListener('DOMContentLoaded', () => {
  if (typeof lucide !== 'undefined') lucide.createIcons();

  initNav();
  initMobileMenu();
  initModal();
  initFormValidation();
  initFaq();
  initLightbox();
  initScrollReveal();
  initStatCounters();
  initGalleryParallax();
  initBeforeAfterSlider();
  initFooterYear();
});
