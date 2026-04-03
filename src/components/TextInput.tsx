interface TextInputProps {
  name: string;
  id: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function TextInput({
  name,
  id,
  value,
  onChange,
  placeholder,
}: TextInputProps) {
  return (
    <div className="text-input">
      <label className="text-input__label" htmlFor={`${name}-${id}`}>
        {name}
      </label>
      <input
        className="text-input__field"
        type="text"
        id={`${name}-${id}`}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
