// shadcn-style Button — same variants/sizes naming as shadcn/ui (button.tsx),
// implemented in plain JSX + CSS classes from src/index.css (.btn-shadcn).
export function Button({ variant = 'default', size = 'default', asChild = false, className = '', children, ...props }) {
  const cls = `btn-shadcn btn-${variant} btn-size-${size} ${className}`
  if (asChild && children && typeof children === 'object') {
    const child = children
    return (
      <a className={cls} href={child.props.href} onClick={child.props.onClick}>{child.props.children}</a>
    )
  }
  return <button className={cls} {...props}>{children}</button>
}
export default Button
