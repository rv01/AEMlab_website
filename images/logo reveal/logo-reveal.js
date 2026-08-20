/* Amsterdam Emotional Memory Lab — logo reveal, vanilla JS (no React/build step).
   Usage:
     <div id="logo-reveal" style="width:366px;height:300px"></div>
     <script type="module">
       import { mountLogoReveal } from './logo-reveal.js';
       mountLogoReveal(document.getElementById('logo-reveal'), { showName: true });
     </script>
   Assets required next to this file: logo.svg, house.png, channel-mask.png, river-mask.png */

const NAVY = '#07162c', WHITE = '#ffffff';
const SVG_VB = '0 0 500.03 410.34';
const SNS = 'http://www.w3.org/2000/svg';
const el = (tag, attrs) => { const n = document.createElementNS(SNS, tag); for (const k in attrs || {}) n.setAttribute(k, attrs[k]); return n; };
const clamp01 = x => x < 0 ? 0 : x > 1 ? 1 : x;
const easeIO = x => 0.5 - 0.5 * Math.cos(Math.PI * clamp01(x));

// Timings (seconds). With showName:false the Name phase is skipped — River hands off
// straight to ambient Flow.
const DUR = { house: 0.9, river: 1.5, name: 2.0 };

const TICK_CFG = {
  'M221.47,': { dir: [-0.55, 0.84], phase: 0.0, g: 0.00 },
  'M73.36,':  { dir: [0.30, 0.95],  phase: 2.1, g: 0.33 },
  'M142.35,': { dir: [-0.50, 0.87], phase: 4.2, g: 0.66 },
};

let _assetsP = null;
function loadAssets(baseUrl) {
  if (_assetsP) return _assetsP;
  const abs = p => new URL(p, baseUrl).href;
  _assetsP = Promise.all([
    fetch(abs('logo.svg')).then(r => r.text()),
    fetch(abs('house.png')).then(r => r.blob()),
    fetch(abs('channel-mask.png')).then(r => r.blob()),
    fetch(abs('river-mask.png')).then(r => r.blob()),
  ]).then(([svgText, houseB, chanB, riverB]) =>
    Promise.all([houseB, chanB, riverB].map(b => new Promise(res => {
      const fr = new FileReader(); fr.onload = () => res(fr.result); fr.readAsDataURL(b);
    }))).then(([housePng, channelPng, riverPng]) => ({ svgText, housePng, channelPng, riverPng }))
  );
  return _assetsP;
}

