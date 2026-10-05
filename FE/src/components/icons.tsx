import type { ReactNode } from 'react'

/** Icone a tratto disegnate a mano: stesso spessore (2px), angoli arrotondati. */
function Icon({ children, size = 24 }: { children: ReactNode; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      {children}
    </svg>
  )
}

export function ChevronLeftIcon() {
  return <Icon><path d="M15 18l-6-6 6-6" /></Icon>
}

export function ChevronRightIcon() {
  return <Icon><path d="M9 18l6-6-6-6" /></Icon>
}

export function PlusIcon() {
  return <Icon size={28}><path d="M12 5v14M5 12h14" /></Icon>
}

export function CalendarIcon() {
  return (
    <Icon>
      <rect x="3.5" y="5" width="17" height="15.5" rx="1.5" />
      <path d="M3.5 10h17M8 3v4M16 3v4" />
    </Icon>
  )
}

export function TagIcon() {
  return (
    <Icon>
      <path d="M20.4 13.6l-6.8 6.8a1.6 1.6 0 0 1-2.3 0L3.5 12.6V3.5h9.1l7.8 7.8a1.6 1.6 0 0 1 0 2.3z" />
      <path d="M8 8h.01" />
    </Icon>
  )
}

export function PencilIcon({ size = 24 }: { size?: number }) {
  return (
    <Icon size={size}>
      <path d="M13.5 6.5l4 4" />
      <path d="M4 20l1-4.5L15.8 4.7a1.8 1.8 0 0 1 2.5 0l1 1a1.8 1.8 0 0 1 0 2.5L8.5 19 4 20z" />
    </Icon>
  )
}
