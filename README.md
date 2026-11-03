# SkillX — React Redesign (HTML / CSS / JS + React) · shadcn-style 3D UI

A complete redesign of the SkillX website, rebuilt in **React** with
plain **HTML / CSS / JavaScript** — no PHP, no backend.

**No data was changed.** Every page's text, options, names, photos,
forms and rules are taken **verbatim** from the original
`SkillX_code_for_developer.zip` site (via the audited standalone
frontend). The extracted page content lives in `src/data/pages.json`
— open it and compare: it is the site's own content, word for word.
Only the design changed.

## What the redesign does (the old one was a mess — this is the cleanup)

- **One clean design system** instead of mixed styles: shadcn/ui-style
  tokens (neutral zinc surfaces, 1px borders, rounded corners, ring
  focus states, Inter type scale) defined once in `src/index.css`.
- **shadcn-style components** in `src/components/ui/` — `button.jsx`,
  `card.jsx`, `badge.jsx`, `input.jsx`, `tabs.jsx` — using the same
  variant names shadcn/ui uses (`default`, `outline`, `secondary`,
  `ghost`; sizes `sm`, `default`, `lg`, `icon`).
- **Navigation is a left sidebar, dashboard-style**: logo on top,
  all 11 main pages + 3 more (AI Pro Course Details, Schedule, About)
  under "More", an "AI Pro · Live" card, Enroll Free as the lime
  button, and the Dark Mode switch at the bottom. On mobile it
  becomes a slide-in drawer.
- **Hero typing animation**: the home headline types the skill words
  in an infinite loop — *Learn **AI portraits. / video generation. /
  AI avatars. / YouTube automation. / TikTok automation. / Etsy
  digital products. / freelancing.*** — with a blinking lime caret,
  then *Build Projects. Grow Your Future.* stays fixed below.
- **Founders photo lives on Meet the Team only** (banner at the top
  of that page) — it was removed from the home page, which keeps a
  glass countdown strip instead. The Team page is a hierarchy:
  Founders → Leadership heads on top → each department in its own
  section (Designing, Social Media, Video Editing, Marketing), each
  with its Head / Co-Heads as leader cards above its members.
- **The closing "Ready to start learning, free?" panel is
  glassmorphism** (frosted blur, translucent gradient, light border),
  and **footer links have hover effects** (colour shift, slide and an
  animated underline).
- **Get Connected's closing panel ("Not on this map yet?") is 3D
  glassmorphism** too — translucent violet→teal glass, deep layered
  shadows, mouse tilt + glare on capable devices.
- The founders **banner photo was removed from Meet the Team** as
  well (the founder cards with their own portraits remain).
- **Every Team section has the same dark glassmorphism background**
  — Leadership and all four departments (Designing, Social Media,
  Video Editing, Marketing) are uniform dark-glass panels with light
  headings; member/leader cards keep their own surface on top. The
  glass CTA panels are also tuned separately for dark mode
  (brighter glass, stronger border and glow) so glassmorphism looks
  right in **both** themes.

## Performance — same design, smooth on every device

- **Lite mode (automatic):** very low-end devices (≤2 CPU cores, or
  ≤4 cores combined with ≤4 GB RAM) and reduced-motion settings get
  the identical design with the expensive
  paint work removed — no backdrop blur, no animated background orbs,
  no tilt/glare, lighter shadows. Force it on/off any time with
  `localStorage.setItem('skillx-lite','1' | '0')`.
- Background orbs are now soft **radial gradients** (no giant blur
  filters repainting every frame), and backdrop blurs were reduced
  to the smallest values that keep the glass look.
- **3D tilt only runs on fine pointers** (mouse/trackpad) — touch
  devices never pay for mousemove handlers.
- All 82 content images are `loading="lazy"` + `decoding="async"`,
  and long pages use `content-visibility` so off-screen sections
  render only when scrolled near.
- `prefers-reduced-motion` is honoured everywhere: animations stop,
  and the hero typing swaps whole words on a timer instead.
- **Hover stability:** buttons and clickable cards never move on
  hover (colour/shadow feedback only) — a moving element slides out
  from under the cursor and makes it blink/flicker, which is what
  broke the Feed and Prompt Library buttons. Team department panels
  are true **blurred** glass (`backdrop-filter: blur(16px)`; lite
  mode swaps the blur for a near-opaque version of the same glass),
  and the **sidebar has a styled thin scrollbar** (rounded thumb,
  lime on hover, Firefox + WebKit).
