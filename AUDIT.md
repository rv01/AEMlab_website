# AEM Lab site — design audit

Two passes, as requested. Pass 1 hunts generic AI-design tells; pass 2 looks only at
interaction, motion and typographic craft.

---

## Implementation status — updated 19 August 2026

**All four tiers are done, with one exception noted under C3 below.** Everything from
here to the end of the file is the original audit and describes the site *before* these
changes.

### Tier 4

| # | Finding | Status |
|---|---|---|
| M1 | Constellation throws the gesture away | **Done** — release velocity is measured over the last 100ms of the gesture and handed to the physics instead of zeroed, so a flicked portrait keeps travelling and the spring catches it mid-flight. The hard `Math.max/min` walls are gone: dragging past the edge now rubber-bands (Apple's curve, asymptotic at 46px) and a thrown node decelerates into the edge and turns around. No momentum under `prefers-reduced-motion` — a 170px portrait coasting 200px is exactly the travel that setting asks us to drop — but the drag and the spring-back stay. `pointercancel` is now separate from `pointerup`: a gesture taken away is not a gesture released, so it inherits nothing |
| M7 | Accordion took ~0.8–1.35s to become readable | **Rejected, reverted.** The speed-up was tried and it read as worse, not faster: the arrival stopped feeling like moving to another page, and with the width and the panel on the same clock the question reflowed *while* the body text was fading in, so the words moved as you started reading them. The original choreography is back exactly as it was — width 520ms, panel after 280ms, text after 420ms, and 150ms + 380ms on arrival — which is what makes the card stop resizing before there is anything to read beside it. Measured after the revert: 493→642ms on a click, 974→1123ms on arrival, matching the numbers in this audit. The one thing kept from the attempt is a guard that cancels a pending arrival expand when you click something else; it changes no timing, it only stops a stale timer re-opening the card you just left |
| B7 | `.reveal` starts invisible with no failure path | **Done** — the hiding rules are now written as `.js .reveal`, and a small inline gate in each page's `<head>` decides whether that class is set. Four paths verified in Chromium: no JavaScript (never set), broken `main.js` (a 2.5s timer takes it back off — confirmed by aborting the request), automated browsers (`navigator.webdriver`: screenshot services, preview crawlers and Lighthouse get the page with nothing hidden), and print (`@media print`). `media.html` has no static `.reveal`, so `js/media.js` arms the gate there instead of `main.js` |
| A4 | Three identical icon-topped feature cards | **Partly rejected.** A lead-card composition (question 1 spanning both columns as icon / question / answer, the other two paired beneath) was built and turned down — the three questions are meant to read as parallel, and ranking them visually says something about the lab's work that isn't true. The `repeat(3, 1fr)` grid, the centred icons and titles and the equal card weight are all back as they were. **What stays:** "Explore this question" ×3 is gone. The whole card is already a link, so the label was a second call to action for the same click, and identical wording on all three said nothing about where any one of them went. The footer row it sat in stays — `margin-top: auto` is what keeps the three arrows on one line — with just the arrow in it |
| C3 | Template leftovers | **Partly done — see below.** The empty `.profile-body` rule is gone. The vendor stack is not, and the reason matters |

**C3 has changed since the audit was written.** `js/skel.min.js`, `skel-layers.min.js`,
`jquery.min.js`, `jquery.dropotron.min.js`, `init.js` and the five `css/style-*.css`
breakpoint files are no longer referenced by nothing — the sixteen `pages/alumni/*.html`
added in `1d018f8` all load them, as does `photos.html`. Deleting them would break
seventeen pages, so I have left them alone.

The larger finding underneath that: **all sixteen alumni pages currently render as blank
white pages.** They open with `<style>html{visibility:hidden;opacity:0}</style>`, which the
template's stylesheet was meant to override — but `js/init.js` asks skel for
`css/style.css`, resolved relative to the *document*, which from `pages/alumni/` is
`pages/alumni/css/style.css` and 404s. Nothing ever makes the page visible. Confirmed in
Chromium: two 404s, zero applied stylesheets, a white viewport. They are also unreachable
from the site — `data/people.js` lists them but `js/people.js` never renders the alumni
array, so only a direct URL or a search result gets you there.

That is a content decision rather than housekeeping (rebuild them on the current profile
template, redirect them, or delete them and the `alumni` array with them), so it is left
for you. Whichever way it goes, the vendor stack goes with it.

| # | Finding | Status |
|---|---|---|
| M6 | Same fade-up on everything | **Done** — reveal travel 24px → 10px on the site's own curve; the three homepage cards now stagger individually (90ms apart) instead of the grid fading as one block |
| M8 | Tracking and leading | **Done** — size-specific negative tracking on display headings; `h1`–`h4` leading is now 1.08 / 1.16 / 1.25 / 1.32 instead of a flat 1.20 across a 2.2x size range |
| M4 | No reduced-motion handling | **Done** — one media block in `style.css`, plus `js/people.js` now kills the constellation's idle drift, draws the particle field as a single static frame, and parks the physics loop once settled (a `reheat()` helper restarts it on drag, resize or filter) |
| B2 | Watermark numerals | **Done** — removed from profile pages (it numbered a list of at most two); kept on `media.html`, where it marks the start of a year and counts something real |
| B5 | 140px contact icons | **Done** — icon column 1fr → 200px, glyphs 140px → 92px, and the panel measure tightened 1400px → 1040px, which was the actual cause of the void between icon and copy |
| C1 | Collapsed-card dead padding | **Done** — padding moved off the element the grid collapses to `0fr` and onto its children |
| C2 | Chevron over the numeral | **Done** — numeral moved clear of the chevron's 2rem + 18px footprint |

### Tiers 1–2

| # | Finding | Status |
|---|---|---|
| A5 | Second typeface + phantom `600` weight | **Done, then revised** — Source Serif 4 was rejected as dated; now **Archivo**, a grotesque paired against DM Sans's geometric forms, using its width axis at 106%. Both faces load as variable fonts, so 600 is a real weight |
| M2 | Press feedback | **Done** — 1 `:active` rule → 20, in three response classes (small controls dip, large bars darken, inline links fade) |
| M3 | Keyboard focus | **Done** — 1 `:focus-visible` rule → site-wide, with the ring colour inherited per surface |
| A1 | Lab name repeated three times | **Done** — banner subtitle removed from all 5 interior pages |
| A2 | Affiliation twice per profile | **Done** — removed from all 12 profile pages and its CSS rule |
| A6 | LinkedIn placeholder | **Done, then revised** — the feed slot is back with a real empty state; see the note below |
| A3 | All-caps micro-labels | **Done** — 13 uppercase rules → 4 (nav ×2, media date stamp, outlet mark) |
| B1 | Red left stripe on 7 components | **Done** — now on 4: the two card types (identity) and the address panel + year headers (region) |
| B3 | Pill saturation | **Done** — publications rows went from up to 6 chips in 3 shapes to 1 mark + a line of text; `.rq-card__papers-heading` is a heading again |
| M5 | Motion vocabulary | **Done** — 17 durations + 4 curves → 3 duration tokens + 3 curves; one raw value left, a deliberate sequencing delay |
| C4 | Render-blocking `@import` | **Done incidentally** — adding a second family via `@import` would have made first paint worse, so both faces load via `<link>` + `preconnect` |

**Two things worth your attention:**

1. **The footer LinkedIn URL was wrong on all 18 pages.** It pointed at
   `linkedin.com/company/amsterdam-emotional-memory-lab/`, which is not the page you gave me.
   All 18 now point at `linkedin.com/in/amsterdam-emotional-memory-lab-83078542a/`. Please
   confirm that is the right target — if a separate company page also exists, the footer may
   want that one instead.
2. **The LinkedIn feed is a real slot with a real empty state.** "Latest from the Lab" is back
   as a heading, and the container shows **"No posts yet."** plus a follow link until an embed
   is configured. To switch the feed on, put the embed URL in `data-embed` on
   `#linkedin-feed` in `index.html` — the iframe replaces the empty state automatically and
   nothing else needs changing.

   **Two constraints worth knowing.** First, LinkedIn only issues embed URLs for *company*
   pages; the lab's current URL is a personal-profile (`/in/`) one, which has no official
   embed, so the page would need to become a company page for a feed to exist at all. Second,
   the embed is a cross-origin iframe, so nothing on the site can read inside it to count
   posts — "No posts yet" is driven by whether an embed is configured, not by inspecting the
   feed. In practice: leave `data-embed` empty until there are posts, then fill it in.

**Two of the five were tried and turned down** — the accordion speed-up (M7) and the
homepage lead-card composition (A4). Both are reverted; the notes in the table say what
was wrong with each, so neither gets proposed again. The catalog reading behind them still
stands (three equal cards *is* the L2 layout, the delay chain *is* nearly a second), but on
this site the composition is carrying a claim about the work — the three questions are
parallel — and the delays are carrying a sense of place. Both outrank the pattern.

**Context applied:** academic lab site. Credibility and clarity over "wow". Findings that
would suit a SaaS landing page but not a research group have been dropped rather than listed.

**How this was checked:** all six top-level pages plus a profile page were rendered headless
at 1440×1000 (Chromium via Playwright, served over HTTP so the ES-module logo and `fetch`ed
assets actually run), alongside a full read of `css/*.css`, `js/*.js` and the page HTML.
Findings are tagged **[render]** (seen in pixels), **[code]** (certain from source), or
**[both]**.

**Overall:** this is not a generic site. The constellation team page, the logo pill, the
alternating full-bleed bands and the hand-drawn SVG icons are real decisions, and none of the
classic P0 memes are present — no purple gradient, no Inter, no glassmorphism-everywhere, no
bento grid, no stock icon set, no invented stats. What *does* read as machine-made is
narrower and fixable: **a small motif vocabulary applied to everything, text that repeats
itself, and interaction states that were never built.** Roughly: the visual design is
80% there, the interaction layer is 40% there.

---

# Pass 1 — AI-design tells

## HIGH

### A1 · The lab's name is printed three times before any content [both]

On `research.html`, in the first 280 vertical pixels, the reader is told the lab's name by
the nav wordmark, then again by the banner subtitle, then again by the footer — plus
"University of Amsterdam" twice.

| Where | File |
|---|---|
| Nav wordmark | `css/style.css:119` + every page's `.nav__brand-text` |
| Banner subtitle | `research.html:56`, `people.html:55`, `publications.html:56`, `media.html:55`, `contact.html:55` — all the literal string "Amsterdam Emotional Memory Lab" |
| Footer | every page, `<p>&copy; … Amsterdam Emotional Memory Lab</p>` + `<p>Department of Clinical Psychology — University of Amsterdam</p>` |

This is the site's single most template-shaped feature: a subtitle slot that exists because
the banner component has a subtitle slot, filled with the one string the reader already knows.
On `index.html:63` it at least varies ("University of Amsterdam") — but that page's *title*
is the lab name, so the pairing is still name-then-name.

**The tell:** a human writing these pages would not caption "Publications" with the name of
the site they are already on.

### A2 · Every profile states the same affiliation twice on the same page [both]

`pages/*.html:64` hardcodes `Department of Clinical Psychology — University of Amsterdam`
into all 12 profile pages, and the footer of those same 12 files repeats the identical string
~1200px lower. Everyone in the lab shares this affiliation, so under an individual name it
carries no information at all — it's the "UNIVERSITY OF AMSTERDAM · CLINICAL PSYCHOLOGY"
pattern you flagged.

Confirmed in the render (`pages/Merel.html`): the line appears at y≈270 and again at y≈1273.

### A3 · All-caps letterspaced micro-labels are the site's default text treatment [both]

Thirteen separate rules set `text-transform: uppercase` with a `letter-spacing` between
0.04em and 0.14em:

`css/style.css` — nav links (:138), mobile nav (:191), `.banner__sub` (:243), `.card__link` (:407)
`css/people.css` — filter section labels (:47), `.profile-back` (:310), `.profile-section h2` (:445)
`css/research.css` — `.rq-card__papers-heading` (:198), `.rq-card__papers-cta` (:258)
`css/contact.css` — `.contact-cta` (:66), `.contact-address__sublabel` (:150)
`css/media.css` — `.media-entry__label` (:106), `.media-entry__outlet-mark` (:212)

Nav genuinely benefits. The rest are catalog item **T5** — the "dark SaaS eyebrow" reflex,
applied to every small piece of text on the site regardless of role. Note this is the same
issue as your recorded feedback about *"too many different things going on in terms of
colors/widths/fonts/uppercase versus normal"* — that fix was applied locally to the team
intro, but the pattern is still site-wide.

**Worth keeping:** the nav, and arguably `.media-entry__label` (a date/outlet stamp is a
genuine caption). **Worth dropping to sentence case:** `.banner__sub`, `.card__link`,
`.profile-back`, `.rq-card__papers-heading`, `.contact-cta`, `.profile-section h2`.

### A4 · Three identical icon-topped feature cards on the homepage [both]

`index.html:98–175`. This is catalog **L2**, the most recognizable AI-layout cliché there is,
and here it arrives fully loaded:

- three equal-width, equal-height cards in a `repeat(3, 1fr)` grid
- a centered icon at the top of each
- identical CTA copy — "Explore this question" — repeated verbatim three times (`:120`, `:143`, `:168`)
- an arrow SVG stapled to each CTA (catalog **CP3**)
- a red left stripe on each (catalog **K4**)
- centered `.card__title` sitting over left-aligned `.card__body` — an alignment inconsistency
  *inside* the same card, visible in the render

**Important caveat:** the icons themselves are custom-drawn and genuinely good — a diamond
with crosshairs, concentric ripples, two offset frames. They are not Lucide, not generic.
The problem is the container, not the contents. The fix is compositional (break the 3×1
symmetry, vary card weight so the reader is told which question matters most), not "delete
the cards".

### A5 · One typeface doing all the work — and one weight that never loads [code]

`css/style.css:5` imports DM Sans at weights 300, 400, 500, 700. Then:

- **Five rules ask for `font-weight: 600`** — `people.css:82` (`.tag-btn`), `people.css:327`
  (`.profile-role`), `people.css:349` (`.profile-link`), `publications.css:249`
  (`.pub-item__preprint`), `publications.css:269` (`.pub-tag`). I fetched the live Google
  stylesheet: it serves four discrete static faces and **no 600**. CSS weight matching walks
  upward first, so all five silently render at **700**. Semibold was intended; bold is shipping.
- **Weight 300 is downloaded on every page load and used by zero rules.**
- Every heading, label, body paragraph and nav item is the same face. Hierarchy is carried
  entirely by size, caps and colour.

This is the largest single contributor to the "looks HTML-like" feeling. It is also the
cheapest thing on this list to fix well, and the least risky: a second face used *only* for
`h1`/`h2`/`.banner__title`/`.profile-name` would change the site's character more than any
other single edit here, without touching a line of layout.

### A6 · A construction note is live on the homepage [both]

`index.html:182–205` renders a dashed-border box reading *"LinkedIn feed will be embedded
here — link to paste embed code"*, with `href="#"`, under the heading "Latest from the Lab".
Catalog **IM4**. It occupies a full `5rem`-padded section between the cards and the footer.

Either embed the feed, or cut the section until the embed exists. A visible placeholder on a
research group's homepage costs more credibility than a missing section does.

---

## MEDIUM

### B1 · One motif, seven components: the red left stripe [both]

| Component | Location |
|---|---|
| `.card` (home) | `css/style.css:364` — 3px |
| `.rq-card` | `css/research.css:51` — 3px |
| `.profile-section::before` | `css/people.css:380–388` — 4px |
| `.media-entry::before` | `css/media.css:28–36` — 4px |
| `.contact-address__info::before` | `css/contact.css:97–105` — 4px |
| `.year-header::before` | `css/publications.css:82–90` — 4px |
| `.pub-item:hover` | `css/publications.css:188` — 3px |

The catalog is blunt about this one (**K4**): *"colored left borders are almost as reliable a
sign of AI-generated design as em-dashes are for text."* One or two instances read as a house
device. Seven reads as the only idea available — which is exactly the "consistent or just
lazy?" question you raised.

**Suggestion:** keep it where it separates a *region* (the navy address panel, the year
headers). Drop it from the repeating content units (`.media-entry`, `.profile-section`,
`.pub-item:hover`), where it fires dozens of times per page and stops meaning anything.

### B2 · The giant faint watermark numeral, three components [both]

`.profile-section::after` (`people.css:391–407`), `.media-entry__watermark`
(`media.css:42–57`), `.rq-card__num` (`research.css:74–91`) — same treatment, same opacity
band (0.045–0.09), same edge placement.

On profile pages it's weakest: `js/profile.js:28–29` emits at most two sections ("Research
Interests", "Background"), so "01" numbers a list that will never reach "03". In the render
it sits alone in roughly 700px of otherwise empty left column while the prose is jammed into
the right half. A number that never counts to anything is decoration wearing structure's
clothes.

On `media.html` it works — it marks where a year begins, which is real information. Keep it
there.

### B3 · Pill saturation, and pills where nothing is clickable [both]

Your instinct was right; the render confirms it.

- **`publications.html`**: 15 filter pills across three rows, plus up to 4 tag pills on each
  of ~105 entries. Three different badge shapes coexist in one viewport — `.tag-btn` (20px
  radius, 2px border, `people.css:79–90`), `.pub-tag` (10px radius, filled,
  `publications.css:267–275`), `.pub-item__preprint` (3px radius, bordered,
  `publications.css:246–257`).
- **`people.html`**: 16 filter pills in two rows, to filter 11 people.
- **`.rq-card__papers-heading`** (`research.css:192–205`) is the clearest offender: an `<h3>`
  given a background, a border and `border-radius: 999px`. A static label styled as a button.
  False affordance — it invites a click that does nothing.
- Plus `.profile-link` (24px), `.footer__social a` (50%), `.nav::before` (999px),
  `.hero__mark` (999px).

The "Key publication" pill also repeats identically on every key paper — roughly 40 times
down one page.

### B4 · Ten border-radius values, no system [code]

`3px, 4px, 6px, 10px, 14px, 18px, 20px, 24px, 999px, 50%`.

`--radius: 4px` is declared at `style.css:26` and used in exactly three places; every other
component hardcodes its own. Catalog **K2/K8**: radius should encode an element's role.
Here it encodes which file was being edited that day. A three-step scale (sharp for content
surfaces, soft for controls, full for the two deliberate stadium shapes) would tighten the
whole site without any visible redesign.

### B5 · Contact page: two 140px generic icons in near-empty columns [both]

`contact.html:63–77` (flask) and `:138–150` (document), given a full `1fr` of a 1400px grid
by `contact.css:24–25`. In the render each floats alone in ~450px of white, and they are the
largest visual elements on the page.

A flask for "science" and a document for "jobs" are the two most predictable glyphs
available, and unlike the research-question icons they encode nothing specific to this lab.

### B6 · Repeated verbatim CTA copy [both]

- "Explore this question" ×3 (`index.html:120,143,168`)
- "Explore more papers" ×3 (`research.html:118,148,178`) — and all three link to the
  *identical* URL, `publications.html?key=1`
- Both `.contact-cta`s: uppercase + arrow glyph, same treatment
- Every `data/media.js` description ends "… here."

Catalog **CP1/CP3**. Three links with the same label going to the same place is a strong
tell that the copy was filled in structurally rather than written.

### B7 · `.reveal` starts invisible with no failure path [both]

`css/style.css:326–334` sets `opacity: 0`. `js/main.js:54–57` falls back only for browsers
lacking IntersectionObserver — not for a JS error, a blocked script, or any static capture.

This is why `index.html`, `contact.html` and `media.html` show large blank regions in the
screenshots: entire sections (the LinkedIn block, the address panel, media entries 3–4) are
sitting at `opacity: 0`. Same for print, and for any social/preview crawler that doesn't
scroll. Flagging as robustness rather than aesthetics, but it is the reason the pages *look*
half-empty in any non-interactive context.

### B8 · One shell for every page — judgment call [render]

All six pages are `banner → one or two bands → footer`, with the same photo at the same crop,
the same `clamp(180px, 22vw, 280px)` height, and a centered title over a centered caps
subtitle. Your memory notes this is deliberate (one photo, differentiated by crop and
overlay), so I am **not** recommending a change — only noting that the banner currently does
no work beyond announcing a page name that the nav already highlights in red. If you ever
want one page to feel different, this is the lever, and `people.html` is the natural candidate
since the constellation is the site's best asset and is currently pushed below the fold.

---

## LOW

### C1 · Collapsed research cards carry ~36px of dead padding [both]

`research.css:150–168`. `grid-template-rows: 0fr` collapses the row, but
`.rq-card__panel-inner` keeps `padding: 0.25rem 2rem 2.25rem` — and padding is *not* collapsed
by a zero-height grid row. Every collapsed card is ~36px taller than its content, which is the
unexplained empty navy under each question in the render. Moving the padding to a nested child
fixes it.

### C2 · The chevron sits on top of the watermark numeral [render]

On `research.html`, `.rq-card__chevron` (last flex child, `padding: 1.65rem 2rem`) overlaps
`.rq-card__num` (`top: 0.5rem; right: 1rem`, `research.css:75–77`). Visible on all three cards.

### C3 · Template leftovers still in the tree [code]

`css/style-mobile.css`, `style-narrow.css`, `style-narrower.css`, `style-normal.css`,
`style-wide.css` and `font-awesome.min.css` are referenced by **no page at all**.
`js/skel.min.js`, `skel-layers.min.js`, `jquery.min.js`, `jquery.dropotron.min.js` and
`init.js` are referenced only by `photos.html`, which is itself linked from nowhere except
itself. Also `css/people.css:364–366` is an empty rule containing only a comment.

Housekeeping, not design — but it's the kind of thing a reader who opens View Source notices.

### C4 · The font loads later than it needs to [code]

`css/style.css:5` uses `@import`. That request cannot start until `style.css` has downloaded
and parsed, so the webfont is always one round-trip behind. A `<link rel="preconnect">` plus a
`<link rel="stylesheet">` in `<head>` starts it immediately and measurably shortens the
flash of fallback text on first load.

---

# Pass 2 — Interaction, motion and typographic craft

Filtered for a content-heavy academic site. Nothing below is a gesture-driven app pattern;
these are all things a reader would actually feel.

## HIGH

### M1 · The one genuinely gesture-driven element throws the gesture away [code]

`js/people.js:275` — on pointer-up:

```js
d.node.vx = 0; d.node.vy = 0;
```

and `:262` zeroes velocity on every move. So when you flick a portrait across the
constellation, it **stops dead at the release point**, and only then does the spring drag it
home from a standstill. The physics engine is right there and already running; the handoff
between your finger and it is simply cut.

This is the highest-value motion fix on the site and it's small: keep the last two
`pointermove` positions and timestamps, and on release set `vx`/`vy` from that delta instead
of zeroing. The flick then continues into the existing spring, which is exactly the seam
Apple's fluid-interfaces work is about.

Related, `people.js:260–261`: positions are hard-clamped with `Math.max/min`, so a node
dragged to the edge stops against an invisible wall. Progressive resistance (rubber-banding)
reads as "responsive, but there's nothing more here" instead of "frozen".

**Already good, don't break:** `pointercancel` is handled (`:251`), and the 6px movement
threshold at `:258` correctly distinguishes tap-to-navigate from drag.

### M2 · Almost nothing on the site responds to being pressed [code]

The **only** `:active` rule in the entire codebase is `.tag-btn:active` (`people.css:90`).

Everything else commits on release with no pointer-down feedback at all: nav links,
`.nav__toggle`, `.year-header`, `.rq-card__header`, `.card`, `.profile-link`,
`.contact-cta`, `.rq-card__papers-cta`, `.tag-clear`, every publication title link.

Feedback on press rather than release is the difference between an interface that feels
direct and one that feels like a document. For a site like this it costs one shared rule —
roughly a 100ms `transform: scale(0.98)` or a background darken on the clickable surfaces.
Cheapest realism win available, and it's what "not as HTML-like" actually means in practice.

### M3 · One `:focus-visible` rule on the whole site [code]

`research.css:110` (`.rq-card__header`) is the only one. Every other control is a custom
`<button>` or `<a>` — most with `border: none` — sitting on navy, so keyboard users get
either the UA default ring or nothing legible.

Affects: nav links, mobile toggle, all `.tag-btn`s, `.tag-clear`, `.year-header`, `.card`,
`.profile-link`, `.contact-cta`, `.research-toggle`, and every publication title link.

This is an accessibility defect as well as a polish gap (catalog **K7**), and on a
university site that matters beyond aesthetics.

### M4 · No `prefers-reduced-motion` handling anywhere in your own code [code]

The only handling on the site lives inside the vendored logo library
(`js/logo-reveal/logo-reveal.js:194`). Everything you wrote runs unconditionally:

`.reveal` translateY (`style.css:326`) · `bannerReveal` (`:321`) · `slideInLeft`/`slideInRight`
on every profile hero (`people.css:469–476`) · staggered `fadeUp` across profile sections
(`:426–429`) · `yearSettle` + `pubEnter` on publications · the `translateX(±26px)` media bands ·
`html { scroll-behavior: smooth }` (`style.css:34`) · and the constellation's continuously
running rAF physics loop.

Reduced motion doesn't mean removing feedback — it means cross-fading instead of sliding, and
dropping overshoot. One media block that swaps transforms for opacity and settles the
constellation to its rest positions covers the entire site.

## MEDIUM

### M5 · The motion vocabulary is 17 durations and 4 curves with no system [code]

`--transition: 200ms ease` is declared (`style.css:27`) and used in 16 places. Alongside it,
hardcoded: 120, 140, 200, 220, 260, 280, 300, 350, 360, 380, 400, 420, 450, 500, 650ms, plus
0.45s, 0.55s, 0.65s, 0.7s, 0.72s, 0.9s.

Four easing curves: `cubic-bezier(.22,1,.36,1)` for reveals, `(.4,0,.2,1)` for collapses, and
**two nearly-identical spring curves that differ only in overshoot** —
`(.34,1.26,.64,1)` on the publications chevron (`publications.css:129`) versus
`(.34,1.56,.64,1)` on the research chevron (`research.css:135`). Same gesture, same glyph,
two different springs.

No individual value is wrong. Collectively there's no house style, so nothing feels like it
belongs to the same object. Three tokens would fix it — something like `--dur-fast: 140ms`
(hover/press), `--dur-base: 260ms` (state change), `--dur-slow: 520ms` (layout/collapse) —
plus one standard curve and one spring curve, used everywhere.

### M6 · Every reveal is the same fade-up, on the browser's default curve [both]

`.reveal` (`style.css:326–334`) applies an identical `opacity + translateY(24px)` over
`0.7s ease` to: the mission band, the *entire* card grid as one block, the LinkedIn section,
both contact panels, and the research intro — all at one threshold (`main.js:65`, 0.10).

Catalog **M1**. Two specific improvements: (a) stagger the three homepage cards individually
rather than fading the grid as a single block — the machinery already exists in
`publications.js:172–186`; (b) `ease` is the CSS default and decelerates weakly — the site's
own `cubic-bezier(.22,1,.36,1)` is used two lines away in `bannerReveal` and reads
noticeably better. Also consider cutting the travel from 24px to ~12px; large blocks
translating far is what makes scroll reveals feel applied rather than designed.

### M7 · The research accordion takes ~0.8–1.35s to become readable, and can't shorten [code]

`research.css:150–172` chains: width 650ms → panel rows 500ms with `transition-delay: 280ms`
→ inner opacity 400ms with `420ms` delay. On a plain click, text starts appearing at 420ms
and finishes at 820ms.

Arriving from a homepage card is longer. `js/research.js:103–110` waits 150ms, then
`setActive` smooth-scrolls, then waits another 380ms before applying `.active` — after which
the CSS delays above begin. Text starts fading in around **950ms** after landing and settles
around **1350ms**.

The intent is documented in the comments and is a reasonable one (make the scroll and the
expand read as two trackable moves). But the delays are fixed, so clicking a second question
mid-flight leaves the first unwinding through a delay chain that can't respond. Halving the
total to ~350–400ms would feel faster *and* survive interruption. The publications
`.year-body` collapse (`publications.css:146`, 380ms, no chaining) is the better model and is
already on the site.

### M8 · Tracking is applied backwards at the two sizes where it matters [code]

Tracking should be size-specific: tighten large display text, leave body near zero. Here:

- `.banner__title` (`style.css:232–237`) runs at up to `3.25rem` with **`letter-spacing: 0.02em`** —
  *positive* tracking on the biggest text on the site, where it should be roughly `-0.02em`.
  At 52px, DM Sans already reads loose; this pushes it further apart. It's the first thing on
  every page.
- `h1`, `.profile-name`, `.hero__heading`, all `.contact-panel__heading`s get **no** tracking
  adjustment at all.
- Meanwhile the micro-labels get 0.06–0.14em, which is correct for small caps but means the
  *only* deliberate tracking on the site is on its smallest text.

Also `style.css:48`: `h1, h2, h3, h4 { line-height: 1.2 }`. Leading should track size
inversely — the `3rem` `h1` wants ~1.05, the `1.375rem` `h4` wants ~1.3. One shared value
across a 2.2× size range is loose at the top and tight at the bottom.

## LOW

### M9 · Two hover animations solve the same problem two ways, and the slower one wins twice [code]

`.card__arrow` (`style.css:417–422`) animates `transform: translateX(3px)` — compositor-only,
correct. But `.contact-cta` (`contact.css:70–76`) and `.rq-card__papers-cta`
(`research.css:262–266`) animate **`gap`**, which triggers layout on every frame of every
hover. Same visual intent, three components, two implementations, and the good one is used
least.

### M10 · The constellation gives no feedback *during* a drag [code]

`.p-node.dragging` (`people.css:166–168`) changes only `cursor: grabbing`. The hover state
(`:186–191`) does more — scale and a red ring — than the active drag state does, so a node
looks *less* engaged the moment you actually grab it. Feedback should be continuous through
the interaction, not just on approach.

### M11 · Smooth scroll is applied twice and can't be turned off [code]

`html { scroll-behavior: smooth }` (`style.css:34`) plus
`scrollIntoView({ behavior: 'smooth' })` (`main.js:46`). The JS handler is redundant with the
CSS property for in-page anchors, and neither consults `prefers-reduced-motion` (see M4).

**Not a problem, for the record:** I checked whether `research.html#manifest` from a homepage
card lands correctly given there is no `id="manifest"` in the HTML. It does —
`js/research.js:101–113` resolves the hash against `data-rq` and scrolls the header itself,
with `scroll-margin-top` set at `research.css:108`. That path is handled properly.

---

# Prioritized shortlist

Ordered by *visible improvement per unit of risk*. Everything here is minor to semi-minor,
as asked — no restructuring.

**Tier 1 — biggest change in how the site reads, lowest risk**

1. **A5** — add a second typeface for headings only, and fix the phantom `600` weight. Single
   largest shift in character available; touches no layout.
2. **M2 + M3** — one shared `:active` press state and one shared `:focus-visible` ring across
   all controls. This is most of what "less HTML-like" means, and it's two rules.
3. **A1 + A2** — delete the repeated lab name from the five banner subtitles and the repeated
   affiliation from the 12 profiles. Pure subtraction.
4. **A6** — resolve the LinkedIn placeholder (embed it or cut the section).

**Tier 2 — removes the "lazy repetition" feeling**

5. **A3** — drop uppercase from the six decorative micro-labels; keep it in the nav.
6. **B1** — cut the red left stripe from the three repeating content units; keep it on the
   region separators.
7. **B3** — de-pill: make `.rq-card__papers-heading` a plain heading, and consolidate the
   three badge shapes on the publications page to one.
8. **M5** — three duration tokens and two curves, applied everywhere.

**Tier 3 — polish**

9. **M6** — stagger the homepage cards; shorten reveal travel; use the site's own curve.
10. **M8** — negative tracking on `.banner__title` and the large headings; size-aware leading.
11. **M4** — one `prefers-reduced-motion` block.
12. **B2** — drop the watermark numeral from profile pages (keep it on media, where it counts
    something).
13. **C1 + C2** — the collapsed-card padding bug and the chevron/numeral overlap.
14. **B5** — shrink or replace the two 140px contact-page icons.

**Tier 4 — worthwhile, but bigger conversations**

15. **A4** — recompose the homepage three-card row so it isn't a 3×1 grid of identical boxes.
16. **M1** — velocity handoff and rubber-banding on the constellation. Genuinely delightful,
    but it's the one item here that means touching working physics code.
17. **B7** — a no-JS fallback for `.reveal`.
18. **C3** — delete the unreferenced template leftovers.

**Explicitly recommending you leave alone:** the constellation concept, the logo pill and its
derived geometry, the custom research-question icons, the alternating full-bleed bands on
media/profile pages, the navy/blush/red palette, the placeholder media tiles, and the
one-photo-per-banner rule. These are the parts that already read as designed rather than
generated.
