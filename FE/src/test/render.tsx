import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { vi } from 'vitest'
import { AppRoutes } from '../App'

type Entry = string | { pathname: string; search?: string; state?: unknown }

/** Monta l'app vera (routing compreso) a un indirizzo, con "oggi" = lunedì 5 ottobre 2026. */
export function renderApp(entry: Entry) {
  vi.useFakeTimers({ toFake: ['Date'] })
  vi.setSystemTime(new Date(2026, 9, 5, 12))
  return render(
    <MemoryRouter initialEntries={[entry]}>
      <AppRoutes />
    </MemoryRouter>,
  )
}
