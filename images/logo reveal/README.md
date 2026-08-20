# Logo reveal — integration guide

## Files (drop the whole `handoff/` folder into your project, e.g. `public/logo-reveal/`)
- `logo-reveal.js` — the animation, plain ES module, zero dependencies
- `logo.svg`, `house.png`, `channel-mask.png`, `river-mask.png` — required assets, must sit next to the JS file (or point `assetsPath` at wherever you put them)

## Usage

```html
<div id="logo-reveal" style="width:366px; aspect-ratio:731/600;"></div>
<script type="module">
  import { mountLogoReveal } from '/logo-reveal/logo-reveal.js';
  mountLogoReveal(document.getElementById('logo-reveal'));
</script>
```

React / Next.js:

```jsx
useEffect(() => {
  let handle;
  import('/logo-reveal/logo-reveal.js').then(({ mountLogoReveal }) => {
    handle = mountLogoReveal(ref.current, { showName: false });
  });
  return () => handle?.destroy();
}, []);
```

## Options (second argument, all optional)
- `showName` (bool, default `true`) — draw "AMSTERDAM EMOTIONAL MEMORY LAB" under the house. Set `false` for a mark-only version (e.g. next to a text logotype in the nav).
- `riverTint` (CSS color, default `'#cfe1ec'`) — the water fill color.
- `loop` (bool, default `true`) — keep the ambient river flow animating forever after the reveal. Set `false` to freeze on the last frame once the reveal completes.
- `assetsPath` (string) — folder holding the 4 asset files, if not alongside the JS.
- `reducedMotion` (bool) — forces the finished state with no animation. Defaults to following the user's OS `prefers-reduced-motion` setting — you normally don't need to pass this.

Returns `{ destroy() }` — call it on unmount/route change to stop the animation loop and clear the DOM node.

## Behavior notes for whoever wires this in
- The element resolves its own size from `host`'s CSS width/height — set both (or an aspect-ratio) on the container; the SVG scales to fill it.
- Runs once through the reveal (house rises → river carves in → name draws, if enabled) then holds in a continuous ambient flow loop.
- With `showName: false`, the river's ambient flow ramps in right after the river finishes carving in (no name-progress gate to wait on).
- Safe to mount more than one instance on a page — each gets unique internal IDs.
- No animation runs at all if the user has reduced-motion enabled; it just shows the finished mark.
