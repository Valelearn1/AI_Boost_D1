import { vi } from 'vitest'

export type MockResponse = { status: number; body?: unknown } | 'network-error'
type Route = MockResponse | ((init: RequestInit | undefined) => MockResponse)

export const ok = (body: unknown): MockResponse => ({ status: 200, body })

/**
 * Sostituisce fetch con risposte decise dal test, per chiave "METODO /api/percorso".
 * Un array dà risposte diverse a chiamate successive (l'ultima si ripete).
 */
export function mockApi(routes: Record<string, Route | Route[]>) {
  const calls = new Map<string, number>()
  const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    const key = `${init?.method ?? 'GET'} ${String(input)}`
    const entry = routes[key]
    if (entry === undefined) {
      throw new Error(`Richiesta non prevista nel test: ${key}`)
    }
    const index = calls.get(key) ?? 0
    calls.set(key, index + 1)
    const route = Array.isArray(entry) ? entry[Math.min(index, entry.length - 1)] : entry
    const response = typeof route === 'function' ? route(init) : route
    if (response === 'network-error') {
      throw new TypeError('Failed to fetch')
    }
    const body = response.body === undefined ? null : JSON.stringify(response.body)
    return new Response(body, { status: response.status, headers: { 'Content-Type': 'application/json' } })
  })
  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}

/** Corpo JSON inviato nella chiamata n-esima con quella chiave. */
export function sentBody(fetchMock: ReturnType<typeof mockApi>, key: string, nth = 0): unknown {
  const matching = fetchMock.mock.calls.filter(([input, init]) => `${init?.method ?? 'GET'} ${String(input)}` === key)
  const init = matching[nth]?.[1]
  return init?.body ? JSON.parse(String(init.body)) : undefined
}
