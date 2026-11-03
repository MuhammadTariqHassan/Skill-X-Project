import { useState } from 'react'
// shadcn-style Tabs (tabs.tsx naming): Tabs, TabsList, TabsTrigger, TabsContent.
// Used for the page tab bar under the header — the active page is the active tab.
export function Tabs({ value, children, className = '' }) {
  return <div className={`tabs-shadcn ${className}`} data-value={value}>{children}</div>
}
export function TabsList({ children, className = '' }) {
  return <div className={`tabs-list ${className}`} role="tablist">{children}</div>
}
export function TabsTrigger({ value, active, children, href }) {
  return (
    <a role="tab" aria-selected={active ? 'true' : 'false'} href={href}
      className={`tabs-trigger ${active ? 'tabs-trigger-active' : ''}`} data-value={value}>
      {children}
    </a>
  )
}
export function TabsContent({ children, className = '' }) {
  return <div className={`tabs-content ${className}`}>{children}</div>
}
// Accordion behaviour for the curriculum / FAQ markup (.acc / .acc-item / .acc-btn)
// is wired globally in App.jsx after each page render — same pattern as Radix
// Accordion (single open item per group, first item open by default).
export function useAccordionReady() {
  const [ready] = useState(true)
  return ready
}
