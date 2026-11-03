/* ============================================================
   Mentor ratings & written reviews modal (v14 — isolated
   feature). On the Mentors page, every mentor card (the two
   founder-cards and every .person specialist card) becomes
   clickable and opens ONE shared modal:

     mentor photo + name + role
     star summary — average, total ratings, 5→1 distribution
     "Student reviews" — Fiverr-style cards: circular avatar
     (initials fallback when avatarUrl is null), student name,
     that review's stars, and the written feedback paragraph
     (the text block is omitted when a review has no comment).

   DATA CONTRACT — src/data/reviews.json is shaped exactly like
   the future API payload:
     { "<mentor-slug>": {
         "average": 4.8, "total": 132,
         "distribution": { "5": 110, "4": 15, "3": 4, "2": 2, "1": 1 },
         "reviews": [ { "studentName": "…", "avatarUrl": null,
                        "stars": 5, "text": "…", "classTitle": "…" } ] } }
   The mentor slug is the mentor's photo filename stem
   (assets/team/<slug>.webp). All reads go through
   getMentorReviews() below — when the backend lands, replace
   its body with a fetch() to the real endpoint and nothing
   else in this module changes.

   HONESTY: there are no real student reviews in this frontend
   yet. reviews.json carries clearly SAMPLE data for two
   mentors only (marked "demo": true) and the modal shows a
   SAMPLE notice whenever demo data is displayed. Every other
   mentor gets the honest empty state ("No ratings yet").

   Returns a cleanup function, matching the per-route wiring
   contract in App.jsx's wirePageInteractions. Styles live in
   the UPDATE-10 block of src/index.css (.mr-* namespace).
   ============================================================ */
import reviewsData from '../data/reviews.json'

export async function getMentorReviews(mentorSlug) {
  /* Backend swap point: return fetch(`/api/mentors/${mentorSlug}/reviews`)
       .then(r => (r.ok ? r.json() : null)) */
  return reviewsData[mentorSlug] || null
}

/* ---------- small DOM helpers (textContent only — no HTML injection) ---------- */
function el(tag, cls, text) {
  const n = document.createElement(tag)
  if (cls) n.className = cls
  if (text != null) n.textContent = text
  return n
}

function starRow(stars, label) {
  const wrap = el('span', 'mr-stars')
  wrap.setAttribute('role', 'img')
  wrap.setAttribute('aria-label', label || ('Rated ' + stars + ' out of 5'))
  const full = Math.max(0, Math.min(5, Math.round(stars)))
  wrap.appendChild(el('span', 'mr-stars-on', '★'.repeat(full)))
  if (full < 5) wrap.appendChild(el('span', 'mr-stars-off', '★'.repeat(5 - full)))
  return wrap
}

