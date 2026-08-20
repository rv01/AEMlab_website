(function () {
  var id = window.location.pathname.split('/').pop().replace('.html', '');
  var person = people.current.find(function (p) { return p.id === id; });
  if (!person) return;

  document.title = person.name + ' — Amsterdam Emotional Memory Lab';

  var photo = document.querySelector('.profile-photo');
  photo.src = '../' + (person.photoBio || person.photo);
  photo.alt = person.name;

  document.querySelector('.profile-name').textContent = person.name;
  document.querySelector('.profile-role').textContent = person.role;

  var linksEl = document.querySelector('.profile-hero__links');
  (person.links || []).forEach(function (link) {
    var a = document.createElement('a');
    a.href = link.url;
    a.target = '_blank';
    a.rel = 'noopener';
    a.className = 'profile-link';
    a.innerHTML = linkIcon(link.label) + link.label;
    linksEl.appendChild(a);
  });

  var body = document.querySelector('.profile-body');
  if (person.researchInterests) body.appendChild(makeSection('Research Interests', person.researchInterests));
  if (person.background)        body.appendChild(makeSection('Background', person.background));
  body.appendChild(makePapersSection(person));

  /* No section number any more: `data-num` fed a 14rem watermark numeral that
     numbered a list of at most two, so both it and the counter are gone. */
  function makeSection(heading, text) {
    var section = document.createElement('section');
    section.className = 'profile-section';
    var inner = document.createElement('div');
    inner.className = 'profile-section__inner';
    var h2 = document.createElement('h2');
    h2.textContent = heading;
    inner.appendChild(h2);
    text.split(/\n\n+/).forEach(function (para) {
      var p = document.createElement('p');
      p.innerHTML = richText(para.trim());
      inner.appendChild(p);
    });
    section.appendChild(inner);
    return section;
  }

  /* Bios reference funding pages and papers inline. Source text uses
     Markdown's `[label](url)` for those so it stays readable in
     data/people.js; this turns it into real anchors after HTML-escaping
     everything else, so a `<` or `&` in a bio can never be read as markup. */
  function richText(text) {
    var escaped = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    return escaped.replace(/\[([^\]]+)\]\(([^)]+)\)/g, function (match, label, url) {
      return '<a href="' + url + '" target="_blank" rel="noopener">' + label + '</a>';
    });
  }

  /* ---- Publications within the lab --------------------------
     Same "boxed, secondary" register as the research-questions page's Key
     Papers panel — a heading like every other section, then a quiet list,
     not a second wall of prose. Membership is matched the same way
     js/publications.js links author names on the publications page: last
     name, with the first initial added only when someone else in the roster
     (current or alumni) shares that surname — e.g. Eline vs. Olivier de
     Vries. Keeping this logic in step with publications.js is deliberate:
     the two pages should agree on who "wrote" a given paper. */
  /* A function, not a `var` — this is used from `makePapersSection`, which
     runs at the top of the IIFE before a `var` assignment further down the
     file would have executed. Function declarations hoist in full; `var`
     only hoists the (undefined) binding. */
  function iconLink() {
    return '<svg width="10" height="10" viewBox="0 0 12 12" fill="none" aria-hidden="true"><path d="M7 1h4v4M11 1L5.5 6.5M4.5 2H2a1 1 0 00-1 1v7a1 1 0 001 1h7a1 1 0 001-1V8.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  }

  function escRe(s) {
    return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  function personPublications(who) {
    if (typeof publications === 'undefined') return [];

    var everyone = (people.current || []).concat(people.alumni || []);
    var lastNameCount = {};
    everyone.forEach(function (p) {
      var ln = p.name.trim().split(/\s+/).pop();
      lastNameCount[ln] = (lastNameCount[ln] || 0) + 1;
    });

    var parts        = who.name.trim().split(/\s+/);
    var lastName      = parts[parts.length - 1];
    var firstInitial  = parts[0][0];
    var useInitial    = lastNameCount[lastName] > 1;
    var re = useInitial
      ? new RegExp('\\b' + escRe(lastName) + ',\\s*' + escRe(firstInitial) + '\\.')
      : new RegExp('\\b' + escRe(lastName) + '\\b');

    return publications
      .filter(function (pub) { return re.test(pub.authors || ''); })
      .sort(function (a, b) { return b.year - a.year; });
  }

  function renderPaper(pub) {
    var link = pub.doi || pub.url;
    var titleHtml = link
      ? '<a href="' + link + '" target="_blank" rel="noopener" class="profile-paper__title-link">' + pub.title + iconLink() + '</a>'
      : pub.title;

    var metaParts = [];
    if (pub.journal) metaParts.push(pub.journal);
    metaParts.push(pub.year);

    var div = document.createElement('div');
    div.className = 'profile-paper';
    div.innerHTML = '<div class="profile-paper__title">' + titleHtml + '</div>'
      + '<div class="profile-paper__meta">' + pub.authors + ' &middot; ' + metaParts.join(', ') + '</div>';
    return div;
  }

  function makePapersSection(who) {
    var section = document.createElement('section');
    section.className = 'profile-section';
    var inner = document.createElement('div');
    inner.className = 'profile-section__inner';
    var h2 = document.createElement('h2');
    h2.textContent = 'Publications within the lab';
    inner.appendChild(h2);

    var panel = document.createElement('div');
    panel.className = 'profile-papers';

    var matched = personPublications(who);
    if (!matched.length) {
      var empty = document.createElement('div');
      empty.className = 'profile-paper__empty';
      empty.textContent = 'No lab publications found yet.';
      panel.appendChild(empty);
    } else {
      matched.forEach(function (pub) { panel.appendChild(renderPaper(pub)); });
    }

    inner.appendChild(panel);
    section.appendChild(inner);
    return section;
  }

  function linkIcon(label) {
    if (label === 'LinkedIn') {
      return '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">'
        + '<rect width="24" height="24" rx="3" fill="currentColor"/>'
        + '<rect x="3" y="8" width="4" height="13" fill="var(--navy)"/>'
        + '<circle cx="5" cy="5" r="2" fill="var(--navy)"/>'
        + '<path d="M10 8h4v2s1-2 4-2c3 0 4 2 4 5v8h-4v-7c0-1-.5-2-2-2s-2 1-2 2v7h-4V8z" fill="var(--navy)"/>'
        + '</svg>';
    }
    return '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'
      + '<path d="M3 21h18M3 10h18M5 6l7-3 7 3M4 10v11M20 10v11M8 10v11M16 10v11M12 10v11"/>'
      + '</svg>';
  }
})();
