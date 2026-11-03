import { useEffect, useState } from 'react'
import pages from './data/pages.json'
import icons from './data/icons.json'
import footerHtml from './data/footer.html.txt?raw'
import { Badge } from './components/ui/badge.jsx'
import SkillXFeatures from './features/SkillXFeatures.jsx'
import { mountFooterSpotlight } from './features/footerSpotlight.js'
import { mountMentorReviews } from './features/mentorReviews.js'
import { mountPageTransitions } from './features/pageTransitions.js'

const bySlug = Object.fromEntries(pages.map(p => [p.slug, p]))
const mainPages = pages.filter(p => p.group === 'main')
const morePages = pages.filter(p => p.group === 'more')

/* Hero typing animation — the skill words for the "Learn ___." line,
   exactly as specified (TikTok automation was listed twice; it cycles once). */
const TYPED_WORDS = [
  'AI portraits.',
  'video generation.',
  'AI avatars.',
  'YouTube automation.',
  'TikTok automation.',
  'Etsy digital products.',
  'freelancing.',
]

function slugFromHash() {
  const h = window.location.hash.replace(/^#\//, '').replace(/\/$/, '')
  return bySlug[h] ? h : 'index'
}

function NavIcon({ slug }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"
      dangerouslySetInnerHTML={{ __html: icons[slug] || '' }} />
  )
}

/* Page interactions — the original site's own behaviours, re-wired after
   every React page render: typing animation, accordions, course/tool
   filters, team filter + search, prompt search, countdown to the next
   8:30 PM PKT class, scroll reveal, demo forms, 3D tilt. */
