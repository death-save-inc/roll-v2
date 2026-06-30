import { useRef } from 'react'

import Button from './Button'

interface FileInputProps {
  id: string
  value: string
  onChange: (base64: string) => void
}

const labelClasses =
  'w-full flex items-center justify-center text-2xl px-4 pointer-events-auto cursor-pointer h-10 bg-primary text-primary-inverse'

const FileInput = ({ id, value, onChange }: FileInputProps) => {
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
    if (inputRef.current) inputRef.current.value = ''
  }

  const handleRemove = (e: React.MouseEvent) => {
    e.preventDefault()
    onChange('')
  }

  return (
    <div className="w-full">
      <input
        ref={inputRef}
        className="hidden"
        type="file"
        id={`artwork-${id}`}
        accept="image/png, image/jpeg"
        onChange={handleChange}
      />
      {value ? (
        <Button size="small" label="Remove artwork" className="w-full" handleClick={handleRemove} />
      ) : (
        <label className={labelClasses} htmlFor={`artwork-${id}`}>
          Add artwork
        </label>
      )}
    </div>
  )
}

export default FileInput

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
