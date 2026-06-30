import { type ReactNode, useEffect, useRef } from 'react'

import { usePlayerStore } from '../store/playerStore'

interface ModalProps {
  title: string
  children: ReactNode
}

const baseClasses =
  'bg-surface absolute top-0 bottom-0 left-0 right-0 w-full h-screen m-0 p-0 border-0 color-unset overflow-hidden z(--z-navigation) pointer-events-auto '

const titleClasses = 'absolute left-6 top-6 text-9xl text-secondary font-charted'

const modalContentClasses = 'h-full w-full overflow-y-auto pt-40'

const Modal = ({ title, children }: ModalProps) => {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const { state } = usePlayerStore()

  useEffect(() => {
    if (state.modalOpen) {
      dialogRef.current?.focus()
    }
  }, [state.modalOpen])

  if (!state.modalOpen) return null

  return (
    <dialog className={baseClasses} ref={dialogRef} open>
      <h1 className={titleClasses}>{title}</h1>
      <div className={modalContentClasses}>{children}</div>
    </dialog>
  )
}

export default Modal
