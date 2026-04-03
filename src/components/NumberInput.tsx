interface NumberInputProps {
  name: string
  id: string
  value: number
  onChange: (value: number) => void
  small?: boolean
}

export function NumberInput({ name, id, value, onChange, small = false }: NumberInputProps) {
  const displayValue = value > 0 ? `+${value}` : `${value}`

  return (
    <div className={`number-input${small ? ' number-input--small' : ''}`}>
      <label className="number-input__label" htmlFor={`${name}-${id}`}>
        {name}
      </label>
      <div className="number-input__controls">
        <button
          className="number-input__btn"
          type="button"
          onClick={() => onChange(value - 1)}
          aria-label="Decrease"
        >
          -
        </button>
        <span className="number-input__value" id={`${name}-${id}`}>
          {displayValue}
        </span>
        <button
          className="number-input__btn"
          type="button"
          onClick={() => onChange(value + 1)}
          aria-label="Increase"
        >
          +
        </button>
      </div>
    </div>
  )
}