function initialsOf(name) {
  const parts = (name || '').trim().split(/\s+/).filter(Boolean)
  if (!parts.length) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

/* ---------- modal body builders ---------- */
function buildSummary(data) {
  const box = el('div', 'mr-summary')
  const avg = el('div', 'mr-avg')
  avg.appendChild(el('b', 'mr-avg-num', Number(data.average).toFixed(1)))
  avg.appendChild(starRow(data.average, 'Average rating ' + data.average + ' out of 5'))
  avg.appendChild(el('span', 'mr-avg-total', data.total + ' ratings'))
  box.appendChild(avg)

  const bars = el('div', 'mr-bars')
  const dist = data.distribution || {}
  ;[5, 4, 3, 2, 1].forEach(star => {
    const count = dist[String(star)] || 0
    const pct = data.total ? Math.round((count / data.total) * 100) : 0
    const row = el('div', 'mr-bar-row')
    row.appendChild(el('span', 'mr-bar-star', star + '★'))
    const track = el('div', 'mr-bar-track')
    const fill = el('i', 'mr-bar-fill')
    fill.style.width = pct + '%'
    track.appendChild(fill)
    row.appendChild(track)
    row.appendChild(el('span', 'mr-bar-count', String(count)))
    bars.appendChild(row)
  })
  box.appendChild(bars)
  return box
}

function buildReviewCard(review) {
  const card = el('article', 'mr-review')
  const head = el('div', 'mr-review-head')
  if (review.avatarUrl) {
    const img = document.createElement('img')
    img.className = 'mr-avatar'
    img.src = review.avatarUrl
    img.alt = ''
    img.loading = 'lazy'
    head.appendChild(img)
  } else {
    head.appendChild(el('span', 'mr-avatar mr-avatar-initials', initialsOf(review.studentName)))
  }
  const who = el('div', 'mr-review-who')
  who.appendChild(el('b', 'mr-review-name', review.studentName || 'Student'))
  who.appendChild(starRow(review.stars))
  head.appendChild(who)
  card.appendChild(head)

  if (review.text && review.text.trim()) {
    card.appendChild(el('p', 'mr-review-text', review.text))
  }
  if (review.classTitle) {
    card.appendChild(el('p', 'mr-review-class', review.classTitle))
  }
  return card
}

function buildBody(container, data) {
  container.textContent = ''
  if (!data) {
    const emptySummary = el('div', 'mr-summary mr-summary-empty')
    emptySummary.appendChild(el('b', 'mr-avg-num', '—'))
    emptySummary.appendChild(el('span', 'mr-avg-total', 'No ratings yet'))
    container.appendChild(emptySummary)
    container.appendChild(el('h4', 'mr-reviews-title', 'Student reviews'))
    container.appendChild(el('p', 'mr-empty',
      'No written reviews yet — student feedback will appear here once classes are rated.'))
    return
  }

  container.appendChild(buildSummary(data))

  if (data.demo) {
    const note = el('p', 'mr-sample-note')
    const tag = el('span', 'sample-tag', 'Sample')
    note.appendChild(tag)
    note.appendChild(document.createTextNode(
      ' Sample ratings & reviews shown for preview — real student feedback will appear here once the ratings backend is connected.'))
    container.appendChild(note)
  }

  container.appendChild(el('h4', 'mr-reviews-title', 'Student reviews'))
  const list = el('div', 'mr-list')
  ;(data.reviews || []).forEach(r => list.appendChild(buildReviewCard(r)))
  if (!list.children.length) {
    list.appendChild(el('p', 'mr-empty',
      'No written reviews yet — student feedback will appear here once classes are rated.'))
  }
  container.appendChild(list)
}

/* ---------- the feature ---------- */
export function mountMentorReviews() {
  /* Mentors page only — other routes have no mentor cards to wire.
     (Team also uses .founder-card/.person classes; the route
     check keeps this modal exclusive to #/mentors.) */
  if (!/^#\/mentors\/?$/.test(window.location.hash)) return () => {}
  const cards = Array.prototype.slice.call(
    document.querySelectorAll('.page-main .founder-card, .page-main .person'))
  if (!cards.length) return () => {}

  /* --- shared modal shell (created once per mount) --- */
  const backdrop = el('div', 'mr-backdrop')
  const modal = el('div', 'mr-modal')
  modal.setAttribute('role', 'dialog')
  modal.setAttribute('aria-modal', 'true')
  const closeBtn = el('button', 'mr-close', '✕')
  closeBtn.type = 'button'
  closeBtn.setAttribute('aria-label', 'Close ratings and reviews')
  const head = el('div', 'mr-head')
  const photo = document.createElement('img')
  photo.className = 'mr-photo'
  photo.alt = ''
  const headText = el('div', 'mr-head-text')
  const nameEl = el('h3', 'mr-name')
  const roleEl = el('p', 'mr-role')
  headText.appendChild(nameEl)
  headText.appendChild(roleEl)
  head.appendChild(photo)
  head.appendChild(headText)
  const body = el('div', 'mr-body')
  modal.appendChild(closeBtn)
  modal.appendChild(head)
  modal.appendChild(body)
  backdrop.appendChild(modal)
  document.body.appendChild(backdrop)

  let lastTrigger = null
  let open = false
  const prevOverflow = document.body.style.overflow

  function closeModal() {
    if (!open) return
    open = false
    backdrop.classList.remove('open')
    document.body.style.overflow = prevOverflow
    if (lastTrigger && document.contains(lastTrigger)) lastTrigger.focus()
  }
  function openModal(card, info) {
    lastTrigger = card
    photo.src = info.photo
    nameEl.textContent = info.name
    roleEl.textContent = info.role
    modal.setAttribute('aria-label', 'Ratings and reviews for ' + info.name)
    body.textContent = ''
    body.appendChild(el('p', 'mr-empty', 'Loading ratings…'))
    backdrop.classList.add('open')
    document.body.style.overflow = 'hidden'
    open = true
    closeBtn.focus()
    getMentorReviews(info.slug).then(data => { if (open) buildBody(body, data) })
  }

  const onBackdrop = e => { if (e.target === backdrop) closeModal() }
  const onKey = e => { if (open && e.key === 'Escape') closeModal() }
  backdrop.addEventListener('click', onBackdrop)
  closeBtn.addEventListener('click', closeModal)
  document.addEventListener('keydown', onKey)

  /* --- wire the cards --- */
  const removers = []
  cards.forEach(card => {
    const img = card.querySelector('img')
    const src = (img && img.getAttribute('src')) || ''
    const m = src.match(/assets\/team\/([a-z0-9-]+)\.webp/i)
    if (!m) return
    const nameNode = card.querySelector('h3')
    const roleNode = card.querySelector('.role')
    const info = {
      slug: m[1],
      photo: src,
      name: nameNode ? nameNode.textContent.trim() : 'Mentor',
      role: roleNode ? roleNode.textContent.trim() : 'Mentor',
    }

    card.classList.add('mr-card')
    card.setAttribute('tabindex', '0')
    card.setAttribute('role', 'button')
    card.setAttribute('aria-haspopup', 'dialog')
    card.setAttribute('aria-label', info.name + ' — view ratings and reviews')

    const hint = el('span', 'mr-hint', '★ Ratings & reviews')
    const textBox = card.classList.contains('founder-card') ? card.querySelector('div') : card
    ;(textBox || card).appendChild(hint)

    const onClick = () => openModal(card, info)
    const onKeydown = e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openModal(card, info) }
    }
    card.addEventListener('click', onClick)
    card.addEventListener('keydown', onKeydown)
    removers.push(() => {
      card.removeEventListener('click', onClick)
      card.removeEventListener('keydown', onKeydown)
      hint.remove()
      card.classList.remove('mr-card')
      card.removeAttribute('tabindex')
      card.removeAttribute('role')
      card.removeAttribute('aria-haspopup')
      card.removeAttribute('aria-label')
    })
  })

  return () => {
    closeModal()
    document.removeEventListener('keydown', onKey)
    backdrop.remove()
    document.body.style.overflow = prevOverflow
    removers.forEach(fn => fn())
  }
}
