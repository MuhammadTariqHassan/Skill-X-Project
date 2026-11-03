// shadcn-style Card family (card.tsx naming): Card, CardHeader, CardTitle,
// CardDescription, CardContent, CardFooter — styled by src/index.css.
export function Card({ className = '', children, ...props }) {
  return <div className={`card-shadcn ${className}`} {...props}>{children}</div>
}
export function CardHeader({ className = '', children }) {
  return <div className={`card-shadcn-header ${className}`}>{children}</div>
}
export function CardTitle({ className = '', children }) {
  return <h3 className={`card-shadcn-title ${className}`}>{children}</h3>
}
export function CardDescription({ className = '', children }) {
  return <p className={`card-shadcn-desc ${className}`}>{children}</p>
}
export function CardContent({ className = '', children }) {
  return <div className={`card-shadcn-content ${className}`}>{children}</div>
}
export function CardFooter({ className = '', children }) {
  return <div className={`card-shadcn-footer ${className}`}>{children}</div>
}
export default Card