function wirePageInteractions() {
  const cleanups = []
  const on = (el, ev, fn) => { el.addEventListener(ev, fn); cleanups.push(() => el.removeEventListener(ev, fn)) }
  let cancelled = false

  /* Hero typing animation (infinite): type → hold → delete → next word.
     With reduced-motion, whole words simply swap on a timer instead. */
  const typedEl = document.querySelector('.typed-word')
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (typedEl && reducedMotion) {
    let wi = 0
    typedEl.textContent = TYPED_WORDS[0]
    const swap = setInterval(() => { wi = (wi + 1) % TYPED_WORDS.length; typedEl.textContent = TYPED_WORDS[wi] }, 2400)
    cleanups.push(() => clearInterval(swap))
  } else if (typedEl) {
    let wi = 0, ci = 0, deleting = false, timer = null
    const step = () => {
      if (cancelled) return
      const word = TYPED_WORDS[wi]
      if (!deleting) {
        ci++
        typedEl.textContent = word.slice(0, ci)
        if (ci === word.length) { deleting = true; timer = setTimeout(step, 1500); return }
        timer = setTimeout(step, 75)
      } else {
        ci--
        typedEl.textContent = word.slice(0, ci)
        if (ci === 0) { deleting = false; wi = (wi + 1) % TYPED_WORDS.length; timer = setTimeout(step, 320); return }
        timer = setTimeout(step, 38)
      }
    }
    step()
    cleanups.push(() => { if (timer) clearTimeout(timer) })
  }

  /* Accordions */
  document.querySelectorAll('.acc-btn').forEach(btn => {
    on(btn, 'click', () => {
      const item = btn.closest('.acc-item')
      const group = item && item.closest('.acc')
      const wasOpen = item.classList.contains('open')
      if (group) group.querySelectorAll('.acc-item').forEach(i => {
        i.classList.remove('open')
        const t = i.querySelector('.acc-toggle'); if (t) t.textContent = '+'
        const b = i.querySelector('.acc-btn'); if (b) b.setAttribute('aria-expanded', 'false')
      })
      if (!wasOpen && item) {
        item.classList.add('open')
        const t = item.querySelector('.acc-toggle'); if (t) t.textContent = '−'
        btn.setAttribute('aria-expanded', 'true')
      }
    })
  })
  document.querySelectorAll('.acc').forEach(g => {
    const first = g.querySelector('.acc-item')
    if (first && !g.querySelector('.acc-item.open')) {
      first.classList.add('open')
      const t = first.querySelector('.acc-toggle'); if (t) t.textContent = '−'
    }
  })

  /* Filters (courses + tools) */
  function setupFilter(btnSel, itemSel) {
    const btns = document.querySelectorAll(btnSel)
    const items = document.querySelectorAll(itemSel)
    btns.forEach(btn => on(btn, 'click', () => {
      btns.forEach(b => b.classList.remove('active'))
      btn.classList.add('active')
      const f = btn.getAttribute('data-filter')
      items.forEach(item => {
        const cats = (item.getAttribute('data-cat') || '').split(' ')
        item.style.display = (f === 'all' || cats.indexOf(f) > -1) ? '' : 'none'
      })
      const counter = document.querySelector('.filter-count')
      if (counter) {
        const visible = Array.prototype.filter.call(items, i => i.style.display !== 'none').length
        counter.textContent = 'Showing ' + visible + ' item' + (visible === 1 ? '' : 's')
      }
    }))
  }
  setupFilter('[data-filter-group="courses"] .filter-btn, .filters.courses .filter-btn', '.filterable-course')
  setupFilter('.filters.tools .filter-btn', '.filterable-tool')

  /* Countdown to next 8:30 PM PKT class */
  const cd = document.querySelector('[data-countdown]')
  let timer = null
  if (cd) {
    const pad = n => String(n).padStart(2, '0')
    const tick = () => {
      const now = new Date()
      const pktNow = new Date(now.getTime() + (5 * 60 + now.getTimezoneOffset()) * 60000)
      const target = new Date(pktNow); target.setHours(20, 30, 0, 0)
      if (pktNow > target) target.setDate(target.getDate() + 1)
      const diff = target - pktNow
      const d = Math.floor(diff / 86400000), h = Math.floor(diff / 3600000) % 24,
        m = Math.floor(diff / 60000) % 60, s = Math.floor(diff / 1000) % 60
      const set = (k, v) => { const el = cd.querySelector('[data-cd="' + k + '"]'); if (el) el.textContent = v }
      set('d', d); set('h', pad(h)); set('m', pad(m)); set('s', pad(s))
    }
    tick(); timer = setInterval(tick, 1000)
  }

  /* Scroll reveal */
  const revealEls = document.querySelectorAll('.reveal')
  let io = null
  if ('IntersectionObserver' in window && revealEls.length) {
    io = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target) } })
    }, { threshold: 0.12 })
    revealEls.forEach(el => io.observe(el))
  } else {
    revealEls.forEach(el => el.classList.add('in'))
  }

  /* 3D tilt on showcase / featured / CTA panels — only on devices that
     can do it smoothly: fine pointer (mouse) and not in lite mode.
     Touch / low-end devices keep the same static 3D glass look. */
  const canTilt = !document.documentElement.classList.contains('lite')
    && window.matchMedia('(pointer: fine)').matches
  document.querySelectorAll('.showcase, .featured-course, .cta-panel, .founders-showcase, .sx3d-tilt').forEach(el => {
    if (!canTilt) return
    el.classList.add('tilt3d')
    const move = e => {
      const r = el.getBoundingClientRect()
      const x = (e.clientX - r.left) / r.width - 0.5
      const y = (e.clientY - r.top) / r.height - 0.5
      el.style.transform = `perspective(1200px) rotateX(${(-y * 5).toFixed(2)}deg) rotateY(${(x * 5).toFixed(2)}deg)`
      el.style.setProperty('--glare-x', `${(x + 0.5) * 100}%`)
      el.style.setProperty('--glare-y', `${(y + 0.5) * 100}%`)
    }
    const leave = () => { el.style.transform = 'perspective(1200px) rotateX(0deg) rotateY(0deg)' }
    on(el, 'mousemove', move); on(el, 'mouseleave', leave)
  })

  /* Demo forms (enroll + giveaway + support): validate in-browser, send nothing */
  document.querySelectorAll('#enroll-form, form[data-demo-form]').forEach(form => {
    on(form, 'submit', ev => {
      ev.preventDefault()
      let ok = true
      form.querySelectorAll('[required]').forEach(input => {
        const field = input.closest('.field')
        let valid = input.value.trim().length > 1
        if (input.dataset.minlength) valid = input.value.trim().length >= parseInt(input.dataset.minlength, 10)
        if (input.type === 'email') valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value.trim())
        if (field) field.classList.toggle('invalid', !valid)
        if (!valid) ok = false
      })
      if (!ok) return
      const success = form.querySelector('.form-success') || document.querySelector('.form-success')
      if (success) { success.style.display = 'block'; success.scrollIntoView({ behavior: 'smooth', block: 'center' }) }
      form.reset()
    })
  })

  /* Team: department filter + name search (sections hide when emptied) */
  const teamCards = document.querySelectorAll('.filterable-team')
  if (teamCards.length) {
    const tState = { dept: 'all', q: '' }
    const applyTeam = () => {
      let visible = 0
      teamCards.forEach(card => {
        const cats = (card.getAttribute('data-cat') || '').split(' ')
        const name = (card.getAttribute('data-name') || '').toLowerCase()
        const show = (tState.dept === 'all' || cats.indexOf(tState.dept) > -1) && name.indexOf(tState.q) > -1
        card.style.display = show ? '' : 'none'
        if (show) visible++
      })
      document.querySelectorAll('[data-dept-section]').forEach(sec => {
        const any = Array.prototype.some.call(sec.querySelectorAll('.filterable-team'), c => c.style.display !== 'none')
        sec.style.display = any ? '' : 'none'
      })
      const counter = document.querySelector('.team-count')
      if (counter) counter.textContent = 'Showing ' + visible + ' of ' + teamCards.length + ' team members'
      const empty = document.querySelector('.team-empty')
      if (empty) empty.style.display = visible ? 'none' : 'block'
    }
    document.querySelectorAll('.filters.team .filter-btn').forEach(btn => on(btn, 'click', () => {
      document.querySelectorAll('.filters.team .filter-btn').forEach(b => b.classList.remove('active'))
      btn.classList.add('active')
      tState.dept = btn.getAttribute('data-filter')
      applyTeam()
    }))
    const ts = document.querySelector('#team-search')
    if (ts) on(ts, 'input', () => { tState.q = ts.value.trim().toLowerCase(); applyTeam() })
    applyTeam()
  }

  /* Prompt Library topic search */
  const pInput = document.querySelector('#prompt-search')
  if (pInput) on(pInput, 'input', () => {
    const q = pInput.value.trim().toLowerCase()
    document.querySelectorAll('.filterable-prompt').forEach(card => {
      const name = (card.getAttribute('data-name') || '').toLowerCase()
      card.style.display = name.indexOf(q) > -1 ? '' : 'none'
    })
  })

  /* v14 features — footer wordmark spotlight (all routes) and the
     mentor ratings & reviews modal (Mentors route; no-ops elsewhere).
     Both return cleanups, so listeners never duplicate across routes. */
  cleanups.push(mountFooterSpotlight())
  cleanups.push(mountMentorReviews())
  /* v17 — section transitions on every page (see features/pageTransitions.js). */
  cleanups.push(mountPageTransitions())

  return () => { cancelled = true; cleanups.forEach(fn => fn()); if (timer) clearInterval(timer); if (io) io.disconnect() }
}

