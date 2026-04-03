import { type ReactNode } from "react";

interface ModalProps {
  title: string;
  open: boolean;
  children: ReactNode;
}

export function Modal({ title, open, children }: ModalProps) {
  if (!open) return null;

  return (
    <div className="modal" role="dialog" aria-modal="true">
      <h1 className="modal__title">{title}</h1>
      <div className="modal__content">{children}</div>
    </div>
  );
}
