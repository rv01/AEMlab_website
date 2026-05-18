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
  var num = 1;
  if (person.researchInterests) body.appendChild(makeSection(num++, 'Research Interests', person.researchInterests));
  if (person.background)        body.appendChild(makeSection(num++, 'Background', person.background));

  function makeSection(n, heading, text) {
    var section = document.createElement('section');
    section.className = 'profile-section';
    section.setAttribute('data-num', ('0' + n).slice(-2));
    var inner = document.createElement('div');
    inner.className = 'profile-section__inner';
    var h2 = document.createElement('h2');
    h2.textContent = heading;
    var p = document.createElement('p');
    p.textContent = text;
    inner.appendChild(h2);
    inner.appendChild(p);
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
