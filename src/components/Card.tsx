import { type ReactNode } from "react";

interface CardProps {
  children?: ReactNode;
  centered?: boolean;
  className?: string;
  onClick?: () => void;
}

export function Card({
  children,
  centered = false,
  className = "",
  onClick,
}: CardProps) {
  return (
    <div
      className={`card${centered ? " card--centered" : ""}${className ? ` ${className}` : ""}`}
      onClick={onClick}
      style={onClick ? { cursor: "pointer" } : undefined}
    >
      {children}
    </div>
  );
}
