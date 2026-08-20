/* AEM Lab — Research Questions page */

(function () {
  'use strict';

  var ICON_LINK = '<svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true"><path d="M7 1h4v4M11 1L5.5 6.5M4.5 2H2a1 1 0 00-1 1v7a1 1 0 001 1h7a1 1 0 001-1V8.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  /* ---- Key papers rendering -------------------------------- */
  function renderPaper(pub) {
    var link = pub.doi || pub.url;
    var titleHtml = link
      ? '<a href="' + link + '" target="_blank" rel="noopener" class="rq-paper__title-link">' + pub.title + ICON_LINK + '</a>'
      : pub.title;

    var metaParts = [];
    if (pub.journal) metaParts.push(pub.journal);
    metaParts.push(pub.year);

    return '<div class="rq-paper">'
      + '<p class="rq-paper__title">' + titleHtml + '</p>'
      + '<p class="rq-paper__meta">' + pub.authors + ' &middot; ' + metaParts.join(', ') + '</p>'
      + '</div>';
  }

  function renderPapersLists() {
    if (typeof publications === 'undefined') return;

    document.querySelectorAll('.rq-papers-list').forEach(function (container) {
      var slug = container.getAttribute('data-rq');
      var matched = publications.filter(function (p) {
        return Array.isArray(p.rq) && p.rq.indexOf(slug) !== -1;
      });
      matched.sort(function (a, b) { return b.year - a.year; });

      if (!matched.length) {
        container.innerHTML = '<p class="rq-paper__empty">Papers coming soon.</p>';
        return;
      }
      container.innerHTML = matched.map(renderPaper).join('');
    });
  }

  /* ---- Card switcher (accordion, expands width + height) --- */
  function initSwitcher() {
    var switcher = document.getElementById('rq-switcher');
    if (!switcher) return;

    var cards = Array.prototype.slice.call(switcher.querySelectorAll('.rq-card'));

    function applyActive(slug) {
      var found = null;
      cards.forEach(function (card) {
        var isMatch = card.getAttribute('data-rq') === slug;
        var btn = card.querySelector('.rq-card__header');
        card.classList.toggle('active', isMatch);
        btn.setAttribute('aria-expanded', String(isMatch));
        if (isMatch) found = card;
      });
      switcher.classList.toggle('has-active', !!found);
    }

    // A pending sequenced expand. Any new interaction cancels it: without
    // this, clicking a second question while an arrival was still queued
    // would open that one and then have the stale timer re-open the first.
    var pending = null;
    function cancelPending() {
      if (pending) { clearTimeout(pending); pending = null; }
    }

    // scroll: whether to bring the card into view at all.
    // sequenced: scroll to the header first, then expand once the scroll
    // has had time to land — used when arriving from a link (e.g. a
    // homepage card) so the navigation and the expand read as two
    // distinct, trackable moves instead of one instant jump.
    function setActive(slug, opts) {
      var scroll = opts && opts.scroll;
      var sequenced = opts && opts.sequenced;
      var card = cards.filter(function (c) { return c.getAttribute('data-rq') === slug; })[0];
      var header = card && card.querySelector('.rq-card__header');

      cancelPending();

      if (slug) {
        history.replaceState(null, '', '#' + slug);
      } else {
        history.replaceState(null, '', location.pathname + location.search);
      }

      if (header && scroll) {
        header.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }

      if (header && sequenced) {
        // Start the expand while the scroll is still finishing (not after
        // it stops) so the two motions blend into one continuous gesture
        // instead of a scroll ... pause ... expand sequence.
        pending = setTimeout(function () { pending = null; applyActive(slug); }, 380);
      } else {
        applyActive(slug);
      }
    }

    cards.forEach(function (card) {
      var slug = card.getAttribute('data-rq');
      var btn = card.querySelector('.rq-card__header');
      btn.addEventListener('click', function () {
        var isOpen = card.classList.contains('active');
        setActive(isOpen ? null : slug, { scroll: !isOpen });
      });
    });

    function openFromHash() {
      var slug = (location.hash || '').replace('#', '');
      if (slug && cards.some(function (c) { return c.getAttribute('data-rq') === slug; })) {
        // A brief beat for first paint, then move — long enough to
        // register you've landed on a new page, short enough that it
        // doesn't read as a stall before anything happens.
        setTimeout(function () {
          setActive(slug, { scroll: true, sequenced: true });
        }, 150);
      }
    }

    window.addEventListener('hashchange', openFromHash);
    openFromHash();
  }

  /* ---- Boot -------------------------------------------- */
  document.addEventListener('DOMContentLoaded', function () {
    renderPapersLists();
    initSwitcher();
  });
})();