- **3D look** (the part shadcn gives you the base for, finished here):
  - pointer-driven 3D tilt + glare on the hero showcase, featured
    course, founders panel and CTA panels (`Tilt.jsx` + App wiring)
  - cards lift and tilt in perspective on hover with layered shadows
  - floating gradient orbs + a perspective 3D grid floor behind pages
  - the curriculum mega-panel sits at a slight isometric angle
  - scroll-reveal rises in 3D instead of flat fades
- **Dark / light theme** toggle in the header (persisted), lime
  `#B6F34A` kept as the SkillX brand accent, official logo untouched.

## Section transitions on every page (v17)

- **The gap:** the old `.reveal` scroll animation only covered
  hand-tagged elements — in practice just the Home page. The
  other 15 pages had no section transitions at all.
- **The fix:** `src/features/pageTransitions.js` (mounted from
  `wirePageInteractions`, one line) auto-finds each page's
  top-level sections inside `<main class="page-main">` and
  reveals them with a soft rise + fade, staggered, as they
  scroll into view. CSS lives in the UPDATE-13 block.
- **Discipline:** transform + opacity only, no library. Hidden
  start states exist only under the module's own `sx-anim`
  gate class (JS failure = everything visible). Lite mode and
  prefers-reduced-motion disable it completely, and a 1.6 s
  safety timer force-reveals anything unobserved (e.g.
  filter-toggled Team sections), so content can never stick
  invisible. Home's hand-tagged `.reveal` elements keep their
  existing App.jsx observer — no double handling.

## Footer wordmark — extra delay (v16)

- **Scope (user-narrowed):** ONLY the footer wordmark timing
  changed in this version — no other pages, features or styles.
- **Trail delay:** `TRAIL_EASE` in `src/features/footerSpotlight.js`
  halved from 0.16 to **0.08** — the spotlight now trails the
  cursor noticeably lazier before settling. This one constant is
  the delay knob: lower = more delay.
- **Fade delay:** the enter/exit transition of `--spot-r` /
  `--spot-o` slowed from .55s/.5s to **.9s** via the UPDATE-12
  block at the end of `src/index.css`.

## Footer brand header — wordmark rebuilt to spec (v15)

- **Placement changed:** the giant "SkillX" wordmark is no longer
  at the bottom edge of the footer — it is now a dedicated
  full-width brand header at the **top** of the footer, directly
  above the footer navigation grid and the social/fine rows
  (first block inside `<footer>`; markup in
  `src/data/footer.html.txt`). The old bottom-crop treatment is
  gone; the footer ends with the normal fine-print row again.
- **Base state (exact spec):** fully transparent fill with a
  crisp outline — `-webkit-text-stroke: 2px rgba(255,255,255,.8)`.
  **Light-theme adaptation:** a white stroke would be invisible
  on the light background, so the light theme uses the same 2px
  stroke in dark ink (`rgba(12,12,13,.78)`); the fill stays
  transparent in both themes.
- **Damped spotlight:** on hover, a soft radial light in the
  lime brand gradient is masked strictly inside the letters
  (`background-clip: text`) and follows `--mouse-x` / `--mouse-y`
  — which `src/features/footerSpotlight.js` now **eases toward
  the pointer every animation frame** (lerp damping), so the
  light trails the cursor fluidly instead of snapping to it.
  On mouseenter the light expands and fades in; on mouseleave
  it fades back out to the clean outlined state (radius/opacity
  are `@property`-registered CSS variables, transitioned in the
  UPDATE-11 block of `src/index.css`). Touch devices, lite mode
  and reduced-motion keep the static outlined wordmark only.

## Footer spotlight wordmark + mentor reviews (v14)

