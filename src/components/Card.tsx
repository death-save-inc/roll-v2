import { type ReactNode } from 'react'

interface CardProps {
  children?: ReactNode
  centered?: boolean
}

export function Card({ children, centered = false }: CardProps) {
  return <div className={`card ${centered ? 'card--centered' : ''}`}>{children}</div>
}
