import type { CSSProperties, ReactNode } from 'react'

interface HighlightProps {
  color: string
  children: ReactNode
  /** Traccia la passata da sinistra a destra: solo quando nasce (DESIGN.md, Movimento). */
  animate?: boolean
  className?: string
}

/** La passata di evidenziatore: colore piatto dietro al 70% inferiore del testo. */
export function Highlight({ color, children, animate = false, className }: HighlightProps) {
  const classes = ['swipe', animate ? 'swipe--animate' : null, className].filter(Boolean).join(' ')
  return (
    <span className={classes} style={{ '--swipe': color } as CSSProperties}>
      {children}
    </span>
  )
}
