import { describe, expect, it, vi } from 'vitest'
import { ApiError, NETWORK_ERROR, jsonBody, request } from './http'

function respondWith(status: number, body?: unknown) {
  // parametri dichiarati per tipizzare mock.calls (url, init)
  const fetchMock = vi.fn<(input: RequestInfo | URL, init?: RequestInit) => Promise<Response>>(
    async () =>
      new Response(body === undefined ? null : JSON.stringify(body), {
        status,
        headers: { 'Content-Type': 'application/json' },
      }),
  )
  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}

async function failure(promise: Promise<unknown>): Promise<ApiError> {
  try {
    await promise
  } catch (error) {
    if (error instanceof ApiError) return error
    throw error
  }
  throw new Error('La richiesta doveva fallire')
}

describe('request', () => {
  it('chiama /api con un percorso relativo e restituisce il JSON', async () => {
    const fetchMock = respondWith(200, [{ id: 1 }])

    await expect(request('/categories')).resolves.toEqual([{ id: 1 }])
    expect(fetchMock.mock.calls[0][0]).toBe('/api/categories')
  })

  it('invia il corpo in JSON', async () => {
    const fetchMock = respondWith(201, { id: 7 })

    await request('/categories', jsonBody('POST', { name: 'Regali' }))

    const init = fetchMock.mock.calls[0][1]
    expect(init?.method).toBe('POST')
    expect(init?.body).toBe('{"name":"Regali"}')
    expect(init?.headers).toMatchObject({ 'Content-Type': 'application/json' })
  })

  it('restituisce undefined per 204', async () => {
    respondWith(204)

    await expect(request('/expenses/1', { method: 'DELETE' })).resolves.toBeUndefined()
  })

  it('trasforma un ProblemDetail in ApiError con gli errori dei campi', async () => {
    respondWith(400, { detail: 'Dati non validi', errors: { amount: "L'importo è obbligatorio" } })

    const error = await failure(request('/expenses', jsonBody('POST', {})))

    expect(error.status).toBe(400)
    expect(error.message).toBe('Dati non validi')
    expect(error.errors).toEqual({ amount: "L'importo è obbligatorio" })
    expect(error.isNetwork).toBe(false)
  })

  it('segnala il server irraggiungibile quando fetch fallisce', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => { throw new TypeError('Failed to fetch') }))

    const error = await failure(request('/summary?month=2026-10'))

    expect(error.isNetwork).toBe(true)
    expect(error.message).toBe(NETWORK_ERROR)
  })

  it('segnala il server irraggiungibile quando il proxy risponde senza corpo (backend spento)', async () => {
    respondWith(502)

    const error = await failure(request('/categories'))

    expect(error.isNetwork).toBe(true)
  })

  it('distingue un errore del server con corpo JSON ma senza detail', async () => {
    respondWith(500, { timestamp: '2026-10-05', status: 500, error: 'Internal Server Error' })

    const error = await failure(request('/categories'))

    expect(error.isNetwork).toBe(false)
    expect(error.message).toBe('Errore del server (500)')
  })
})
