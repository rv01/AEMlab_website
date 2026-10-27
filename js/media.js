(function () {
  'use strict';

  /* ---- SVG icons ---------------------------------------- */
  const ICON_LINK = '<svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true"><path d="M7 1h4v4M11 1L5.5 6.5M4.5 2H2a1 1 0 00-1 1v7a1 1 0 001 1h7a1 1 0 001-1V8.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  /* Glyphs for the placeholder tile — line icons in the same style as
     the research and contact page icons, drawn on a 48-unit grid. The
     entry's `type` picks one; it is not shown as a label anywhere. */
  const GLYPH = {
    interview: '<svg width="48" height="48" viewBox="0 0 48 48" fill="none" aria-hidden="true">'
      + '<rect x="5" y="9" width="32" height="30" rx="2" stroke="currentColor" stroke-width="2"/>'
      + '<path d="M37 15h6v21a3 3 0 01-3 3h-3" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>'
      + '<path d="M11 16h20M11 23h20M11 30h13" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
    podcast: '<svg width="48" height="48" viewBox="0 0 48 48" fill="none" aria-hidden="true">'
      + '<rect x="18" y="5" width="12" height="21" rx="6" stroke="currentColor" stroke-width="2"/>'
      + '<path d="M12 21a12 12 0 0024 0" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>'
      + '<path d="M24 33v10M18 43h12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
    event: '<svg width="48" height="48" viewBox="0 0 48 48" fill="none" aria-hidden="true">'
      + '<rect x="6" y="10" width="36" height="32" rx="2" stroke="currentColor" stroke-width="2"/>'
      + '<path d="M6 20h36" stroke="currentColor" stroke-width="2"/>'
      + '<path d="M16 5v9M32 5v9" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>'
      + '<circle cx="24" cy="31" r="5" stroke="currentColor" stroke-width="2"/></svg>'
  };

  /* The page is Dutch by default; the switch under the banner flips it to
     English. The choice is remembered, and ?lang=en / ?lang=nl overrides it so
     a link can point at either version. Site chrome (nav, footer) stays as it is. */
  var UI = {
    nl: {
      title: 'In de media',
      docTitle: 'In de media — Amsterdam Emotional Memory Lab',
      empty: 'Hier staat nog niets — kom binnenkort terug.',
      months: ['januari', 'februari', 'maart', 'april', 'mei', 'juni',
               'juli', 'augustus', 'september', 'oktober', 'november', 'december']
    },
    en: {
      title: 'In the Media',
      docTitle: 'In the Media — Amsterdam Emotional Memory Lab',
      empty: 'Nothing here yet — check back soon.',
      months: ['January', 'February', 'March', 'April', 'May', 'June',
               'July', 'August', 'September', 'October', 'November', 'December']
    }
  };
  var STORE_KEY = 'aeml-media-lang';
  var lang = 'nl';

  /* ---- Helpers ------------------------------------------ */
  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function escRe(s) {
    return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  /* "2025-12-04" -> "4 december 2025" / "4 December 2025". Parsed by hand rather than via
     Date() so the day never shifts with the viewer's timezone. */
  function formatDate(iso) {
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso || '');
    if (!m) return esc(iso);
    return Number(m[3]) + ' ' + UI[lang].months[Number(m[2]) - 1] + ' ' + m[1];
  }

  function yearOf(iso) {
    return (iso || '').slice(0, 4);
  }

  /* Text for the current language, falling back to the other one. */
  function text(item) {
    var other = lang === 'nl' ? 'en' : 'nl';
    var a = item[lang] || {}, b = item[other] || {};
    return {
      title: a.title || b.title || '',
      description: a.description || b.description || '',
      imageAlt: a.imageAlt || b.imageAlt || ''
    };
  }

  function byDateDesc(a, b) {
    return (a.date < b.date) ? 1 : (a.date > b.date) ? -1 : 0;
  }

  /* ---- Linking lab members in the description ------------
     Only current members are linked, the same rule js/publications.js
     applies to author names — a name should never point at someone who
     is no longer in the lab. */
  var memberPatterns = [];

  function buildMemberPatterns() {
    if (typeof people === 'undefined') return;
    (people.current || []).filter(function (p) { return p.page; }).forEach(function (p) {
      var parts = p.name.trim().split(/\s+/);
      var first = parts.shift();
      // Middle initials are optional in prose: data has "Renée M. Visser",
      // an entry may well just say "Renée Visser".
      var rest = parts.filter(function (t) { return !/^[A-Z]\.$/.test(t); });
      if (!rest.length) return;
      memberPatterns.push({
        re: new RegExp(escRe(first) + '(?:\\s+[A-Z]\\.)*\\s+' + rest.map(escRe).join('\\s+'), 'g'),
        page: p.page
      });
    });
  }

  function linkNamesInText(text) {
    memberPatterns.forEach(function (m) {
      text = text.replace(m.re, '<a href="' + m.page + '" class="media-person-link">$&</a>');
    });
    return text;
  }

  /* Descriptions in data/media.js are authored as HTML, so names are
     matched only in the text between tags — never inside an attribute,
     and never inside an existing link (which would nest anchors). */
  function linkPeople(html) {
    var anchorDepth = 0;
    return String(html || '').split(/(<[^>]*>)/).map(function (chunk, i) {
      if (i % 2 === 1) {
        if (/^<a\b/i.test(chunk)) anchorDepth++;
        else if (/^<\/a\s*>/i.test(chunk)) anchorDepth = Math.max(0, anchorDepth - 1);
        return chunk;
      }
      return anchorDepth ? chunk : linkNamesInText(chunk);
    }).join('');
  }

  /* ---- Rendering ---------------------------------------- */
  function renderFigure(item, t) {
    if (item.image) {
      return '<div class="media-entry__figure">'
        + '<img src="' + esc(item.image) + '" alt="' + esc(t.imageAlt) + '">'
        + '</div>';
    }
    /* No photo yet — a tile of the same proportions, so adding an
       `image` later swaps in without shifting the layout. */
    return '<div class="media-entry__figure media-entry__figure--placeholder" aria-hidden="true">'
      + '<span class="media-entry__glyph">' + (GLYPH[item.type] || GLYPH.interview) + '</span>'
      + '<span class="media-entry__outlet-mark">' + esc(item.outlet) + '</span>'
      + '</div>';
  }

  /* The icon travels with the title's last word (no-wrap), so it can never
     wrap onto a line of its own or hop lines between languages. */
  function withIcon(title) {
    var i = title.lastIndexOf(' ');
    return esc(title.slice(0, i + 1))
      + '<span class="media-entry__title-end">' + esc(title.slice(i + 1)) + ICON_LINK + '</span>';
  }

  function renderEntry(item, isYearStart) {
    var t = text(item);
    var titleHtml = item.url
      ? '<a href="' + esc(item.url) + '" target="_blank" rel="noopener" class="media-entry__title-link">'
        + withIcon(t.title) + '</a>'
      : esc(t.title);

    var watermark = isYearStart
      ? '<span class="media-entry__watermark" aria-hidden="true">' + yearOf(item.date) + '</span>'
      : '';

    return '<section class="media-entry' + (isYearStart ? ' media-entry--year-start' : '') + '">'
      + watermark
      + '<div class="media-entry__inner">'
      + renderFigure(item, t)
      + '<div class="media-entry__body">'
      + '<p class="media-entry__label"><span>' + formatDate(item.date)
      + ' &middot; ' + esc(item.outlet) + '</span></p>'
      + '<h2 class="media-entry__title">' + titleHtml + '</h2>'
      + '<p class="media-entry__desc">' + linkPeople(t.description) + '</p>'
      + '</div>'
      + '</div>'
      + '</section>';
  }

  /* ---- Reveal on scroll ---------------------------------
     Entries are built after main.js has already collected its .reveal
     elements, so this page runs its own observer over the bands. */
  function initReveal(list, instant) {
    var entries = list.querySelectorAll('.media-entry');
    if (!entries.length) return;

    /* Switching language re-renders in place: the reader has already seen
       these bands, so they appear at once rather than sliding in again. */
    if (instant) {
      entries.forEach(function (el) { el.classList.add('is-in'); });
      return;
    }

    if (!('IntersectionObserver' in window)) {
      entries.forEach(function (el) { el.classList.add('is-in'); });
      if (window.__revealArmed) window.__revealArmed();
      return;
    }
    var obs = new IntersectionObserver(function (records) {
      records.forEach(function (record) {
        if (!record.isIntersecting) return;
        record.target.classList.add('is-in');
        obs.unobserve(record.target);
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });
    entries.forEach(function (el) { obs.observe(el); });
    /* This page has no static .reveal sections, so main.js never arms the
       head gate — the bands are the reveal here and this is where the
       promise to show them is kept. */
    if (window.__revealArmed) window.__revealArmed();
  }

  function render(instant) {
    var list = document.getElementById('media-list');
    if (!list) return;

    var items = (typeof mediaItems === 'undefined' ? [] : mediaItems.slice()).sort(byDateDesc);

    if (!items.length) {
      list.innerHTML = '<p class="media-empty">' + UI[lang].empty + '</p>';
      return;
    }

    buildMemberPatterns();

    var lastYear = null;
    list.innerHTML = items.map(function (item) {
      var year = yearOf(item.date);
      var isYearStart = year !== lastYear;
      lastYear = year;
      return renderEntry(item, isYearStart);
    }).join('');

    initReveal(list, instant);
  }

  /* ---- Language switch ---------------------------------- */
  function readLang() {
    var q = /[?&]lang=(nl|en)\b/.exec(location.search);
    if (q) return q[1];
    try {
      var saved = localStorage.getItem(STORE_KEY);
      if (saved === 'nl' || saved === 'en') return saved;
    } catch (e) { /* storage blocked — fine, stay on the default */ }
    return 'nl';
  }

  function applyLang(next, instant) {
    lang = next;
    document.documentElement.lang = lang;
    document.title = UI[lang].docTitle;
    var h1 = document.getElementById('media-title');
    if (h1) h1.textContent = UI[lang].title;
    document.querySelectorAll('.lang-switch__btn').forEach(function (b) {
      b.setAttribute('aria-pressed', b.getAttribute('data-lang') === lang ? 'true' : 'false');
    });
    render(instant);
  }

  function initSwitch() {
    document.querySelectorAll('.lang-switch__btn').forEach(function (b) {
      b.addEventListener('click', function () {
        var next = b.getAttribute('data-lang');
        if (next === lang) return;
        try { localStorage.setItem(STORE_KEY, next); } catch (e) { /* ignore */ }
        applyLang(next, true);
      });
    });
  }

  /* ---- Boot --------------------------------------------- */
  document.addEventListener('DOMContentLoaded', function () {
    initSwitch();
    applyLang(readLang(), false);
  });
})();
