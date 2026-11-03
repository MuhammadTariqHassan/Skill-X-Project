import { useEffect, useRef, useState } from 'react'
import {
  WHATSAPP_COMMUNITY_URL, ASSISTANT_FAQS, ASSISTANT_GREETING, ASSISTANT_FALLBACK,
} from './config.js'
import { WHATSAPP_SVG_INNER } from './whatsappIcon.js'
import './features.css'

/* ================================================================
   SkillX floating features — FULLY ISOLATED new code.
   - Renders the #bg-3d particle canvas and loads its logic from
     the separate self-contained file /effects/bg-3d.js, which
     touches nothing except #bg-3d.
   - Floating WhatsApp button (the site's real Community link).
   - "Ask SkillX" assistant: a fixed question bank (not a real AI),
     answers taken from the site's own pages (see config.js).
   - All styles are namespaced in features.css (.sxf-*); no
     existing page, stylesheet or script is modified by this file.
   ================================================================ */

function matchFaq(text) {
  const t = ' ' + text.toLowerCase() + ' '
  let best = null, bestScore = 0
  for (const item of ASSISTANT_FAQS) {
    let score = 0
    for (const k of item.keys) if (t.includes(k)) score += k.length
    if (score > bestScore) { bestScore = score; best = item }
  }
  return bestScore > 0 ? best : null
}

function AnswerLink({ link }) {
  if (!link) return null
  return (
    <a className="sxf-msg-link" href={link.href}
      {...(link.external ? { target: '_blank', rel: 'noopener' } : {})}>
      {link.label} →
    </a>
  )
}

export default function SkillXFeatures() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([{ from: 'bot', text: ASSISTANT_GREETING }])
  const [input, setInput] = useState('')
  const bodyRef = useRef(null)

  /* Load the isolated 3D particle background script (once), DEFERRED
     until after the window 'load' event so the page itself always
     opens first — the 3D never blocks initial load, even on slow
     port-forwarding tunnels. */
  useEffect(() => {
    let done = false
    const inject = () => {
      if (done || document.querySelector('script[data-sxf-bg3d]')) return
      done = true
      const s = document.createElement('script')
      s.src = './effects/bg-3d.js'
      s.async = true
      s.setAttribute('data-sxf-bg3d', '1')
      document.body.appendChild(s)
    }
    if (document.readyState === 'complete') {
      if ('requestIdleCallback' in window) requestIdleCallback(inject, { timeout: 1200 })
      else setTimeout(inject, 60)
      return undefined
    }
    window.addEventListener('load', inject, { once: true })
    return () => window.removeEventListener('load', inject)
  }, [])

  useEffect(() => {
    const el = bodyRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [messages, open])

  function ask(item) {
    setMessages(m => [...m, { from: 'user', text: item.q }, { from: 'bot', text: item.a, link: item.link }])
  }
  function send() {
    const text = input.trim()
    if (!text) return
    setInput('')
    const hit = matchFaq(text)
    setMessages(m => [
      ...m,
      { from: 'user', text },
      hit
        ? { from: 'bot', text: hit.a, link: hit.link }
        : { from: 'bot', text: ASSISTANT_FALLBACK },
    ])
  }

  return (
    <>
      {/* Isolated 3D particle background canvas — styled and driven
          ONLY by /effects/bg-3d.js (fixed, inset 0, z-index -1). */}
      <canvas id="bg-3d" aria-hidden="true" />

      <div className="sxf-stack">
        <button type="button" className="sxf-fab sxf-fab-ai" aria-label="Ask SkillX — open the assistant"
          aria-expanded={open} onClick={() => setOpen(!open)}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
            strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M12 3l1.9 5.7 5.7 1.9-5.7 1.9L12 18.2l-1.9-5.7L4.4 10.6l5.7-1.9L12 3z" />
            <path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8L19 15z" />
          </svg>
          <span className="sxf-fab-label">Ask SkillX</span>
        </button>

        <a className="sxf-fab sxf-fab-wa" href={WHATSAPP_COMMUNITY_URL} target="_blank" rel="noopener"
          aria-label="Join the SkillX WhatsApp Community">
          <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"
            dangerouslySetInnerHTML={{ __html: WHATSAPP_SVG_INNER }} />
          <span className="sxf-fab-label">WhatsApp</span>
        </a>
      </div>

      {open && (
        <section className="sxf-panel" role="dialog" aria-label="SkillX Assistant">
          <header className="sxf-panel-head">
            <div>
              <strong>SkillX Assistant</strong>
              <small>Answers from SkillX's own pages</small>
            </div>
            <button type="button" className="sxf-close" aria-label="Close the assistant"
              onClick={() => setOpen(false)}>✕</button>
          </header>

          {/* ONE single scroll area: greeting, quick questions and the
              whole conversation flow together — no second scrollbar. */}
          <div className="sxf-panel-body" ref={bodyRef}>
            {messages.slice(0, 1).map((m, i) => (
              <div key={i} className={`sxf-msg sxf-msg-${m.from}`}>
                <p>{m.text}</p>
                {m.link && <AnswerLink link={m.link} />}
              </div>
            ))}

            <div className="sxf-quick">
              <p className="sxf-quick-label">Quick questions</p>
              <div className="sxf-quick-chips">
                {ASSISTANT_FAQS.map(item => (
                  <button key={item.q} type="button" className="sxf-chip" onClick={() => ask(item)}>
                    {item.q}
                  </button>
                ))}
              </div>
            </div>

            {messages.slice(1).map((m, i) => (
              <div key={i + 1} className={`sxf-msg sxf-msg-${m.from}`}>
                <p>{m.text}</p>
                {m.link && <AnswerLink link={m.link} />}
              </div>
            ))}
          </div>

          <form className="sxf-input-row" onSubmit={e => { e.preventDefault(); send() }}>
            <input value={input} onChange={e => setInput(e.target.value)}
              placeholder="Ask about SkillX…" aria-label="Ask about SkillX" />
            <button type="submit" aria-label="Send question">➤</button>
          </form>
        </section>
      )}
    </>
  )
}