- **Footer giant wordmark:** the footer now closes with a huge
  "SkillX" wordmark (modelled on the Sheryians footer, in this
  site's own theme). The base layer is faint outline letters;
  a lime-gradient layer on top is revealed only through a radial
  mask centred on the pointer, so the letters light up just
  around the cursor. Pointer tracking lives in
  `src/features/footerSpotlight.js` (CSS variables + rAF, no
  layout work); touch devices, lite mode and reduced-motion get
  the static faint wordmark only. Styles: UPDATE-10 block of
  `src/index.css`; markup: end of `src/data/footer.html.txt`.
- **Mentor ratings & reviews modal (Mentors page):** clicking
  any mentor card (founders + specialists) opens one shared
  modal — mentor photo/name/role, the star summary (average,
  total, 5→1 distribution bars), then Fiverr-style written
  student review cards below it: circular avatar (initials
  fallback when there is no DP), student name, that review's
  stars, and the feedback paragraph (omitted when a review has
  no written comment). Closes on backdrop / ✕ / Escape, locks
  page scroll, returns focus to the card, and becomes a
  bottom sheet on mobile. Code: `src/features/mentorReviews.js`,
  wired from the same per-route effect in `src/App.jsx`.
- **Data contract (backend integration):** all rating data is
  read through `getMentorReviews(mentorSlug)` in
  `src/features/mentorReviews.js`, which today resolves the
  bundled `src/data/reviews.json`. That file is shaped exactly
  like the future API payload —
  `{ "<mentor-slug>": { "average", "total",
  "distribution": { "5"…"1" }, "reviews": [ { "studentName",
  "avatarUrl", "stars", "text", "classTitle" } ] } }` — where
  the slug is the mentor's photo filename stem
  (`assets/team/<slug>.webp`). When the ratings backend lands,
  replace the body of `getMentorReviews()` with a `fetch()` to
  the real endpoint; nothing else changes.
- **Honesty:** there are no real student reviews in this
  frontend yet, and none are presented as real. `reviews.json`
  carries clearly-marked SAMPLE data (`"demo": true`) for
  exactly two mentors — **Najeeb Ullah** and **Hamza Visuals**
  (each including one stars-only review to demonstrate the
  no-comment layout) — and the modal shows a SAMPLE notice
  whenever demo data is displayed. Every other mentor shows
  the honest empty state: "No ratings yet" / "No written
  reviews yet — student feedback will appear here once classes
  are rated."

## Team org chart + roster updates (v13)

- **Meet the Team is now an org chart** (layout modelled on the
  live site's team page, in this redesign's own theme): hero →
  search + department filter chips → **Founders** (side by side) →
  lime connector → **Director of Leadership** (Fida Panjwani,
  centred) → connector → **Joint Team Heads** (Hina Jawad,
  Nadia Rao) → each department as a dark-glass panel with a
  centred title, a "Head: … · Co-Head: … · N members" subtitle,
  a HEAD & CO-HEADS leader row, a small connector, a MEMBERS
  label and the member grid. Search/filter behaviour is the
  site's own (cards now carry `data-cat` so the department
  chips actually filter; multi-department members appear under
  each of their departments, matching their card labels).
  Styles live in the UPDATE-9 block of `src/index.css`.
- **Roster changes (user-directed):** Ayesha Qayyum Siddiqui is
  now **Head of Designing** (first leader card; Shagufta Parveen
  stays Co-Head, Hamza Ali stays Adviser) — she also remains
  Head of Video Editing. **Maaz Khan Turk is removed entirely**
  (card, photo and all mentions); Muhammad Mustafa stays
  Co-Head of Marketing and is its only leader card. **Aneela
  Zahoor is added to Marketing** as a member (in addition to
  her Video Editing card). Counts: Designing 15, Social Media
  13, Video Editing 9, Marketing 5, Leadership 3, Founders 2 —
  47 cards, **45 unique people** ("forty-five" in the intro).
- **Home:** the glass showcase countdown card no longer carries
  the founders' names — it shows only "Next live class · 8:30 PM
  PKT" and the live countdown, plus the line "Live classes on
  Zoom · also available on YouTube". A light polish pass
  (UPDATE-9) aligns the showcase bar and section spacing.

## Progress rebuilt from the ORIGINAL portal data (v12)

The Progress page no longer uses invented sample modules/stats.
Its data now comes from the original `SkillX_code_for_developer.zip`
codebase (the PHP portal in `app/progression.php`, `app/app.php`
seeds and `public_html/dashboard.php`):

- The original 4 dashboard stat cards — Course Progress
  ("X of 28 classes watched"; 28 taught classes in the seed data),
  Attendance, Assignments, Learning Streak. Personal figures are
  still labelled Sample until the backend lands.
