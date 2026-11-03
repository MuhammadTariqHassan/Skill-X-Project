// shadcn-style Badge (badge.tsx naming): variants default / secondary / outline / lime
export function Badge({ variant = 'default', className = '', children }) {
  return <span className={`badge-shadcn badge-${variant} ${className}`}>{children}</span>
}
export default Badge
