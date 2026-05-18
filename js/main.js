/* AEM Lab — Shared JS */

(function () {
  'use strict';

  /* ---- Mobile nav toggle --------------------------------- */
  function initNav() {
    const toggle   = document.querySelector('.nav__toggle');
    const dropdown = document.querySelector('.nav__dropdown');
    if (!toggle || !dropdown) return;

    toggle.addEventListener('click', function () {
      const open = toggle.classList.toggle('open');
      dropdown.classList.toggle('open', open);
      toggle.setAttribute('aria-expanded', String(open));
    });

    // Close on outside click
    document.addEventListener('click', function (e) {
      if (!toggle.contains(e.target) && !dropdown.contains(e.target)) {
        toggle.classList.remove('open');
        dropdown.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* ---- Active nav link ----------------------------------- */
  function setActiveNav() {
    const page = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav__links a, .nav__dropdown a').forEach(function (a) {
      const href = a.getAttribute('href') || '';
      if (href === page || (page === '' && href === 'index.html')) {
        a.classList.add('active');
      }
    });
  }

  /* ---- Expandable research cards ------------------------- */
  function initCards() {
    document.querySelectorAll('.card').forEach(function (card) {
      card.addEventListener('click', function (e) {
        if (e.target.closest('.card__link')) return;
        const open = card.classList.toggle('open');
        card.setAttribute('aria-expanded', String(open));
      });
    });
  }

  /* ---- Smooth scroll for anchor links -------------------- */
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(function (a) {
      a.addEventListener('click', function (e) {
        const target = document.querySelector(a.getAttribute('href'));
        if (!target) return;
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });
  }

  /* ---- Scroll reveal (.reveal → .revealed) --------------- */
  function initReveal() {
    var els = document.querySelectorAll('.reveal');
    if (!('IntersectionObserver' in window)) {
      els.forEach(function (el) { el.classList.add('revealed'); });
      return;
    }
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.10 });
    els.forEach(function (el) { obs.observe(el); });
  }

  /* ---- Boot ---------------------------------------------- */
  document.addEventListener('DOMContentLoaded', function () {
    initNav();
    setActiveNav();
    initCards();
    initSmoothScroll();
    initReveal();
  });
})();
