/* ============================================================
   Section transitions for EVERY page (v17).
   Why this exists: the original `.reveal` scroll animation only
   covered elements hand-tagged in the markup — in practice that
   was the Home page only; the other 15 pages had no section
   transitions at all. This module generalises the same idea:
   it finds the top-level sections of the current page inside
   <main class="page-main"> and reveals each one with a soft
   rise + fade (staggered) as it scrolls into view.

   Design rules (kept deliberately lightweight — no library):
   - Transform + opacity ONLY (GPU-composited, no layout cost).
   - Fail-safe: the hidden starting state exists ONLY under the
     `sx-anim` gate class, which this module adds to <html>
     itself. No JS / module failure = everything simply visible.
   - Lite mode or prefers-reduced-motion → complete no-op.
   - A safety timer force-reveals anything the observer has
     not reached (e.g. sections toggled by the Team filter), so
     content can NEVER be stuck invisible.
   - Elements already tagged `.reveal` are left to the existing
     App.jsx observer (Home page) — no double handling.
   Returns a cleanup function, matching the per-route wiring
   contract in App.jsx's wirePageInteractions.
   ============================================================ */
export function mountPageTransitions() {
  const root = document.documentElement
  const lite = root.classList.contains('lite')
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (lite || reduced || !('IntersectionObserver' in window)) return () => {}

  const main = document.querySelector('.page-main')
  if (!main) return () => {}

  const targets = [...main.querySelectorAll(':scope > section, :scope > div')].filter(
    el => !el.classList.contains('reveal')
  )
  if (!targets.length) return () => {}

  root.classList.add('sx-anim')

  /* Stagger: small delay by order among siblings, capped. */
  const perParent = new Map()
  targets.forEach(el => {
    const i = perParent.get(el.parentNode) || 0
    perParent.set(el.parentNode, i + 1)
    el.style.transitionDelay = Math.min(i, 4) * 70 + 'ms'
    el.classList.add('sx-reveal')
  })

  const io = new IntersectionObserver(
    entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('in')
          io.unobserve(e.target)
        }
      })
    },
    { threshold: 0.1, rootMargin: '0px 0px -36px 0px' }
  )
  targets.forEach(el => io.observe(el))

  /* Safety net: nothing stays hidden, whatever happens. */
  const safety = setTimeout(() => {
    targets.forEach(el => el.classList.add('in'))
  }, 1600)

  return () => {
    io.disconnect()
    clearTimeout(safety)
    targets.forEach(el => {
      el.classList.add('in')
      el.style.transitionDelay = ''
    })
  }
}
