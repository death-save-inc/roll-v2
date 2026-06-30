interface TextInputProps {
  name: string
  id: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

const inputClasses =
  'block w-full text-3xl font-charted line-height-1 text-primary-inverse border-solid border-1 border-primary bg-surface-inverse shadow-[inset_-2px_2px_0_#000]'

const TextInput = ({ name, id, value, onChange, placeholder }: TextInputProps) => {
  return (
    <input
      className={inputClasses}
      type="text"
      id={`${name}-${id}`}
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
    />
  )
}

export default TextInput
