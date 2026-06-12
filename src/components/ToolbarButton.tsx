interface ToolbarButtonProps {
  label: string
  state?: 'default' | 'disabled'
  handleClick?: (e: React.MouseEvent<HTMLButtonElement>) => void
}

const baseClasses = 'flex items-center h-8 pointer-events-auto font-charted text-[1.75rem]'

const stateClasses = {
  default: 'text-primary',
  disabled: 'cursor-not-allowed pointer-events-none text-primary-disabled',
}
export default ({ label, state = 'default', handleClick }: ToolbarButtonProps) => {
  const classes = [baseClasses, stateClasses[state]].join(' ')

  return (
    <button className={classes} onClick={handleClick} disabled={state === 'disabled'}>
      {label}
    </button>
  )
}