function buildLogo(host, assets, riverTint) {
  const uid = 'lg' + Math.floor(Math.random() * 1e9);
  const doc = new DOMParser().parseFromString(assets.svgText, 'image/svg+xml');
  const out = el('svg', { viewBox: SVG_VB });
  out.style.cssText = 'width:100%;height:100%;display:block;overflow:visible';
  host.appendChild(out);

  const shapes = [...doc.querySelectorAll('path,polygon,rect')].map(n => document.importNode(n, true));
  const tmp = el('g'); shapes.forEach(s => tmp.appendChild(s)); out.appendChild(tmp);
  const items = shapes.map(s => {
    let b = { x: 0, y: 0, width: 0, height: 0 };
    try { b = s.getBBox(); } catch (e) {}
    return { el: s, b };
  });
  out.removeChild(tmp);

  const defs = el('defs');
  const gUp = el('linearGradient', { id: uid + 'Up', gradientUnits: 'userSpaceOnUse', x1: 0, y1: 0, x2: 0, y2: 40 });
  gUp.appendChild(el('stop', { offset: 0, 'stop-color': '#fff', 'stop-opacity': 1 }));
  gUp.appendChild(el('stop', { offset: 1, 'stop-color': '#fff', 'stop-opacity': 0 }));
  defs.appendChild(gUp);

  const clipRiver = el('clipPath', { id: uid + 'R' });
  const clipRect = el('rect', { x: -30, y: -80, width: 600, height: 0 });
  clipRiver.appendChild(clipRect);

  const maskPatch = el('mask', { id: uid + 'P', maskUnits: 'userSpaceOnUse', x: -30, y: -80, width: 600, height: 560 });
  const rectC = el('rect', { x: -20, y: -80, width: 580, height: 560, fill: `url(#${uid}Up)` });
  const carveG = el('g', { 'clip-path': `url(#${uid}R)` });
  const carveImg = el('image', { x: 0, y: 0, width: 290.81, height: 401.06, preserveAspectRatio: 'none' });
  carveImg.setAttribute('href', assets.channelPng);
  carveImg.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', assets.channelPng);
  carveG.appendChild(carveImg);
  maskPatch.append(rectC, carveG);

  const invF = el('filter', { id: uid + 'I', x: '-10%', y: '-10%', width: '120%', height: '120%', 'color-interpolation-filters': 'sRGB' });
  invF.appendChild(el('feColorMatrix', { type: 'matrix', values: '-1 0 0 0 1  0 -1 0 0 1  0 0 -1 0 1  0 0 0 1 0' }));
  const maskChan = el('mask', { id: uid + 'C', maskUnits: 'userSpaceOnUse', x: -30, y: -80, width: 600, height: 560 });
  const chanImg = el('image', { x: 0, y: 0, width: 290.81, height: 401.06, preserveAspectRatio: 'none', filter: `url(#${uid}I)` });
  chanImg.setAttribute('href', assets.riverPng);
  chanImg.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', assets.riverPng);
  maskChan.appendChild(chanImg);
  defs.append(invF, maskChan);

  const clipBottom = el('clipPath', { id: uid + 'B' });
  clipBottom.appendChild(el('rect', { x: -30, y: -80, width: 600, height: 479 }));
  defs.append(clipRiver, maskPatch, clipBottom);
  out.appendChild(defs);

  const isText = it => it.b.x > 195 && it.b.y > 225 && it.b.width < 60;
  const tickKey = it => { const d = it.el.getAttribute('d') || ''; return Object.keys(TICK_CFG).find(p => d.startsWith(p)); };

  items.forEach(it => {
    const c = it.el.getAttribute('class') || '';
    it.el.removeAttribute('class');
    const white = /cls-[13]/.test(c);
    if ((it.el.getAttribute('d') || '').startsWith('M193.39,161.53')) { it.el.setAttribute('fill', 'none'); return; }
    if (isText(it)) { it.el.setAttribute('fill', white ? 'none' : NAVY); it.navy = !white; }
    else it.el.setAttribute('fill', white ? WHITE : NAVY);
  });

  const gArt = el('g', { 'clip-path': `url(#${uid}R)` });
  const ticks = [];
  items.filter(it => !isText(it)).forEach(it => {
    const tk = tickKey(it);
    if (tk) {
      const wrap = el('g'); wrap.appendChild(it.el);
      const ghost = it.el.cloneNode(true);
      const gwrap = el('g', { opacity: 0 }); gwrap.appendChild(ghost);
      gArt.append(wrap, gwrap);
      ticks.push({ wrap, gwrap, cfg: TICK_CFG[tk] });
    } else gArt.appendChild(it.el);
  });

  const gTint = el('g', { 'clip-path': `url(#${uid}R)` });
  const tintRect = el('rect', { x: -20, y: -80, width: 580, height: 560, mask: `url(#${uid}C)`, fill: riverTint, 'fill-opacity': 0.85 });
  gTint.appendChild(tintRect);

  const gPatch = el('g', { mask: `url(#${uid}P)` });
  const houseImg = el('image', { x: 0, y: 0, width: 290.81, height: 401.06, preserveAspectRatio: 'none' });
  houseImg.setAttribute('href', assets.housePng);
  houseImg.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', assets.housePng);
  gPatch.appendChild(houseImg);

  const gText = el('g');
  const letters = items.filter(isText).map(it => ({ ...it, line: it.b.y < 280 ? 0 : (it.b.y < 345 ? 1 : 2) }))
    .sort((a, b) => a.line - b.line || a.b.x - b.b.x);
  letters.forEach(L => {
    let len = 40; try { len = L.el.getTotalLength(); } catch (e) {}
    L.len = len;
    L.el.setAttribute('stroke', NAVY);
    L.el.setAttribute('stroke-width', '0.9');
    L.el.setAttribute('stroke-linejoin', 'round');
    L.el.setAttribute('stroke-dasharray', len + ' ' + len);
    L.el.setAttribute('stroke-dashoffset', len);
    L.el.setAttribute('stroke-opacity', '0');
    if (L.navy) L.el.setAttribute('fill-opacity', '0');
    const wrap = el('g'); wrap.appendChild(L.el); gText.appendChild(wrap); L.wrap = wrap;
  });

  const gHouse = el('g', { 'clip-path': `url(#${uid}B)` });
  gHouse.append(gPatch, gTint, gArt);
  out.append(gHouse, gText);

  function update({ h, r, t, amb, flowT, showName }) {
    gText.style.display = showName ? '' : 'none';
    const yF = 420 - h * 490;
    gUp.setAttribute('y1', yF); gUp.setAttribute('y2', yF - 44);
    const edge = -70 + r * 500;
    clipRect.setAttribute('height', Math.max(0, edge + 80));
    tintRect.setAttribute('fill', riverTint);
    if (showName) {
      const N = letters.length || 1;
      letters.forEach((L, i) => {
        const p = clamp01((t - 0.62 * i / N) / 0.36), q = easeIO(p);
        L.el.setAttribute('stroke-dashoffset', (L.len * (1 - q)).toFixed(2));
        L.el.setAttribute('stroke-opacity', p <= 0 ? '0' : (p > 0.85 ? (1 - (p - 0.85) / 0.15).toFixed(3) : '1'));
        if (L.navy) L.el.setAttribute('fill-opacity', clamp01((p - 0.6) / 0.4).toFixed(3));
        L.wrap.setAttribute('transform', `translate(0 ${((1 - q) * 4).toFixed(2)})`);
      });
    }
    const P = 4, w = 2 * Math.PI * flowT / P;
    ticks.forEach(T => {
      const s = Math.sin(w + T.cfg.phase) * 3.4 * amb;
      T.wrap.setAttribute('transform', `translate(${(T.cfg.dir[0] * s).toFixed(2)} ${(T.cfg.dir[1] * s).toFixed(2)})`);
      const pr = ((flowT / P + T.cfg.g) % 1 + 1) % 1;
      T.gwrap.setAttribute('transform', `translate(${(T.cfg.dir[0] * (pr * 22 - 11)).toFixed(2)} ${(T.cfg.dir[1] * (pr * 22 - 11)).toFixed(2)})`);
      T.gwrap.setAttribute('opacity', (Math.sin(Math.PI * pr) * 0.6 * amb).toFixed(3));
    });
  }
  return { update };
}

