import { useEffect } from 'react'

interface Options {
  onRoll: () => void
  onOpenModal: () => void
  onCloseModal: () => void
  onDMModifier: (delta: number) => void
}

export function useKeyBindings({ onRoll, onOpenModal, onCloseModal, onDMModifier }: Options): void {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement
      const isInput = ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)
      if (isInput) return

      if (e.key === 'r' || e.key === 'R') {
        onRoll()
      } else if (e.key === 'e' || e.key === 'E') {
        onOpenModal()
      } else if (e.key === 'Escape') {
        onCloseModal()
      } else if (e.key === '-') {
        onDMModifier(-1)
      } else if (e.key === '=') {
        onDMModifier(1)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onRoll, onOpenModal, onCloseModal, onDMModifier])
}
