// shadcn-style Input (input.tsx naming)
export function Input({ className = '', ...props }) {
  return <input className={`input-shadcn ${className}`} {...props} />
}
export default Input
