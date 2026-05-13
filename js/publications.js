(function () {
  'use strict';

  /* ---- SVG icons --------------------------------------- */
  const ICON_LINK = '<svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true"><path d="M7 1h4v4M11 1L5.5 6.5M4.5 2H2a1 1 0 00-1 1v7a1 1 0 001 1h7a1 1 0 001-1V8.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  const ICON_CHEVRON = '<svg class="year-header__chevron" viewBox="0 0 18 18" fill="none" aria-hidden="true"><path d="M4 6.5l5 5 5-5" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  /* ---- People lookup ----------------------------------- */
  var labMembers = [];

  function buildLookup() {
    var all = (people.current || []).concat(people.alumni || []).filter(function (p) {
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
    if (!activeTags.length) return publications;
    return publications.filter(function (p) {
      var tags = p.tags || [];
      return activeTags.every(function (t) { return tags.indexOf(t) !== -1; });
    });
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

    var doiHtml = link
      ? '<div class="pub-item__link-col"><a href="' + link + '" target="_blank" rel="noopener" class="pub-doi" title="Open article">' + ICON_LINK + '</a></div>'
      : '<div class="pub-item__link-col"></div>';

    var featuredBadge = pub.featured
      ? '<span class="pub-item__featured-badge">Key publication</span>'
      : '';

    var metaParts = [];
    if (pub.journal) metaParts.push('<span class="pub-item__journal">' + pub.journal + '</span>');
    var vp = [pub.volume, pub.pages].filter(Boolean).join(', ');
    if (vp) metaParts.push('<span>' + vp + '</span>');

    var preprintBadge = pub.preprint ? '<span class="pub-item__preprint">Preprint</span>' : '';

    var tagsHtml = '';
    if (pub.tags && pub.tags.length) {
      tagsHtml = '<div class="pub-item__tags">'
        + pub.tags.map(function (t) { return '<span class="pub-tag">' + t + '</span>'; }).join('')
        + '</div>';
    }

    return '<div class="pub-item' + (pub.featured ? ' featured' : '') + '">'
      + '<div class="pub-item__body">'
      + '<p class="pub-item__title">' + pub.title + featuredBadge + '</p>'
      + '<p class="pub-item__authors">' + authorsHtml + '</p>'
      + '<p class="pub-item__meta">' + metaParts.join(', ') + (preprintBadge ? ' ' + preprintBadge : '') + '</p>'
      + tagsHtml
      + '</div>'
      + doiHtml
      + '</div>';
  }

  function renderYearSection(year, pubs) {
    var count = pubs.length;
    return '<section class="year-section" data-year="' + year + '">'
      + '<button class="year-header" aria-expanded="true" type="button">'
      + '<span class="year-header__year">' + year + '</span>'
      + '<span class="year-header__bar" aria-hidden="true"></span>'
      + ICON_CHEVRON
      + '</button>'
      + '<div class="year-body"><div class="year-body__inner">'
      + pubs.map(renderPub).join('')
      + '</div></div>'
      + '</section>';
  }

  function render() {
    var list = document.getElementById('pub-list');
    if (!list) return;
    var filtered = getFiltered();
    if (!filtered.length) {
      list.innerHTML = '<p class="no-results">No publications match the selected filters.</p>';
      return;
    }
    var grouped = groupByYear(filtered);
    list.innerHTML = grouped.map(function (g) { return renderYearSection(g.year, g.pubs); }).join('');
    initCollapse();
  }

  function initCollapse() {
    document.querySelectorAll('.year-header').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var body = btn.nextElementSibling;
        var expanded = btn.getAttribute('aria-expanded') === 'true';
        btn.setAttribute('aria-expanded', String(!expanded));
        body.classList.toggle('collapsed', expanded);
      });
    });
  }

  /* ---- Filter UI --------------------------------------- */
  function initFilters() {
    var allTags = getAllTags();
    var container = document.getElementById('pub-tags');
    var clearBtn  = document.getElementById('pub-tag-clear');
    if (!container || !clearBtn) return;

    if (!allTags.length) {
      var filtersEl = document.querySelector('.pub-filters');
      if (filtersEl) filtersEl.style.display = 'none';
      return;
    }

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
        clearBtn.classList.toggle('visible', activeTags.length > 0);
        render();
      });
      container.appendChild(btn);
    });

    clearBtn.addEventListener('click', function () {
      activeTags = [];
      container.querySelectorAll('.tag-btn').forEach(function (b) { b.classList.remove('active'); });
      clearBtn.classList.remove('visible');
      render();
    });
  }

  /* ---- Boot -------------------------------------------- */
  document.addEventListener('DOMContentLoaded', function () {
    buildLookup();
    initFilters();
    render();
  });
})();
