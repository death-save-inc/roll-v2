import { useRef } from 'react'

interface FileInputProps {
  id: string
  value: string
  onChange: (base64: string) => void
}

export function FileInput({ id, value, onChange }: FileInputProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const resized = await resizeImage(file)
      onChange(resized)
    } catch {
      // silently ignore image errors
    }
    // Reset input so the same file can be re-selected
    if (inputRef.current) inputRef.current.value = ''
  }

  const handleRemove = (e: React.MouseEvent) => {
    e.preventDefault()
    onChange('')
  }

  return (
    <div className="file-input">
      <input
        ref={inputRef}
        className="file-input__field"
        type="file"
        id={`artwork-${id}`}
        accept="image/png, image/jpeg"
        onChange={handleChange}
      />
      {value ? (
        <button className="button" type="button" onClick={handleRemove}>
          Remove artwork
        </button>
      ) : (
        <label className="button" htmlFor={`artwork-${id}`}>
          Add artwork
        </label>
      )}
    </div>
  )
}

const resizeImage = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        const MAX = 480
        let { width, height } = img
        if (width > height) {
          if (width > MAX) {
            height = Math.round(height * (MAX / width))
            width = MAX
          }
        } else {
          if (height > MAX) {
            width = Math.round(width * (MAX / height))
            height = MAX
          }
        }
        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')!
        ctx.drawImage(img, 0, 0, width, height)
        resolve(canvas.toDataURL('image/jpeg', 0.85))
      }
      img.onerror = reject
      img.src = e.target!.result as string
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}
