import { type ReactNode, useEffect, useRef } from 'react'

interface ModalProps {
  title: string
  open: boolean
  children: ReactNode
}

export function Modal({ title, open, children }: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    if (open) {
      dialogRef.current?.focus()
    }
  }, [open])

  if (!open) return null

  return (
    <dialog className="modal" ref={dialogRef} open>
      <div className="modal__wrapper">
        <div className="container">
          <h1 className="modal__title display-2">{title}</h1>

          <div className="modal__content">{children}</div>
        </div>
      </div>
    </dialog>
  )
}