- The real class-completion chain: watch the recording → rate
  the class → write feedback (10+ characters) → submit the class
  assignment when it has one; the next class unlocks only when
  the previous completes. A demo **Rate + Feedback form** is
  included (star rating is CSS-only).
- The 3 REAL seeded assignments (Week 1 Prompts & AI Portrait,
  Week 2 AI Video / Cartoon Scene, Week 3 Automation Channel
  Plan) with their original instructions verbatim, plus a
  **Post Your Assignment** demo form (assignment select + "paste
  your text or a link", mirroring the original submit action).
- The original week meta (ranges + topics) with real class
  counts per week (5 / 9 / 6 / 8), and the certificate facts from
  the original dashboard (issued at course end, final class
  2 Nov 2026; shows attendance + assignments).
- Small App.jsx improvement: demo-form success boxes are now
  looked up inside the submitted form first, and `data-minlength`
  is honoured by the validator.

## Progress + Login pages (v11)

- The sidebar's **"Menu · 11 Pages" label is removed**.
- **Track Your Progress** (`#/progress`, main menu): the student
  progress dashboard as a visual preview — overall progress ring,
  assignment/class/recording stat cards, per-module progress bars
  and a certificate bar marked at the real 75% rule. Every number
  is tagged **Sample** and a banner states plainly that the data is
  a sample until student accounts go live with the backend.
- **Login / Sign Up** (`#/login`, More menu): one card with a
  CSS-only Sign In / Sign Up toggle. Sign In takes email **or**
  reference number + password; Sign Up takes name, email, WhatsApp
  and password. Both are frontend demos using the site's existing
  demo-form pattern (in-browser validation, nothing submitted,
  shared success box explains the backend comes later).

## Assistant UI fix (v9)

The assistant panel now has **one single scroll area**: the
greeting, the quick questions and the whole conversation flow
together inside `.sxf-panel-body` (the quick-questions strip no
longer has its own scrollbar). That one scrollbar is styled exactly
like the site's sidebar scrollbar — thin 8px, transparent track,
rounded grey thumb that turns lime on hover, with a dark-theme
variant (WebKit + Firefox).

## Team + home update (v8)

- **Social Media**: Afia Andrias and Alishah Naveed removed
  completely (cards and photos deleted; the department count is now
  14). Note: no separate person named "Afiya" exists anywhere in the
  site's data — Afia Andrias was the only matching name.
- **Video Editing**: Ayesha Qayyum Siddiqui is now **Head** (her
  leader card leads the department; header updated). Momina Qayyum
  moved to Joint Co-Head alongside Maria Asif.
- **Designing**: Hamza Ali's title is now **Adviser** (badge +
  department header updated; he remains the department's first
  leader card, Shagufta Parveen stays Co-Head).
- **Home page 3D**: one new tasteful interactive section under the
  hero — the four AI Pro Course modules as glass 3D cards on a
  perspective stage (side cards angled in 3D, gentle float, pointer
  tilt + glare on desktop via `.sx3d-tilt`, flat and still in lite
  mode / reduced motion / mobile stacking). Styles are the
  `UPDATE-6` block at the end of `src/index.css`.

## New features (isolated — existing site code untouched)

All three additions live in **new files only** (`src/features/` +
`public/effects/`). The only change to an existing file is one mount
line in `src/App.jsx` (`<SkillXFeatures />`); no existing HTML, CSS
or JavaScript was modified, refactored or deleted.

- **Floating WhatsApp button** (bottom-right, mobile-first): the
  official WhatsApp glyph (copied from the original site's own
  social icons) in WhatsApp green with a soft pulse ring. It links
  to SkillX's **real WhatsApp Community** — the same invite link the
  original site uses (`chat.whatsapp.com/BTY6dTgmjcAB70KYAa9kzL`,
  in `src/features/config.js`, next to the WhatsApp Channel link).
- **"Ask SkillX" assistant** (violet floating button): opens a chat
  panel — a full-width bottom sheet on mobile, a 392px card on
  desktop. It is **not a real AI**: it's a fixed question bank. The
  first five answers are the site's own FAQ answers verbatim; the
  rest use only facts printed on the site's pages. Tap a question
  chip, or type a question and it keyword-matches to the bank, with
  an honest fallback pointing to WhatsApp / Support.
