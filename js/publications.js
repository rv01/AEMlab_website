(function () {
  'use strict';

  /* ---- SVG icons --------------------------------------- */
  const ICON_LINK = '<svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true"><path d="M7 1h4v4M11 1L5.5 6.5M4.5 2H2a1 1 0 00-1 1v7a1 1 0 001 1h7a1 1 0 001-1V8.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  const ICON_CHEVRON = '<svg class="year-header__chevron" viewBox="0 0 18 18" fill="none" aria-hidden="true"><path d="M4 6.5l5 5 5-5" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  /* ---- People lookup ----------------------------------- */
  var labMembers = [];

  function buildLookup() {
    // Only current lab members get linked — alumni pages are not part of
    // this flow, so a name shouldn't point somewhere that isn't a live profile.
    var all = (people.current || []).filter(function (p) {
      return p.page;
    });

    // Count occurrences of each last name to detect conflicts
    var lastNameCount = {};
    all.forEach(function (p) {
      var ln = p.name.trim().split(/\s+/).pop();
      lastNameCount[ln] = (lastNameCount[ln] || 0) + 1;
    });

    labMembers = all.map(function (p) {
      var parts = p.name.trim().split(/\s+/);
      var lastName = parts[parts.length - 1];
      var firstInitial = parts[0][0];
      return {
        lastName:     lastName,
        firstInitial: firstInitial,
        useInitial:   lastNameCount[lastName] > 1,
        page:         p.page
      };
    });
  }

  function escRe(s) {
    return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  function linkAuthors(str) {
    if (!str) return '';
    // Escape HTML entities first so we don't double-encode later
    var result = str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    labMembers.forEach(function (m) {
      var re, replaced;
      if (m.useInitial) {
        // e.g. match "Vries, O." to distinguish Olivier vs Eline
        re = new RegExp('\\b' + escRe(m.lastName) + ',\\s*' + escRe(m.firstInitial) + '\\.', 'g');
        result = result.replace(re, function (match) {
          return match.replace(
            m.lastName,
            '<a href="' + m.page + '" class="pub-author-link">' + m.lastName + '</a>'
          );
        });
      } else {
        re = new RegExp('\\b' + escRe(m.lastName) + '\\b', 'g');
        replaced = '<a href="' + m.page + '" class="pub-author-link">$&</a>';
        result = result.replace(re, replaced);
      }
    });
    return result;
  }

  /* ---- Tag filtering ----------------------------------- */
  var activeTags = [];
  var keyOnly = false;   // "Key publications" toggle — restrict to papers with an rq

  function getAllTags() {
    var seen = {};
    var tags = [];
    publications.forEach(function (p) {
      (p.tags || []).forEach(function (t) {
        if (!seen[t]) { seen[t] = true; tags.push(t); }
      });
    });
    return tags.sort();
  }

  function getFiltered() {
    return publications.filter(function (p) {
      var tags = p.tags || [];
      var hasRQ = Array.isArray(p.rq) && p.rq.length > 0;
      var tagsMatch = activeTags.every(function (t) { return tags.indexOf(t) !== -1; });
      var keyMatch = !keyOnly || hasRQ;
      return tagsMatch && keyMatch;
    });
  }

  /* ---- Research-question short-label lookup, used to label a
     key publication's tag pill (e.g. "Change") ------------------ */
  function rqShort(slug) {
    if (typeof researchQuestions === 'undefined') return slug;
    var rq = researchQuestions.filter(function (r) { return r.slug === slug; })[0];
    return rq ? rq.short : slug;
  }

  /* ---- Rendering --------------------------------------- */
  function groupByYear(pubs) {
    var map = {};
    pubs.forEach(function (p) {
      if (!map[p.year]) map[p.year] = [];
      map[p.year].push(p);
    });
    return Object.keys(map)
      .map(Number)
      .sort(function (a, b) { return b - a; })
      .map(function (y) { return { year: y, pubs: map[y] }; });
  }

  function renderPub(pub) {
    var authorsHtml = linkAuthors(pub.authors || '');
    var link = pub.doi || pub.url;

    var titleHtml = link
      ? '<a href="' + link + '" target="_blank" rel="noopener" class="pub-item__title-link">'
        + pub.title + ICON_LINK + '</a>'
      : pub.title;

    var metaBits = [];
    if (pub.journal) metaBits.push(pub.journal);
    var vp = [pub.volume, pub.pages].filter(Boolean).join(', ');
    if (vp) metaBits.push(vp);
    var metaText = metaBits.join(', ');

    var preprintBadge = pub.preprint ? '<span class="pub-item__preprint">Preprint</span>' : '';

    var keyTagsHtml = '';
    if (Array.isArray(pub.rq) && pub.rq.length) {
      keyTagsHtml = '<span class="pub-tag pub-tag--key">Key publication</span>'
        + pub.rq.map(function (slug) { return '<span class="pub-tag pub-tag--rq">' + rqShort(slug) + '</span>'; }).join('');
    }
    var contentTagsHtml = (pub.tags && pub.tags.length)
      ? pub.tags.map(function (t) { return '<span class="pub-tag">' + t + '</span>'; }).join('')
      : '';

    var tagsHtml = (keyTagsHtml || contentTagsHtml)
      ? '<div class="pub-item__tags">' + keyTagsHtml + contentTagsHtml + '</div>'
      : '';

    return '<div class="pub-item">'
      + '<p class="pub-item__title">' + titleHtml + '</p>'
      + '<p class="pub-item__authors">' + authorsHtml + '</p>'
      + '<p class="pub-item__meta">'
      + (metaText ? '<span class="pub-item__meta-text">' + metaText + '</span>' : '')
      + preprintBadge
      + '</p>'
      + tagsHtml
      + '</div>';
  }

  function renderYearSection(year, pubs) {
    return '<section class="year-section" data-year="' + year + '">'
      + '<button class="year-header" aria-expanded="true" type="button">'
      + '<div class="year-header__year-wrap">'
      + '<span class="year-header__year">' + year + '</span>'
      + '</div>'
      + '<span class="year-header__bar" aria-hidden="true"></span>'
      + ICON_CHEVRON
      + '</button>'
      + '<div class="year-body"><div class="year-body__inner">'
      + pubs.map(renderPub).join('')
      + '</div></div>'
      + '</section>';
  }

  function staggerEnter(inner) {
    var items = inner.querySelectorAll('.pub-item');
    items.forEach(function (item) {
      item.classList.remove('pub-enter');
      item.style.removeProperty('--pub-delay');
    });
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        items.forEach(function (item, i) {
          item.style.setProperty('--pub-delay', (i * 0.04) + 's');
          item.classList.add('pub-enter');
        });
      });
    });
  }

  function render() {
    var list = document.getElementById('pub-list');
    if (!list) return;

    function doRender() {
      var filtered = getFiltered();
      if (!filtered.length) {
        list.innerHTML = '<p class="no-results">No publications match the selected filters.</p>';
      } else {
        var grouped = groupByYear(filtered);
        list.innerHTML = grouped.map(function (g) { return renderYearSection(g.year, g.pubs); }).join('');
        list.querySelectorAll('.year-section').forEach(function (el, i) {
          el.style.animationDelay = (i * 0.08) + 's';
        });
        initCollapse();
      }
      list.style.opacity = '';
      list.style.transition = '';
    }

    if (list.children.length) {
      list.style.transition = 'opacity 180ms ease';
      list.style.opacity = '0';
      setTimeout(doRender, 190);
    } else {
      doRender();
    }
  }

  function initCollapse() {
    document.querySelectorAll('.year-header').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var section = btn.closest('.year-section');
        var yearWrap = btn.querySelector('.year-header__year-wrap');
        var body = section.querySelector('.year-body');
        var inner = section.querySelector('.year-body__inner');
        var collapsing = btn.getAttribute('aria-expanded') === 'true';

        btn.setAttribute('aria-expanded', String(!collapsing));

        if (collapsing) {
          /* Measure before any class changes so we get expanded-state geometry */
          var hRect = btn.getBoundingClientRect();
          var yRect = yearWrap.getBoundingClientRect();
          var delta = (hRect.width - yRect.width) / 2 - (yRect.left - hRect.left);
          /* GPU-accelerated transform — no layout recalc per frame */
          yearWrap.style.transform = 'translateX(' + delta + 'px) scale(0.9)';
          body.classList.add('collapsed');
          section.classList.add('is-collapsed');
        } else {
          yearWrap.style.transform = '';
          body.classList.remove('collapsed');
          section.classList.remove('is-collapsed');
          staggerEnter(inner);
        }
      });
    });
  }

  /* ---- Filter UI --------------------------------------- */
  function initFilters() {
    var allTags = getAllTags();
    var container = document.getElementById('pub-tags');
    if (!container) return;

    if (!allTags.length) {
      var groupEl = container.closest('.pub-filter-group');
      if (groupEl) groupEl.style.display = 'none';
    } else {
      allTags.forEach(function (tag) {
        var btn = document.createElement('button');
        btn.className = 'tag-btn tag-btn--research';
        btn.textContent = tag;
        btn.addEventListener('click', function () {
          var idx = activeTags.indexOf(tag);
          if (idx !== -1) {
            activeTags.splice(idx, 1);
            btn.classList.remove('active');
          } else {
            activeTags.push(tag);
            btn.classList.add('active');
          }
          render();
        });
        container.appendChild(btn);
      });
    }
  }

  /* ---- "Key publications" filter — a single toggle pill that
     restricts the list to papers with an rq (see rqShort() above
     for how each key paper's research question is labelled) ---- */
  function setKeyOnly(value) {
    keyOnly = value;
    var toggle = document.getElementById('pub-key-toggle');
    if (toggle) {
      toggle.classList.toggle('active', keyOnly);
      toggle.setAttribute('aria-pressed', String(keyOnly));
    }
  }

  function initKeyFilter() {
    var toggle = document.getElementById('pub-key-toggle');
    if (!toggle) return;
    toggle.addEventListener('click', function () {
      setKeyOnly(!keyOnly);
      render();
    });
  }

  /* ---- Arriving from research.html's "Explore more papers" link
     (publications.html?key=1) — pre-activates the Key publications
     filter, without narrowing to a single research question. ---- */
  function initKeyFromUrl() {
    var params = new URLSearchParams(window.location.search);
    if (params.get('key')) {
      setKeyOnly(true);
      history.replaceState(null, '', location.pathname);
    }
  }

  /* ---- Boot -------------------------------------------- */
  document.addEventListener('DOMContentLoaded', function () {
    buildLookup();
    initFilters();
    initKeyFilter();
    initKeyFromUrl();
    render();
  });
})();
