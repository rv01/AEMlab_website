/* AEM Lab — Team constellation
   Physics: alpha-decay spring model with drag interaction
   Rendering: GPU-accelerated CSS transform (no layout reflow) */
(function () {
  'use strict';

  /* ---- Mutable layout state (updated on resize) ----------- */
  var nodeSize    = 170;   /* diameter in px */
  var NODE_R      = 85;    /* radius */
  var MIN_GAP     = 230;   /* min centre-to-centre distance (incl. label height) */
  var MARGIN      = 100;   /* min distance from canvas edge to node centre */
  var MARGIN_BOT  = 145;   /* larger bottom margin — keeps label above footer */

  /* ---- Physics constants ---------------------------------- */
  var SPRING_K     = 0.0028;  /* spring constant — lower = slower settle */
  var VEL_DECAY    = 0.15;    /* per frame: velocity *= (1 - VEL_DECAY) — more damping */
  var ALPHA_FACTOR = 0.982;   /* per frame alpha decay — slightly slower cooldown */
  var ALPHA_MIN    = 0.055;   /* floor for perpetual drift */
  var REPULSION_K  = 2.2;     /* repulsion multiplier — softer initial pushes */

  /* ---- Seniority ----------------------------------------- */
  var SENIORITY = {
    'Full Professor':      1,
    'Associate Professor': 2,
    'Assistant Professor': 2,
    'Postdoc':             3,
    'PhD Candidate':       4
  };

  /* Persistent center-gravity per level (NOT alpha-scaled — always active).
     This keeps senior nodes near center even when alpha is at minimum and
     the spring force is too weak to compete with repulsion from PhD nodes. */
  var SENIORITY_CGK = [0.0016, 0.0006, 0.00015, 0];

  var POSITION_TAGS = ['Professor', 'Associate Professor', 'Postdoc', 'PhD student'];
  var RESEARCH_TAGS = [
    'Fear memory', 'Memory reconsolidation', 'Autobiographical memory',
    'Intrusive memory', 'Contextual memory', 'Narrative formation',
    'Network approach', 'Theory development', 'Clinical populations',
    'Conditioning', 'fMRI', 'Psychophysiology'
  ];

  function positionTagFor(role) {
    if (role === 'Full Professor')       return 'Professor';
    if (role === 'Associate Professor')  return 'Associate Professor';
    if (role === 'Assistant Professor')  return 'Assistant Professor';
    if (role.indexOf('Postdoc') !== -1)  return 'Postdoc';
    if (role.indexOf('PhD')    !== -1)   return 'PhD student';
    return null;
  }

  function sharedTagCount(a, b) {
    var ta = a.tags || [], tb = b.tags || [], c = 0;
    for (var i = 0; i < ta.length; i++)
      for (var j = 0; j < tb.length; j++)
        if (ta[i] === tb[j]) c++;
    return c;
  }

  /* ---- Responsive node sizing ----------------------------- */
  function computeNodeSize() {
    var w = window.innerWidth;
    if (w <= 480)  return 95;
    if (w <= 768)  return 120;
    /* linear: 135 at 769 px → 170 at 1400 px */
    return Math.round(Math.min(170, 135 + (170 - 135) * (w - 769) / (1400 - 769)));
  }

  /* ---- Force-directed target layout ----------------------- */
  function computeTargets(members, W, H) {
    var n   = members.length;
    var pos = [], fx = [], fy = [], i, j;

    /* Seed positions in a small ring at canvas centre */
    for (i = 0; i < n; i++) {
      var a = (i / n) * Math.PI * 2;
      pos.push({ x: W / 2 + Math.cos(a) * 22, y: H / 2 + Math.sin(a) * 22 });
      fx.push(0); fy.push(0);
    }

    var halfMin = Math.min(W, H) * 0.5;

    /* Seniority ring fractions and force constants.
       Stronger forces ensure senior targets survive repulsion from outer nodes.
         Prof=0 (centre)  AssocProf=0.18  Postdoc=0.42  PhD=0.75  × halfMin
         Force: 0.18  /   0.10        /   0.050      /  0.014               */
    var RADIAL_FRACS  = [0,    0.18,  0.42,  0.75];
    var RADIAL_FORCES = [0.18, 0.10,  0.050, 0.014];

    for (var iter = 0; iter < 600; iter++) {
      for (i = 0; i < n; i++) { fx[i] = 0; fy[i] = 0; }

      /* Seniority radial force */
      for (i = 0; i < n; i++) {
        var level  = SENIORITY[members[i].role] || 4;
        var idealR = RADIAL_FRACS[level - 1] * halfMin;
        var kR     = RADIAL_FORCES[level - 1];
        var dx = pos[i].x - W / 2;
        var dy = pos[i].y - H / 2;
        var d  = Math.sqrt(dx * dx + dy * dy) || 1;
        var err = d - idealR;
        fx[i] -= (dx / d) * err * kR;
        fy[i] -= (dy / d) * err * kR;
      }

      /* Tag affinity */
      for (i = 0; i < n; i++) {
        for (j = i + 1; j < n; j++) {
          var shared = sharedTagCount(members[i], members[j]);
          if (!shared) continue;
          var dx = pos[j].x - pos[i].x;
          var dy = pos[j].y - pos[i].y;
          var d  = Math.sqrt(dx * dx + dy * dy) || 1;
          var s  = shared * 0.009;
          fx[i] += (dx / d) * s;  fy[i] += (dy / d) * s;
          fx[j] -= (dx / d) * s;  fy[j] -= (dy / d) * s;
        }
      }

      /* Repulsion */
      for (i = 0; i < n; i++) {
        for (j = i + 1; j < n; j++) {
          var dx = pos[j].x - pos[i].x;
          var dy = pos[j].y - pos[i].y;
          var d  = Math.sqrt(dx * dx + dy * dy) || 1;
          var minD = MIN_GAP * 1.35;
          if (d < minD) {
            var s = ((minD - d) / minD) * 0.95;
            fx[i] -= (dx / d) * s;  fy[i] -= (dy / d) * s;
            fx[j] += (dx / d) * s;  fy[j] += (dy / d) * s;
          }
        }
      }

      /* Apply forces with boundary clamping */
      for (i = 0; i < n; i++) {
        pos[i].x = Math.max(MARGIN, Math.min(W - MARGIN,     pos[i].x + fx[i] * 10));
        pos[i].y = Math.max(MARGIN, Math.min(H - MARGIN_BOT, pos[i].y + fy[i] * 10));
      }
    }

    return pos;
  }

  /* ---- Background particle canvas ------------------------- */
  var bgCtx, bgW, bgH, bgPts, bgRaf;

  function initBgCanvas(bgCanvas, W, H) {
    bgW = W; bgH = H;
    bgCanvas.width  = W;
    bgCanvas.height = H;
    bgCtx = bgCanvas.getContext('2d');

    var N = 55;
    bgPts = [];
    for (var i = 0; i < N; i++) {
      bgPts.push({
        x:  Math.random() * W,
        y:  Math.random() * H,
        vx: (Math.random() - 0.5) * 0.32,
        vy: (Math.random() - 0.5) * 0.32,
        r:  Math.random() * 1.6 + 0.5
      });
    }

    if (bgRaf) cancelAnimationFrame(bgRaf);
    drawBg();
  }

  function resizeBgCanvas(bgCanvas, W, H) {
    bgW = W; bgH = H;
    bgCanvas.width  = W;
    bgCanvas.height = H;
    bgCtx = bgCanvas.getContext('2d');
    if (bgPts) {
      bgPts.forEach(function (p) {
        p.x = Math.random() * W;
        p.y = Math.random() * H;
      });
    }
  }

  function drawBg() {
    bgCtx.clearRect(0, 0, bgW, bgH);
    var MAX_LINE = 180;
    var i, j, dx, dy, d;

    for (i = 0; i < bgPts.length; i++) {
      bgPts[i].x += bgPts[i].vx;
      bgPts[i].y += bgPts[i].vy;
      if (bgPts[i].x < 0)    bgPts[i].x = bgW;
      if (bgPts[i].x > bgW)  bgPts[i].x = 0;
      if (bgPts[i].y < 0)    bgPts[i].y = bgH;
      if (bgPts[i].y > bgH)  bgPts[i].y = 0;
    }

    /* Lines */
    for (i = 0; i < bgPts.length; i++) {
      for (j = i + 1; j < bgPts.length; j++) {
        dx = bgPts[j].x - bgPts[i].x;
        dy = bgPts[j].y - bgPts[i].y;
        d  = Math.sqrt(dx * dx + dy * dy);
        if (d < MAX_LINE) {
          bgCtx.beginPath();
          bgCtx.moveTo(bgPts[i].x, bgPts[i].y);
          bgCtx.lineTo(bgPts[j].x, bgPts[j].y);
          bgCtx.strokeStyle = 'rgba(70,114,162,' + ((1 - d / MAX_LINE) * 0.24).toFixed(3) + ')';
          bgCtx.lineWidth   = 0.9;
          bgCtx.stroke();
        }
      }
    }

    /* Dots */
    for (i = 0; i < bgPts.length; i++) {
      bgCtx.beginPath();
      bgCtx.arc(bgPts[i].x, bgPts[i].y, bgPts[i].r, 0, Math.PI * 2);
      bgCtx.fillStyle = 'rgba(70,114,162,0.58)';
      bgCtx.fill();
    }

    bgRaf = requestAnimationFrame(drawBg);
  }

  /* ---- Drag state ----------------------------------------- */
  /* drag = { node, offX, offY, startX, startY, moved, page } | null */
  var drag = null;

  function getCanvasPos(e) {
    var b = constellationCanvas.getBoundingClientRect();
    return { x: e.clientX - b.left, y: e.clientY - b.top };
  }

  function onNodePointerDown(e, n, person) {
    if (n.el.classList.contains('dimmed')) return;
    e.preventDefault();
    var pt = getCanvasPos(e);
    drag = {
      node:   n,
      offX:   n.x - pt.x,
      offY:   n.y - pt.y,
      startX: pt.x,
      startY: pt.y,
      moved:  false,
      page:   person.page || null
    };
    n.el.classList.add('dragging');
    n.el.style.zIndex = '10';
    document.addEventListener('pointermove',   onPointerMove);
    document.addEventListener('pointerup',     onPointerUp);
    document.addEventListener('pointercancel', onPointerUp);
  }

  function onPointerMove(e) {
    if (!drag) return;
    var pt  = getCanvasPos(e);
    var ddx = pt.x - drag.startX, ddy = pt.y - drag.startY;
    if (!drag.moved && Math.sqrt(ddx * ddx + ddy * ddy) > 6) drag.moved = true;
    var n = drag.node;
    n.x  = Math.max(MARGIN, Math.min(phyW - MARGIN,     pt.x + drag.offX));
    n.y  = Math.max(MARGIN, Math.min(phyH - MARGIN_BOT, pt.y + drag.offY));
    n.vx = 0; n.vy = 0;
    applyTransform(n);
  }

  function onPointerUp() {
    document.removeEventListener('pointermove',   onPointerMove);
    document.removeEventListener('pointerup',     onPointerUp);
    document.removeEventListener('pointercancel', onPointerUp);
    if (!drag) return;
    var d = drag;
    drag = null;
    d.node.el.classList.remove('dragging');
    d.node.el.style.zIndex = '2';
    d.node.vx = 0; d.node.vy = 0;
    /* Short drag = click → navigate */
    if (!d.moved && d.page) {
      window.location.href = d.page;
      return;
    }
    /* Reheat so the node springs back to its home position */
    alpha = Math.max(alpha, 0.55);
  }

  /* ---- Physics state -------------------------------------- */
  var phyNodes = [];
  var phyW = 0, phyH = 0;
  var alpha = 1.0;
  var phyRaf;

  function startPhysics(nodeObjects, targets) {
    if (phyRaf) cancelAnimationFrame(phyRaf);
    /* Gentle boot: full-strength alpha (1.0) is reserved for reheats
       (resize/drag-release), where a snappy response feels right. On first
       load a softer alpha keeps the initial settle calm instead of punchy. */
    alpha = 0.40;

    /* Build phyNodes — attach drag listener while we have the phyNode ref */
    phyNodes = nodeObjects.map(function (obj, idx) {
      var member = memberData[idx];
      var level  = SENIORITY[member.role] || 4;
      var cgK    = SENIORITY_CGK[Math.min(level - 1, 3)];

      /* Start very close to the target position — nodes should barely need
         to travel to reach home. A small scatter (≈15 % of MIN_GAP) keeps
         neighbouring nodes from starting inside each other's hard-sphere
         radius, which is what caused the abrupt "expulsion" snap on load. */
      var scatterR = MIN_GAP * 0.15;
      var sa = Math.random() * Math.PI * 2;
      var tx = targets[idx].x, ty = targets[idx].y;

      var n = {
        el:          obj.el,
        wrap:        obj.wrap,
        x:           Math.max(MARGIN, Math.min(phyW - MARGIN,     tx + Math.cos(sa) * scatterR)),
        y:           Math.max(MARGIN, Math.min(phyH - MARGIN_BOT, ty + Math.sin(sa) * scatterR)),
        vx:          0,
        vy:          0,
        baseX:       targets[idx].x,
        baseY:       targets[idx].y,
        driftAngle:  Math.random() * Math.PI * 2,
        driftSpeed:  0.0020 + Math.random() * 0.0025,
        driftR:      8 + Math.random() * 7,
        level:       level,
        cgK:         cgK   /* persistent center-gravity constant */
      };

      /* Closure captures the correct n / member per iteration */
      n.el.addEventListener('pointerdown', function (e) {
        onNodePointerDown(e, n, member);
      });

      return n;
    });

    /* Snap to start positions before first paint */
    phyNodes.forEach(function (n) { applyTransform(n); });

    /* Staggered fade-in — nodes materialize like stars appearing rather
       than popping in all at once already fully visible. */
    phyNodes.forEach(function (n) {
      var delay = 40 + Math.random() * 340;
      setTimeout(function () { n.el.style.opacity = '1'; }, delay);
    });

    function loop() {
      /* Alpha decay */
      alpha = Math.max(ALPHA_MIN, alpha * ALPHA_FACTOR);

      var i, j, a, b, dx, dy, d, force, n;
      var dn = drag ? drag.node : null; /* currently dragged node (or null) */

      /* Spring toward drifting target + persistent seniority centre gravity */
      for (i = 0; i < phyNodes.length; i++) {
        n = phyNodes[i];
        if (n === dn) continue; /* dragged node is positioned by the pointer */

        n.driftAngle += n.driftSpeed;
        var dtx = n.baseX + Math.cos(n.driftAngle) * n.driftR;
        var dty = n.baseY + Math.sin(n.driftAngle) * n.driftR;
        n.vx += (dtx - n.x) * SPRING_K * alpha;
        n.vy += (dty - n.y) * SPRING_K * alpha;

        /* Centre gravity — not alpha-scaled; counteracts PhD-node repulsion
           that would otherwise push senior members to the canvas edge. */
        if (n.cgK > 0) {
          n.vx += (phyW / 2 - n.x) * n.cgK;
          n.vy += (phyH / 2 - n.y) * n.cgK;
        }

        n.vx *= (1 - VEL_DECAY);
        n.vy *= (1 - VEL_DECAY);
      }

      /* Repulsion — dragged node pushes others away but is not pushed itself */
      for (i = 0; i < phyNodes.length; i++) {
        for (j = i + 1; j < phyNodes.length; j++) {
          a = phyNodes[i]; b = phyNodes[j];
          dx = b.x - a.x; dy = b.y - a.y;
          d  = Math.sqrt(dx * dx + dy * dy) || 0.1;
          if (d < MIN_GAP) {
            force = ((MIN_GAP - d) / MIN_GAP) * REPULSION_K;
            if (a !== dn) { a.vx -= (dx / d) * force; a.vy -= (dy / d) * force; }
            if (b !== dn) { b.vx += (dx / d) * force; b.vy += (dy / d) * force; }
          }
        }
      }

      /* Integrate + soft boundary */
      for (i = 0; i < phyNodes.length; i++) {
        n = phyNodes[i];
        if (n === dn) continue;
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < MARGIN)            { n.x = MARGIN;            n.vx =  Math.abs(n.vx) * 0.35; }
        if (n.x > phyW - MARGIN)     { n.x = phyW - MARGIN;     n.vx = -Math.abs(n.vx) * 0.35; }
        if (n.y < MARGIN)            { n.y = MARGIN;            n.vy =  Math.abs(n.vy) * 0.35; }
        if (n.y > phyH - MARGIN_BOT) { n.y = phyH - MARGIN_BOT; n.vy = -Math.abs(n.vy) * 0.35; }
      }

      /* Hard-sphere position correction (skip dragged node) */
      for (i = 0; i < phyNodes.length; i++) {
        for (j = i + 1; j < phyNodes.length; j++) {
          a = phyNodes[i]; b = phyNodes[j];
          if (a === dn || b === dn) continue;
          dx = b.x - a.x; dy = b.y - a.y;
          d  = Math.sqrt(dx * dx + dy * dy) || 0.1;
          if (d < NODE_R * 1.9) {
            var push = (NODE_R * 1.9 - d) * 0.5;
            a.x -= (dx / d) * push; a.y -= (dy / d) * push;
            b.x += (dx / d) * push; b.y += (dy / d) * push;
          }
        }
      }

      /* Push DOM transforms */
      for (i = 0; i < phyNodes.length; i++) { applyTransform(phyNodes[i]); }

      phyRaf = requestAnimationFrame(loop);
    }

    phyRaf = requestAnimationFrame(loop);
  }

  function applyTransform(n) {
    var tx = (n.x - NODE_R).toFixed(1);
    var ty = (n.y - NODE_R).toFixed(1);
    n.el.style.transform = 'translate(' + tx + 'px,' + ty + 'px)';
  }

  /* ---- Create DOM node ------------------------------------ */
  function spawnNode(canvas, person) {
    var pTag  = positionTagFor(person.role);
    var rTags = person.tags || [];

    var node = document.createElement('div');
    node.className = 'p-node';
    node.style.width  = nodeSize + 'px';
    node.style.height = nodeSize + 'px';
    node.style.opacity = '0';   /* faded in, staggered, once physics starts */
    node.dataset.researchTags = rTags.join('||');
    node.dataset.positionTag  = pTag || '';

    /* Navigation handled by the drag system: short tap/click → navigate */

    var wrap = document.createElement('div');
    wrap.className  = 'p-node__img-wrap';
    wrap.style.width  = nodeSize + 'px';
    wrap.style.height = nodeSize + 'px';

    var img = document.createElement('img');
    img.className = 'p-node__img';
    img.src = person.photo;
    img.alt = person.name;

    var overlay = document.createElement('div');
    overlay.className = 'p-node__overlay';

    /* Permanent name + role label below the circle */
    var label = document.createElement('div');
    label.className = 'p-node__label';
    label.innerHTML =
      '<span class="p-node__label-name">' + person.name + '</span>' +
      '<span class="p-node__label-role">' + person.role + '</span>';

    wrap.appendChild(img);
    wrap.appendChild(overlay);
    node.appendChild(wrap);
    node.appendChild(label);
    canvas.appendChild(node);

    return { el: node, wrap: wrap, tags: rTags, posTag: pTag };
  }

  /* ---- Tag filter panel ----------------------------------- */
  var activeTags = {};

  function buildTagPanel() {
    var posList  = document.getElementById('position-tags');
    var resList  = document.getElementById('research-tags');
    var clearBtn = document.getElementById('tag-clear');
    if (!posList || !resList) return;

    POSITION_TAGS.forEach(function (t) { posList.appendChild(makeBtn(t, 'position')); });
    RESEARCH_TAGS.forEach(function (t) { resList.appendChild(makeBtn(t, 'research')); });

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
      if (activeTags[tag]) { delete activeTags[tag]; btn.classList.remove('active'); }
      else                  { activeTags[tag] = true;  btn.classList.add('active');    }
      applyFilter();
      var cb = document.getElementById('tag-clear');
      if (cb) cb.classList.toggle('visible', Object.keys(activeTags).length > 0);
    });
    return btn;
  }

  function applyFilter() {
    var keys  = Object.keys(activeTags);
    var nodes = document.querySelectorAll('.p-node');
    for (var i = 0; i < nodes.length; i++) {
      var node  = nodes[i];
      if (!keys.length) { node.classList.remove('dimmed'); continue; }
      var rTags = node.dataset.researchTags ? node.dataset.researchTags.split('||') : [];
      var pTag  = node.dataset.positionTag;
      var all   = pTag ? rTags.concat([pTag]) : rTags;
      var match = keys.every(function (k) { return all.indexOf(k) !== -1; });
      node.classList.toggle('dimmed', !match);
    }
  }

  /* ---- Mobile research filter collapse -------------------- */
  function initMobileFilters() {
    var toggle = document.getElementById('research-toggle');
    var tags   = document.getElementById('research-tags');
    if (!toggle || !tags) return;

    function isMobile() { return window.innerWidth <= 767; }

    if (isMobile()) {
      tags.classList.add('collapsed');
      toggle.setAttribute('aria-expanded', 'false');
    }

    toggle.addEventListener('click', function () {
      if (!isMobile()) return;
      var isCollapsed = tags.classList.toggle('collapsed');
      toggle.setAttribute('aria-expanded', String(!isCollapsed));
      var chevron = toggle.querySelector('.research-toggle__chevron');
      if (chevron) chevron.style.transform = isCollapsed ? '' : 'rotate(180deg)';
    });
  }

  /* ---- Resize handling ------------------------------------ */
  var resizeTimer;
  var constellationCanvas;
  var bgCanvasEl;
  var memberData;

  function onResize() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(doResize, 280);
  }

  function doResize() {
    if (!constellationCanvas || !memberData) return;

    nodeSize   = computeNodeSize();
    NODE_R     = nodeSize / 2;
    MIN_GAP    = NODE_R * 2 + Math.round(nodeSize * 0.28) + 26;
    MARGIN     = NODE_R + 20;
    MARGIN_BOT = NODE_R + 45;

    phyNodes.forEach(function (n) {
      n.el.style.width  = nodeSize + 'px';
      n.el.style.height = nodeSize + 'px';
      n.wrap.style.width  = nodeSize + 'px';
      n.wrap.style.height = nodeSize + 'px';
    });

    var nav    = document.querySelector('.nav');
    var intro  = document.querySelector('.team-intro');
    var navH   = nav   ? nav.offsetHeight   : 64;
    var introH = intro ? intro.offsetHeight : 0;
    var canvasH = Math.max(window.innerHeight - navH - introH, 680);
    constellationCanvas.style.height = canvasH + 'px';

    phyW = constellationCanvas.offsetWidth;
    phyH = constellationCanvas.offsetHeight;

    if (bgCanvasEl) resizeBgCanvas(bgCanvasEl, phyW, phyH);

    var targets = computeTargets(memberData, phyW, phyH);
    phyNodes.forEach(function (n, idx) {
      n.baseX = targets[idx].x;
      n.baseY = targets[idx].y;
    });

    alpha = Math.max(alpha, 0.50);
  }

  /* ---- Boot ---------------------------------------------- */
  function init() {
    constellationCanvas = document.getElementById('constellation');
    if (!constellationCanvas || typeof people === 'undefined') return;

    memberData = people.current;

    nodeSize   = computeNodeSize();
    NODE_R     = nodeSize / 2;
    MIN_GAP    = NODE_R * 2 + Math.round(nodeSize * 0.28) + 26;
    MARGIN     = NODE_R + 20;
    MARGIN_BOT = NODE_R + 45;

    var nav    = document.querySelector('.nav');
    var intro  = document.querySelector('.team-intro');
    var navH   = nav   ? nav.offsetHeight   : 64;
    var introH = intro ? intro.offsetHeight : 0;
    var canvasH = Math.max(window.innerHeight - navH - introH, 680);
    constellationCanvas.style.height = canvasH + 'px';

    buildTagPanel();
    initMobileFilters();
    window.addEventListener('resize', onResize);

    setTimeout(function () {
      phyW = constellationCanvas.offsetWidth;
      phyH = constellationCanvas.offsetHeight;

      bgCanvasEl = document.getElementById('bg-canvas');
      if (bgCanvasEl) initBgCanvas(bgCanvasEl, phyW, phyH);

      var nodeObjects = memberData.map(function (person) {
        return spawnNode(constellationCanvas, person);
      });

      var targets = computeTargets(memberData, phyW, phyH);
      startPhysics(nodeObjects, targets);
    }, 60);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