- **3D particle background**: `<canvas id="bg-3d">` with all logic in
  the separate self-contained file `public/effects/bg-3d.js`, which
  touches **nothing except #bg-3d** (fixed, inset 0, z-index −1,
  pointer-events none). Brand-coloured particles with connecting
  lines and gentle pointer parallax. It pauses when the tab is
  hidden, scales its particle count to the screen, and draws a
  single static frame in lite mode / reduced-motion.
- **Mobile 3D interactivity + ultra-light loading (v2 of bg-3d.js)**:
  the script is **deferred until after `window load`** (and Google
  Fonts now load without blocking first paint), there are **zero
  `localhost`/`127.0.0.1` references** anywhere (all paths relative
  `./`), and there is **no Three.js** — dependency-free Canvas 2D,
  so nothing heavy ever downloads. On top of the base effect:
  **scroll-tied progression** (scrollY lerped into field rotation/
  drift), **gyroscope parallax** (deviceorientation gamma/beta with
  damping; iOS permission requested safely on first tap only),
  **tap-to-react** (pointerdown on window → elastic particle ripple
  at the tap point + `navigator.vibrate(15)`), **adaptive quality**
  (mobile <768px: ~65% fewer particles, pixelRatio 1; desktop:
  pixelRatio ≤1.5), listeners that only store values (throttled by
  the render loop), pause on `document.hidden`, and a **try/catch
  fail-safe** that hides the canvas and leaves the site fully
  working if anything fails. Serving tip: open the **built `dist/`**
  through the tunnel (one small JS/CSS bundle), not `npm run dev` —
  dev mode streams hundreds of module requests, which is what makes
  port-forwarding tunnels hang.
- **Smaller floating buttons on mobile**: an additive
  `@media (max-width: 768px)` block at the end of
  `src/features/features.css` shrinks the WhatsApp button
  (`.sxf-fab.sxf-fab-wa`) and the AI button (`.sxf-fab.sxf-fab-ai`)
  to compact 46px round icons with tighter edge spacing. Desktop
  styling is unchanged.

## Pages (14 — all of them, same content as the original site)

Home · Feed · Prompt Library · Courses · Mentors · Meet the Team ·
Announcements · Giveaway · Get Connected · Support · Enroll Free ·
AI Pro Course Details · Schedule · About SkillX

Routing is hash-based (`#/courses`, `#/team`, …) so the built site
works from any static host or folder with no server config.

Everything interactive still works: live countdown to the next
8:30 PM PKT class, curriculum/FAQ accordions, course + tool filters,
team department filter + name search (real 49-person roster),
prompt search, and the Enroll / Giveaway / Support forms with the
original fields — frontend validation only, they send nothing,
exactly as labelled on the pages.

## Run it

### Option A — just view it (no install)
Open the ready-built version in `dist/`:

```bash
cd dist
python3 -m http.server 8080
# open http://localhost:8080
```

### Option B — develop with React
```bash
npm install
npm run dev      # local dev server
npm run build    # rebuild dist/
npm run preview  # serve the build
```

## Files

```
index.html              Vite entry (title/meta from the original site)
src/main.jsx            React root
src/App.jsx             Shell: glass header, Tabs nav, theme, footer,
                        + all page interactions wired after render
src/index.css           shadcn design tokens + 3D design layer +
                        the site's content styles (cleaned)
src/components/ui/      shadcn-style Button, Card, Badge, Input, Tabs
src/components/Tilt.jsx 3D tilt + glare wrapper
src/data/pages.json     ALL page content — verbatim from the original
                        site (titles, text, options, forms, roster)
src/data/footer.html.txt  Footer content — verbatim (design credit line updated)
public/assets/          Real logo, founders photo, all 63 team photos,
                        11 tool icons (copied from the original codebase)
dist/                   Ready-built static site
previews/               Screenshots of the finished redesign
```

## Content honesty

- Team page = the real 49-person roster with real photos, departments
  and roles from the original code.
- No stats, prices, dates or names were invented or changed: course
  dates (5 Oct – 2 Nov 2026), class time (8:30 PM PKT), mentor count
  (19), tools (11) and every form field are the site's own.
- Forms are frontend demos: they validate in the browser and send
  nothing — the pages say so, as before.
