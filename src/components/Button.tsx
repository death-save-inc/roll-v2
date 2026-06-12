interface ButtonProps {
  label: string
  size?: 'small' | 'large'
  intent?: 'primary' | 'secondary' | 'tertiary'
  state?: 'default' | 'disabled'
  handleClick?: (e: React.MouseEvent<HTMLButtonElement>) => void
}

const baseClasses = 'px-4 pointer-events-auto cursor-pointer'

const sizeClasses = {
  small: 'h-10 text-2xl',
  large: 'h-14 text-3xl',
}

const intentClasses = {
  primary: 'bg-primary text-primary-inverse',
  secondary: 'bg-surface-inverse text-primary',
  tertiary: 'bg-surface text-content',
}

const stateClasses = {
  default: '',
  disabled: 'opacity-50 cursor-not-allowed pointer-events-none',
}

export default ({
  label,
  size = 'large',
  intent = 'primary',
  state = 'default',
  handleClick,
}: ButtonProps) => {
  const classes = [baseClasses, sizeClasses[size], intentClasses[intent], stateClasses[state]].join(
    ' ',
  )

  return (
    <button className={classes} onClick={handleClick} disabled={state === 'disabled'}>
      {label}
    </button>
  )
}
