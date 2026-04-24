import { type ReactNode } from 'react'

interface CardProps {
  children?: ReactNode
  centered?: boolean
  className?: string
}

export function Card({ children, centered = false, className = '' }: CardProps) {
  return <div className={`card ${centered ? 'card--centered' : ''} ${className}`}>{children}</div>
}
