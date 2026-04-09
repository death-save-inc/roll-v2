interface NumberInputProps {
  value: number
  onChange: (value: number) => void
  small?: boolean
}

export function NumberInput({ value, onChange, small = false }: NumberInputProps) {
  const displayValue = value > 0 ? `+${value}` : `${value}`

  return (
    <div className={`number-input${small ? ' number-input--small' : ''}`}>
      <button
        className={`number-input__button${small ? '' : ' button button--icon'}`}
        type="button"
        onClick={() => onChange(value - 1)}
      >
        -
      </button>
      <span className="number-input__input">{displayValue}</span>
      <button
        className={`number-input__button${small ? '' : ' button button--icon'}`}
        type="button"
        onClick={() => onChange(value + 1)}
      >
        +
      </button>
    </div>
  )
}
