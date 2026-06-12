import { type ReactNode } from 'react'

interface CardProps {
  children?: ReactNode
  centered?: boolean
  className?: string
  onClick?: () => void
}

const Card = ({ children, centered = false, className = '', onClick }: CardProps) => {
  return (
    <div className={`card ${centered ? 'card--centered' : ''} ${className}`} onClick={onClick}>
      {children}
    </div>
  )
}

export default Card
