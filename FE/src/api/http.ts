export const NETWORK_ERROR =
  'Impossibile raggiungere il server. Controlla che il Mac sia acceso e connesso alla stessa rete Wi-Fi del telefono.'

export class ApiError extends Error {
  readonly status: number
  readonly errors: Record<string, string>

  constructor(status: number, message: string, errors: Record<string, string> = {}) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.errors = errors
  }

  /** Server spento, Mac in stop o telefono fuori dalla rete di casa. */
  get isNetwork(): boolean {
    return this.status === 0
  }
}

/** Stati con cui il proxy di Vite risponde, senza corpo, quando il backend è spento. */
const GATEWAY_STATUSES = [500, 502, 503, 504]

export async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = { Accept: 'application/json' }
  if (init.body !== undefined) {
    headers['Content-Type'] = 'application/json'
  }

  let response: Response
  try {
    response = await fetch(`/api${path}`, { ...init, headers })
  } catch {
    throw new ApiError(0, NETWORK_ERROR)
  }

  if (response.status === 204) {
    return undefined as T
  }
  const body: unknown = await response.json().catch(() => null)
  if (response.ok) {
    return body as T
  }

  const problem = (body ?? {}) as { detail?: unknown; errors?: Record<string, string> }
  if (typeof problem.detail === 'string') {
    throw new ApiError(response.status, problem.detail, problem.errors ?? {})
  }
  if (body === null && GATEWAY_STATUSES.includes(response.status)) {
    throw new ApiError(0, NETWORK_ERROR)
  }
  throw new ApiError(response.status, `Errore del server (${response.status})`)
}

export function jsonBody(method: 'POST' | 'PUT', data: unknown): RequestInit {
  return { method, body: JSON.stringify(data) }
}

export function toApiError(error: unknown): ApiError {
  return error instanceof ApiError ? error : new ApiError(0, NETWORK_ERROR)
}
