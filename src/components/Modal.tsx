import { type ReactNode, useEffect, useRef } from 'react'

import { usePlayerStore } from '../store/playerStore'

interface ModalProps {
  title: string
  children: ReactNode
}

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
    <dialog className="modal" ref={dialogRef} open>
      <div className="modal__wrapper">
        <div className="container">
          <h1 className="modal__title font-charted">{title}</h1>
          <div className="modal__content">{children}</div>
        </div>
      </div>
    </dialog>
  )
}

export default Modal
