import { useEffect, useState } from 'react'
import { ApiError, toApiError } from '../api/http'

export interface AsyncState<T> {
  data: T | undefined
  error: ApiError | null
  loading: boolean
  reload: () => void
}

interface Result<T> {
  key: string
  depsKey: string
  data?: T
  error: ApiError | null
}

/**
 * Carica dati asincroni legati a `deps`. Durante un `reload` mostra ancora i dati precedenti
 * (niente sfarfallio dopo un salvataggio); quando cambiano le `deps` li nasconde (niente dati di un altro mese).
 */
export function useAsync<T>(load: () => Promise<T>, deps: readonly unknown[]): AsyncState<T> {
  const [version, setVersion] = useState(0)
  const depsKey = JSON.stringify(deps)
  const key = `${depsKey}#${version}`
  const [result, setResult] = useState<Result<T> | null>(null)

  useEffect(() => {
    let cancelled = false
    load().then(
      (data) => {
        if (!cancelled) setResult({ key, depsKey, data, error: null })
      },
      (error: unknown) => {
        if (!cancelled) setResult((previous) => ({ key, depsKey, data: previous?.depsKey === depsKey ? previous.data : undefined, error: toApiError(error) }))
      },
    )
    return () => {
      cancelled = true
    }
    // `key` riassume deps e version: `load` cambia a ogni render e non deve riavviare il caricamento
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  const loading = result?.key !== key
  return {
    data: result?.depsKey === depsKey ? result.data : undefined,
    error: loading ? null : (result?.error ?? null),
    loading,
    reload: () => setVersion((value) => value + 1),
  }
}
