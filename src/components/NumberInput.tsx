import { useEffect, useId, useState } from 'react'

interface NumberInputProps {
  label?: string
  value: number
  onChange: (value: number) => void
  className?: string
  variant?: 'text' | 'button'
}

const baseClasses = 'flex flex-col items-center'
const labelClasses = 'text-primary text-2xl'
const wrapperClasses = 'flex gap-2 items-center w-full justify-between'
const inputClasses =
  'text-5xl text-primary text-center cursor-pointer w-8 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none pointer-events-auto'
const variantButtonClasses = {
  text: 'text-5xl text-primary cursor-pointer pointer-events-auto',
  button: 'h-10 w-10 bg-primary text-primary-inverse text-2xl cursor-pointer pointer-events-auto',
}

const NumberInput = ({ label, value, onChange, className, variant = 'text' }: NumberInputProps) => {
  const id = useId()
  const [localValue, setLocalValue] = useState(String(value))

  useEffect(() => {
    setLocalValue(String(value))
  }, [value])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalValue(e.target.value)
    const num = e.target.valueAsNumber
    if (!isNaN(num)) onChange(num)
  }

  const handleBlur = () => {
    if (localValue === '' || isNaN(Number(localValue))) {
      setLocalValue('0')
      onChange(0)
    }
  }

  const step = (delta: number) => {
    const next = (isNaN(value) ? 0 : value) + delta
    onChange(next)
    setLocalValue(String(next))
  }

  return (
    <div className={`${baseClasses} ${className}`}>
      {label && (
        <label htmlFor={id} className={labelClasses}>
          {label}
        </label>
      )}
      <div className={wrapperClasses}>
        <button
          className={variantButtonClasses[variant]}
          type="button"
          aria-label={`Decrease ${label}`}
          onClick={() => step(-1)}
        >
          -
        </button>
        <input
          id={id}
          type="number"
          value={localValue}
          onChange={handleChange}
          onBlur={handleBlur}
          className={inputClasses}
        />
        <button
          className={variantButtonClasses[variant]}
          type="button"
          aria-label={`Increase ${label}`}
          onClick={() => step(1)}
        >
          +
        </button>
      </div>
    </div>
  )
}

export default NumberInput
