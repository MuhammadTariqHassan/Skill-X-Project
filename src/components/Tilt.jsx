import { useRef } from 'react'
// 3D tilt wrapper — pointer-driven rotateX/rotateY with perspective,
// glare highlight and layered depth shadow. Used on the hero showcase
// and featured panels for the 3D look.
export default function Tilt({ children, className = '', max = 7 }) {
  const ref = useRef(null)
  function onMove(e) {
    const el = ref.current
    if (!el) return
    const r = el.getBoundingClientRect()
    const x = (e.clientX - r.left) / r.width - 0.5
    const y = (e.clientY - r.top) / r.height - 0.5
    el.style.transform = `perspective(1100px) rotateX(${(-y * max).toFixed(2)}deg) rotateY(${(x * max).toFixed(2)}deg) translateZ(0)`
    el.style.setProperty('--glare-x', `${(x + 0.5) * 100}%`)
    el.style.setProperty('--glare-y', `${(y + 0.5) * 100}%`)
  }
  function onLeave() {
    const el = ref.current
    if (el) el.style.transform = 'perspective(1100px) rotateX(0deg) rotateY(0deg)'
  }
  return (
    <div ref={ref} className={`tilt ${className}`} onMouseMove={onMove} onMouseLeave={onLeave}>
      {children}
      <span className="tilt-glare" aria-hidden="true" />
    </div>
  )
}
