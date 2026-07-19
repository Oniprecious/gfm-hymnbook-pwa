import type { ButtonHTMLAttributes, ReactNode } from 'react'

export function IconButton({ children, className = '', ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { children: ReactNode }) {
  return <button type="button" className={`icon-button ${className}`.trim()} {...props}>{children}</button>
}