/**
 * Mount the logo reveal into `host`.
 * options:
 *   showName   {boolean} draw the lab name under the house. Default true.
 *   riverTint  {string}  CSS color for the water fill. Default '#cfe1ec'.
 *   loop       {boolean} keep the ambient flow animating forever. Default true.
 *   assetsPath {string}  folder containing logo.svg/house.png/channel-mask.png/river-mask.png.
 *                        Default: same folder as this script.
 *   reducedMotion {boolean} skip straight to the finished, flowing state. Default:
 *                        follows prefers-reduced-motion media query.
 * Returns { destroy() } to stop the rAF loop and remove the DOM.
 */
export function mountLogoReveal(host, options = {}) {
  const showName = options.showName !== false;
  const riverTint = options.riverTint || '#cfe1ec';
  const loop = options.loop !== false;
  const assetsPath = options.assetsPath || new URL('.', import.meta.url).href;
  const reduced = options.reducedMotion ?? window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let api = null, raf = null, destroyed = false;
  const nameDur = showName ? DUR.name : 0;
  const total = DUR.house + DUR.river + nameDur;
  let t0 = null;

  loadAssets(assetsPath).then(assets => {
    if (destroyed) return;
    api = buildLogo(host, assets, riverTint);
    if (reduced) { api.update({ h: 1, r: 1, t: 1, amb: 1, flowT: 0, showName }); return; }
    const frame = now => {
      if (destroyed) return;
      if (t0 === null) t0 = now;
      const elapsed = (now - t0) / 1000;
      const tt = loop ? elapsed : Math.min(elapsed, total + 999);
      let h, r, t, amb, flowT;
      if (tt < DUR.house) {
        h = tt / DUR.house; r = 0; t = 0; amb = 0; flowT = 0;
      } else if (tt < DUR.house + DUR.river) {
        h = 1; r = easeIO((tt - DUR.house) / DUR.river); t = 0; amb = 0; flowT = 0;
      } else if (showName && tt < DUR.house + DUR.river + DUR.name) {
        const lt = tt - DUR.house - DUR.river;
        h = 1; r = 1; t = lt / DUR.name;
        amb = easeIO(clamp01((t - 0.3) / 0.7));
        flowT = lt;
      } else {
        const flowStart = DUR.house + DUR.river + nameDur;
        h = 1; r = 1; t = 1; amb = 1; flowT = tt - flowStart + nameDur;
      }
      api.update({ h, r, t, amb, flowT, showName });
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
  });

  return { destroy() { destroyed = true; if (raf) cancelAnimationFrame(raf); host.innerHTML = ''; } };
}
