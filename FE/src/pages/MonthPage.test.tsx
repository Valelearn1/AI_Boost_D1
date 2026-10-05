import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { RouterProvider, createMemoryRouter } from 'react-router'
import { describe, expect, it, vi } from 'vitest'
import { AppRoutes } from '../App'
import { OCTOBER_ROUTES, OCTOBER_SUMMARY, emptySummary } from '../test/fixtures'
import { mockApi, ok } from '../test/mockApi'
import { renderApp } from '../test/render'

describe('schermata Mese', () => {
  it('mostra speso, budget ereditato, rimanente e giorni restanti', async () => {
    mockApi(OCTOBER_ROUTES)
    renderApp('/?mese=2026-10')

    expect(await screen.findByText('952,40 €')).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 1, name: 'Ottobre 2026' })).toBeInTheDocument()
    expect(screen.getByText('1.200,00 €')).toBeInTheDocument()
    expect(screen.getByText('da settembre')).toBeInTheDocument()
    expect(screen.getByText('247,60 €')).toBeInTheDocument()
    expect(screen.getByText('27 giorni')).toBeInTheDocument()
  })

  it('raggruppa le spese per giorno con il totale del giorno', async () => {
    mockApi(OCTOBER_ROUTES)
    renderApp('/?mese=2026-10')

    const today = await screen.findByRole('region', { name: 'Lunedì 5 ottobre' })
    expect(within(today).getByText('50,00 €')).toBeInTheDocument()
    expect(within(today).getByText('Caffè e brioche')).toBeInTheDocument()
    expect(within(today).getByText('Esselunga')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Pizzeria Da Gino/ })).toHaveAttribute('href', '/spese/8')
  })

  it('filtra l’elenco toccando una categoria e torna a mostrare tutto', async () => {
    mockApi(OCTOBER_ROUTES)
    const user = userEvent.setup()
    renderApp('/?mese=2026-10')

    await user.click(await screen.findByRole('button', { name: /Ristoranti/ }))

    expect(screen.getByRole('button', { name: /Ristoranti/ })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByText('Pizzeria Da Gino')).toBeInTheDocument()
    expect(screen.queryByText('Esselunga')).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Mostra tutte' }))
    expect(screen.getByText('Esselunga')).toBeInTheDocument()
  })

  it('mostra il superamento del budget come fatto, senza allarmi', async () => {
    mockApi({
      ...OCTOBER_ROUTES,
      'GET /api/summary?month=2026-10': ok({ ...OCTOBER_SUMMARY, budget: 910.1, remaining: -42.3 }),
    })
    renderApp('/?mese=2026-10')

    expect(await screen.findByText('Superato di')).toBeInTheDocument()
    expect(screen.getByText('42,30 €')).toBeInTheDocument()
  })

  it('evidenzia la spesa appena salvata', async () => {
    mockApi(OCTOBER_ROUTES)
    renderApp({ pathname: '/', search: '?mese=2026-10', state: { savedId: 10 } })

    const row = await screen.findByRole('link', { name: /Caffè e brioche/ })
    expect(within(row).getByText('appena salvata')).toBeInTheDocument()
  })

  it('non rievidenzia la spesa salvata tornando alla pagina dalla cronologia', async () => {
    mockApi({ ...OCTOBER_ROUTES, 'GET /api/categories': ok([]), 'GET /api/expenses/10': ok(null) })
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date(2026, 9, 5, 12))
    const router = createMemoryRouter([{ path: '*', element: <AppRoutes /> }], {
      initialEntries: ['/spese/nuova', { pathname: '/', search: '?mese=2026-10', state: { savedId: 10 } }],
      initialIndex: 1,
    })
    render(<RouterProvider router={router} />)
    expect(await screen.findByText('appena salvata')).toBeInTheDocument()

    await act(() => router.navigate(-1))
    await act(() => router.navigate(1))

    expect(await screen.findByText('Caffè e brioche')).toBeInTheDocument()
    expect(screen.queryByText('appena salvata')).not.toBeInTheDocument()
  })

  it('mostra un mese vuoto con l’invito ad aggiungere', async () => {
    mockApi({
      'GET /api/summary?month=2026-11': ok(emptySummary('2026-11')),
      'GET /api/expenses?month=2026-11': ok([]),
    })
    renderApp('/?mese=2026-11')

    const message = await screen.findByText('Nessuna spesa a novembre 2026.')
    const empty = message.parentElement as HTMLElement
    expect(within(empty).getByRole('link', { name: 'Aggiungi spesa' })).toHaveAttribute('href', '/spese/nuova')
    expect(screen.getByText('30 giorni')).toBeInTheDocument()
  })

  it('passa al mese successivo con la freccia', async () => {
    mockApi({
      ...OCTOBER_ROUTES,
      'GET /api/summary?month=2026-11': ok(emptySummary('2026-11')),
      'GET /api/expenses?month=2026-11': ok([]),
    })
    const user = userEvent.setup()
    renderApp('/?mese=2026-10')

    await user.click(await screen.findByRole('link', { name: 'Mese successivo, Novembre 2026' }))

    expect(screen.getByRole('heading', { level: 1, name: 'Novembre 2026' })).toBeInTheDocument()
    expect(await screen.findByText('Nessuna spesa a novembre 2026.')).toBeInTheDocument()
  })

  it('con un mese non valido nell’indirizzo mostra il mese corrente', async () => {
    mockApi(OCTOBER_ROUTES)
    renderApp('/?mese=abc')

    expect(screen.getByRole('heading', { level: 1, name: 'Ottobre 2026' })).toBeInTheDocument()
    expect(await screen.findByText('952,40 €')).toBeInTheDocument()
  })

  it('se il server non risponde lo dice e permette di riprovare', async () => {
    mockApi({
      'GET /api/summary?month=2026-10': ['network-error', ok(OCTOBER_SUMMARY)],
      'GET /api/expenses?month=2026-10': ok([]),
    })
    const user = userEvent.setup()
    renderApp('/?mese=2026-10')

    expect(await screen.findByText('Impossibile raggiungere il server')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Riprova' }))
    expect(await screen.findByText('952,40 €')).toBeInTheDocument()
  })
})
