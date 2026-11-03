/* ============================================================
   Footer giant-wordmark spotlight (v15 — rebuilt to the user's
   exact spec; supersedes the v14 version).
   The footer OPENS with a huge outlined "SkillX" wordmark
   (markup in src/data/footer.html.txt, styles in the UPDATE-11
   block of src/index.css). The base layer is always visible
   (transparent fill, crisp outline). A lime-gradient layer sits
   exactly on top, clipped to the letters (background-clip:text)
   and masked by a soft radial gradient centred on
   --mouse-x / --mouse-y — the light lives strictly inside the
   letters.

   Motion model (the v15 upgrade):
   - pointermove updates a TARGET position only.
   - A requestAnimationFrame loop eases a CURRENT position
     toward the target every frame (lerp), so the light TRAILS
     the cursor with fluid damped motion instead of snapping.
     The loop stops once the position has settled.
   - pointerenter snaps the position to the cursor (so the
     light is born under the pointer) and adds .is-hover —
     CSS transitions --spot-r / --spot-o so the light expands
     and fades in. pointerleave removes the class and CSS
     fades it back out to the clean outlined state.

   Fail-safe / graceful paths:
   - No JS → the outlined wordmark still renders (static).
   - Lite mode, prefers-reduced-motion, or touch (no hover)
     → this module no-ops and CSS hides the glow layer entirely.
   Returns a cleanup function (listener removal), matching the
   per-route wiring contract in App.jsx's wirePageInteractions.
   ============================================================ */
export function mountFooterSpotlight() {
  const el = document.querySelector('.foot-wordmark')
  if (!el) return () => {}

  const lite = document.documentElement.classList.contains('lite')
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches
  if (lite || reduced || !canHover) return () => {}

  const TRAIL_EASE = 0.08 /* v16: delay control — lower = lazier, more delayed trail (was 0.16 in v15) */
  const SETTLE = 0.1 /* px distance at which the loop stops */

  let raf = 0
  let running = false
  let tx = 0, ty = 0 /* target — where the pointer is */
  let cx = 0, cy = 0 /* current — where the light is */

  const write = () => {
    el.style.setProperty('--mouse-x', cx.toFixed(1) + 'px')
    el.style.setProperty('--mouse-y', cy.toFixed(1) + 'px')
  }
  const frame = () => {
    cx += (tx - cx) * TRAIL_EASE
    cy += (ty - cy) * TRAIL_EASE
    if (Math.abs(tx - cx) < SETTLE && Math.abs(ty - cy) < SETTLE) {
      cx = tx; cy = ty
      write()
      running = false; raf = 0
      return
    }
    write()
    raf = requestAnimationFrame(frame)
  }
  const start = () => {
    if (!running) { running = true; raf = requestAnimationFrame(frame) }
  }
  const local = e => {
    const r = el.getBoundingClientRect()
    tx = e.clientX - r.left
    ty = e.clientY - r.top
  }

  const onEnter = e => {
    local(e)
    cx = tx; cy = ty /* born under the pointer — no sweep-in */
    write()
    el.classList.add('is-hover')
  }
  const onMove = e => { local(e); start() }
  const onLeave = () => { el.classList.remove('is-hover') }

  el.addEventListener('pointerenter', onEnter)
  el.addEventListener('pointermove', onMove)
  el.addEventListener('pointerleave', onLeave)
  return () => {
    el.removeEventListener('pointerenter', onEnter)
    el.removeEventListener('pointermove', onMove)
    el.removeEventListener('pointerleave', onLeave)
    if (raf) cancelAnimationFrame(raf)
    running = false
  }
}
