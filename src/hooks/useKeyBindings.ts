import { useEffect } from 'react'

interface Options {
  onRoll: () => void
}

export function useKeyBindings({ onRoll }: Options): void {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement
      const isInput = ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)
      if (isInput) return

      if (e.key === 'r' || e.key === 'R') {
        onRoll()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onRoll])
}
