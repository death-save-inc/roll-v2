import { type ReactNode } from 'react'

interface CardProps {
  children?: ReactNode
  centered?: boolean
  className?: string
  onClick?: () => void
}

const baseClasses =
  'relative col-span-2 flex flex-col gap-2 border-4 border-black rounded-[7px] bg-surface bg-cover p-2 aspect-[3/4] [&>*]:z-[1]'
const centeredClasses = 'justify-center items-center'
const defaultClasses = 'justify-end items-start'

const Card = ({ children, centered = false, className = '', onClick }: CardProps) => {
  return (
    <div
      className={`${baseClasses} ${centered ? centeredClasses : defaultClasses} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  )
}

export default Card
