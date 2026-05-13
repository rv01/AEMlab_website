/* AEM Lab — Team constellation + tag filter */
(function () {
  'use strict';

  /* ---- Tag taxonomy -------------------------------------- */
  var RESEARCH_TAGS = [
    'Autobiographical memory', 'Intrusive memory', 'Imagery rescripting',
    'Contextual memory', 'Narrative formation', 'Theory development',
    'Fear memory', 'Memory reconsolidation', 'Clinical populations',
    'Conditioning', 'fMRI', 'Psychophysiology', 'Computational modeling',
    'Network approach'
  ];

  var POSITION_TAGS = ['Professor', 'Associate Professor', 'Postdoc', 'PhD student'];

  var tagKeywords = {
    'Autobiographical memory': ['autobiographical memory', 'autobiographical', 'episodic memory'],
    'Intrusive memory':        ['intrusive', 'intrusion'],
    'Imagery rescripting':     ['imagery rescripting'],
    'Contextual memory':       ['contextual', 'contextualization', 'context'],
    'Narrative formation':     ['narrative'],
    'Theory development':      ['latent construct', 'latent-factor', 'theoretical construct'],
    'Fear memory':             ['fear memory', 'fear and anxiety', 'fear conditioning', 'fear-conditioning', 'phobic', 'anxiety disorder'],
    'Memory reconsolidation':  ['reconsolidation'],
    'Clinical populations':    ['clinical', 'ptsd', 'post-traumatic', 'psychiatric disorder', 'psychopathology', 'mental health', 'affective disorder'],
    'Conditioning':            ['conditioning'],
    'fMRI':                    ['fmri', 'functional magnetic resonance', 'neuroimaging'],
    'Psychophysiology':        ['psychophysiology', 'heart rate', 'startle', 'physiological', 'cortisol', 'neuroendocrinological'],
    'Computational modeling':  ['computational', 'mediation analysis', 'statistical technique'],
    'Network approach':        ['network model', 'network theory', 'network approach']
  };

  /* Lower = more central/top */
  var SENIORITY = {
    'Full Professor':      1,
    'Associate Professor': 2,
    'Assistant Professor': 2,
    'Postdoc':             3,
    'PhD Candidate':       4
  };

  /* Zones as [xMin, xMax, yMin, yMax] fractions of canvas */
  var ZONES = {
    1: [0.30, 0.70, 0.04, 0.22],
    2: [0.12, 0.88, 0.16, 0.44],
    3: [0.08, 0.92, 0.34, 0.62],
    4: [0.04, 0.96, 0.50, 0.96]
  };

  /* ---- Tag helpers --------------------------------------- */
  function researchTagsFor(person) {
    var text = (person.researchInterests || '').toLowerCase();
    return RESEARCH_TAGS.filter(function (tag) {
      return (tagKeywords[tag] || []).some(function (kw) {
        return text.indexOf(kw) !== -1;
      });
    });
  }

  function positionTagFor(role) {
    if (role === 'Full Professor')      return 'Professor';
    if (role === 'Associate Professor') return 'Associate Professor';
    if (role === 'Assistant Professor') return 'Assistant Professor';
    if (role.indexOf('Postdoc') !== -1) return 'Postdoc';
    if (role.indexOf('PhD') !== -1)     return 'PhD student';
    return null;
  }

  /* ---- Placement ----------------------------------------- */
  var NODE_D  = 150;
  var MIN_GAP = NODE_D + 18;
  var MARGIN  = NODE_D / 2 + 10;

  function placeNodes(canvas, members) {
    var W = canvas.offsetWidth;
    var H = canvas.offsetHeight;

    if (W < 50 || H < 50) {
      setTimeout(function () { placeNodes(canvas, members); }, 80);
      return;
    }

    var sorted = members.slice().sort(function (a, b) {
      return (SENIORITY[a.role] || 4) - (SENIORITY[b.role] || 4);
    });

    var placed = [];

    sorted.forEach(function (person, idx) {
      var level = SENIORITY[person.role] || 4;
      var zone  = ZONES[level];
      var px, py, tries = 0;

      do {
        px = (zone[0] + Math.random() * (zone[1] - zone[0])) * W;
        py = (zone[2] + Math.random() * (zone[3] - zone[2])) * H;
        px = Math.max(MARGIN, Math.min(W - MARGIN, px));
        py = Math.max(MARGIN, Math.min(H - MARGIN, py));
        tries++;
      } while (
        tries < 300 &&
        placed.some(function (p) {
          var dx = p.x - px, dy = p.y - py;
          return Math.sqrt(dx * dx + dy * dy) < MIN_GAP;
        })
      );

      placed.push({ x: px, y: py });
      spawnNode(canvas, person, px / W * 100, py / H * 100, H, idx);
    });
  }

  /* ---- Create DOM node ----------------------------------- */
  function spawnNode(canvas, person, xPct, yPct, canvasH, index) {
    var rTags = researchTagsFor(person);
    var pTag  = positionTagFor(person.role);

    var node = document.createElement('div');
    node.className = 'p-node';
    node.style.left = xPct.toFixed(2) + '%';
    node.style.top  = yPct.toFixed(2) + '%';

    node.dataset.researchTags = rTags.join('||');
    node.dataset.positionTag  = pTag || '';

    if (person.page) {
      node.addEventListener('click', function () {
        window.location.href = person.page;
      });
    }

    var wrap = document.createElement('div');
    wrap.className = 'p-node__img-wrap';

    var img = document.createElement('img');
    img.className = 'p-node__img';
    img.src = person.photo;
    img.alt = person.name;

    var overlay = document.createElement('div');
    overlay.className = 'p-node__overlay';

    var tipAbove = yPct > 75;
    var tip = document.createElement('div');
    tip.className = 'p-node__tooltip' + (tipAbove ? ' p-node__tooltip--above' : '');
    tip.innerHTML =
      '<span class="p-node__tooltip-name">' + person.name + '</span>' +
      '<span class="p-node__tooltip-role">' + person.role + '</span>';

    wrap.appendChild(img);
    wrap.appendChild(overlay);
    node.appendChild(wrap);
    node.appendChild(tip);
    canvas.appendChild(node);

    /* Staggered entrance: add .in after a short delay so CSS transition fires */
    setTimeout((function (n) {
      return function () { n.classList.add('in'); };
    }(node)), 100 + index * 80);
  }

  /* ---- Tag panel ----------------------------------------- */
  var activeTags = {};

  function buildTagPanel() {
    var posList  = document.getElementById('position-tags');
    var resList  = document.getElementById('research-tags');
    var clearBtn = document.getElementById('tag-clear');
    if (!posList || !resList) return;

    POSITION_TAGS.forEach(function (tag) { posList.appendChild(makeBtn(tag, 'position')); });
    RESEARCH_TAGS.forEach(function (tag) { resList.appendChild(makeBtn(tag, 'research')); });

    if (clearBtn) {
      clearBtn.addEventListener('click', function () {
        activeTags = {};
        var btns = document.querySelectorAll('.tag-btn.active');
        for (var i = 0; i < btns.length; i++) btns[i].classList.remove('active');
        applyFilter();
        clearBtn.classList.remove('visible');
      });
    }
  }

  function makeBtn(tag, type) {
    var btn = document.createElement('button');
    btn.className = 'tag-btn tag-btn--' + type;
    btn.textContent = tag;
    btn.addEventListener('click', function () {
      if (activeTags[tag]) {
        delete activeTags[tag];
        btn.classList.remove('active');
      } else {
        activeTags[tag] = true;
        btn.classList.add('active');
      }
      applyFilter();
      var cb = document.getElementById('tag-clear');
      if (cb) cb.classList.toggle('visible', Object.keys(activeTags).length > 0);
    });
    return btn;
  }

  /* ---- Filter -------------------------------------------- */
  function applyFilter() {
    var keys  = Object.keys(activeTags);
    var nodes = document.querySelectorAll('.p-node');
    for (var i = 0; i < nodes.length; i++) {
      var node = nodes[i];
      if (keys.length === 0) { node.classList.remove('dimmed'); continue; }
      var rTags = node.dataset.researchTags ? node.dataset.researchTags.split('||') : [];
      var pTag  = node.dataset.positionTag;
      var all   = pTag ? rTags.concat([pTag]) : rTags;
      var match = keys.every(function (k) { return all.indexOf(k) !== -1; });
      if (match) node.classList.remove('dimmed');
      else       node.classList.add('dimmed');
    }
  }

  /* ---- Boot ---------------------------------------------- */
  function init() {
    var canvas = document.getElementById('constellation');
    if (!canvas) return;
    if (typeof people === 'undefined') { console.warn('people data not loaded'); return; }

    /* Set an explicit pixel height before nodes are placed */
    var header  = document.querySelector('.team-header');
    var nav     = document.querySelector('.nav');
    var navH    = nav    ? nav.offsetHeight    : 64;
    var headerH = header ? header.offsetHeight : 0;
    var canvasH = Math.max(window.innerHeight - navH - headerH, 620);
    canvas.style.height = canvasH + 'px';

    buildTagPanel();

    /* Small delay so the browser has committed the height before we measure */
    setTimeout(function () { placeNodes(canvas, people.current); }, 50);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
