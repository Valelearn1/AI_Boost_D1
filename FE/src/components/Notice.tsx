import { motion } from 'motion/react'
import type { ReactNode } from 'react'
import type { ApiError } from '../api/http'
import './Notice.css'

interface NoticeProps {
  tone: 'error' | 'info'
  title?: string
  children: ReactNode
  action?: ReactNode
}

export function Notice({ tone, title, children, action }: NoticeProps) {
  return (
    <motion.div
      className={`notice notice--${tone}`}
      role={tone === 'error' ? 'alert' : 'status'}
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
    >
      {title ? <p className="notice__title">{title}</p> : null}
      <p className="notice__text">{children}</p>
      {action}
    </motion.div>
  )
}

/** Errore di caricamento di una schermata, con "Riprova". */
export function LoadError({ error, onRetry }: { error: ApiError; onRetry: () => void }) {
  const retry = (
    <button type="button" className="btn btn--secondary" onClick={onRetry}>
      Riprova
    </button>
  )
  if (error.isNetwork) {
    return (
      <Notice tone="error" title="Impossibile raggiungere il server" action={retry}>
        Controlla che il Mac sia acceso e connesso alla stessa rete Wi-Fi del telefono.
      </Notice>
    )
  }
  return (
    <Notice tone="error" title="Impossibile caricare i dati" action={retry}>
      {error.message}
    </Notice>
  )
}