export default function App() {
  const [slug, setSlug] = useState(slugFromHash)
  const [dark, setDark] = useState(() => document.documentElement.getAttribute('data-theme') === 'dark')
  const [showTop, setShowTop] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  /* Lite mode for low-end devices: same design, cheaper rendering.
     Auto-detects reduced-motion, ≤4 CPU cores or ≤4 GB device memory.
     Manual override: localStorage 'skillx-lite' = '1' (on) / '0' (off). */
  useEffect(() => {
    const cores = navigator.hardwareConcurrency, mem = navigator.deviceMemory
    let lite = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      || (cores && cores <= 2)
      || (cores && mem && cores <= 4 && mem <= 4)
    try {
      const forced = localStorage.getItem('skillx-lite')
      if (forced === '1') lite = true
      if (forced === '0') lite = false
    } catch (e) {}
    document.documentElement.classList.toggle('lite', !!lite)
  }, [])

  useEffect(() => {
    const fn = () => { setSlug(slugFromHash()); setMenuOpen(false) }
    window.addEventListener('hashchange', fn)
    return () => window.removeEventListener('hashchange', fn)
  }, [])

  useEffect(() => {
    document.title = bySlug[slug].title
    window.scrollTo({ top: 0 })
    return wirePageInteractions()
  }, [slug])

  useEffect(() => {
    const fn = () => setShowTop(window.scrollY > 600)
    window.addEventListener('scroll', fn)
    return () => window.removeEventListener('scroll', fn)
  }, [])

  function toggleTheme() {
    const next = !dark
    setDark(next)
    if (next) document.documentElement.setAttribute('data-theme', 'dark')
    else document.documentElement.removeAttribute('data-theme')
    try { localStorage.setItem('skillx-react-theme', next ? 'dark' : 'light') } catch (e) {}
  }

  const page = bySlug[slug]

  const navLink = p => (
    <a key={p.slug} href={`#/${p.slug}`} className={slug === p.slug ? 'active' : ''}>
      <span className="ic"><NavIcon slug={p.slug} /></span>{p.label}
    </a>
  )

  return (
    <div className="app-shell has-sidebar">
      <div className="bg-scene" aria-hidden="true">
        <span className="orb orb-a" /><span className="orb orb-b" /><span className="orb orb-c" />
        <span className="grid-floor" />
      </div>

      <div className={`scrim ${menuOpen ? 'show' : ''}`} onClick={() => setMenuOpen(false)} />
      <aside className={`dash-sidebar ${menuOpen ? 'open' : ''}`}>
        <a className="side-brand" href="#/index">
          <img src="./assets/logo.webp" alt="SkillX logo" />
          <span><strong>SkillX</strong><small>Digital Institute</small></span>
        </a>
        <nav className="side-nav">
          {mainPages.filter(p => p.slug !== 'enroll').map(navLink)}
          <a href="#/enroll" className={`side-enroll ${slug === 'enroll' ? 'active' : ''}`}>
            <span className="ic"><NavIcon slug="enroll" /></span>Enroll Free
          </a>
        </nav>
        <p className="side-label">More</p>
        <nav className="side-nav">{morePages.map(navLink)}</nav>
        <div className="side-spacer" />
        <div className="side-live">
          <b>AI Pro Course · Live</b><br />
          Every night 8:30 PM PKT on Zoom<br />
          5 Oct – 2 Nov 2026 · 100% Free
        </div>
        <div className="theme-row">
          <span className="theme-label">{dark ? '☀' : '☾'} Dark Mode</span>
          <button className={`theme-switch ${dark ? 'on' : ''}`} onClick={toggleTheme}
            aria-label="Toggle dark or light theme"><span className="knob" /></button>
        </div>
      </aside>

      <div className="dash-main">
        <div className="mobile-header">
          <a className="brand" href="#/index"><img src="./assets/logo.webp" alt="SkillX logo" /><span>SkillX</span></a>
          <span className="mobile-actions">
            <Badge variant="lime" className="live-badge"><span className="live-dot" />AI Pro · Live</Badge>
            <button className="btn-shadcn btn-outline btn-size-icon theme-btn" onClick={toggleTheme}
              aria-label="Toggle dark or light theme">{dark ? '☀' : '☾'}</button>
            <button className="burger" aria-label="Open menu" aria-expanded={menuOpen}
              onClick={() => setMenuOpen(!menuOpen)}>☰</button>
          </span>
        </div>
        <div className="topbar">
          SkillX AI Pro Course · Live every night 8:30 PM PKT · 100% Free — <a href="#/enroll">Claim your free seat</a>
        </div>

        <main key={slug} className="page-main" dangerouslySetInnerHTML={{ __html: page.html }} />

        <footer className="main-foot" dangerouslySetInnerHTML={{ __html: footerHtml }} />
      </div>

      {/* New floating features (WhatsApp, assistant, #bg-3d) — isolated in src/features/ */}
      <SkillXFeatures />

      <button className={`to-top ${showTop ? 'show' : ''}`} aria-label="Back to top"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>↑</button>
    </div>
  )
}
