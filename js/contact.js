/* AEM Lab — Contact page */

(function () {
  'use strict';

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

  document.addEventListener('DOMContentLoaded', initReveal);
})();
