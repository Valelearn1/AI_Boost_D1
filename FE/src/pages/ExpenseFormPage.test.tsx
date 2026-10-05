import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { CATEGORIES, OCTOBER_EXPENSES, OCTOBER_ROUTES, OCTOBER_SUMMARY, RISTORANTI } from '../test/fixtures'
import { mockApi, ok, sentBody } from '../test/mockApi'
import { renderApp } from '../test/render'

const SAVED = { id: 11, amount: 12.5, date: '2026-10-05', description: 'Pranzo', category: RISTORANTI }

describe('pagina spesa', () => {
  it('salva una nuova spesa e torna al mese evidenziandola', async () => {
    const fetchMock = mockApi({
      'GET /api/categories': ok(CATEGORIES),
      'POST /api/expenses': { status: 201, body: SAVED },
      'GET /api/summary?month=2026-10': ok(OCTOBER_SUMMARY),
      'GET /api/expenses?month=2026-10': ok([SAVED, ...OCTOBER_EXPENSES]),
    })
    const user = userEvent.setup()
    renderApp('/spese/nuova')

    expect(screen.getByRole('heading', { level: 1, name: 'Nuova spesa' })).toBeInTheDocument()
    await user.type(await screen.findByLabelText('Importo'), '12,50')
    await user.click(screen.getByRole('radio', { name: 'Ristoranti' }))
    await user.type(screen.getByLabelText('Descrizione (facoltativa)'), 'Pranzo')
    await user.click(screen.getByRole('button', { name: 'Salva spesa' }))

    expect(await screen.findByRole('heading', { level: 1, name: 'Ottobre 2026' })).toBeInTheDocument()
    expect(await screen.findByText('appena salvata')).toBeInTheDocument()
    expect(sentBody(fetchMock, 'POST /api/expenses')).toEqual({
      amount: 12.5,
      date: '2026-10-05',
      description: 'Pranzo',
      categoryId: 4,
    })
  })

  it('modifica una spesa esistente', async () => {
    const fetchMock = mockApi({
      ...OCTOBER_ROUTES,
      'GET /api/categories': ok(CATEGORIES),
      'GET /api/expenses/8': ok(OCTOBER_EXPENSES[2]),
      'PUT /api/expenses/8': ok({ ...OCTOBER_EXPENSES[2], amount: 40 }),
    })
    const user = userEvent.setup()
    renderApp('/spese/8')

    const amount = await screen.findByLabelText('Importo')
    expect(screen.getByRole('heading', { level: 1, name: 'Modifica spesa' })).toBeInTheDocument()
    await user.clear(amount)
    await user.type(amount, '40')
    await user.click(screen.getByRole('button', { name: 'Salva modifiche' }))

    expect(await screen.findByRole('heading', { level: 1, name: 'Ottobre 2026' })).toBeInTheDocument()
    expect(sentBody(fetchMock, 'PUT /api/expenses/8')).toMatchObject({ amount: 40, categoryId: 4 })
  })

  it('elimina una spesa dopo la conferma', async () => {
    const fetchMock = mockApi({
      ...OCTOBER_ROUTES,
      'GET /api/categories': ok(CATEGORIES),
      'GET /api/expenses/8': ok(OCTOBER_EXPENSES[2]),
      'DELETE /api/expenses/8': { status: 204 },
    })
    const user = userEvent.setup()
    renderApp('/spese/8')

    await user.click(await screen.findByRole('button', { name: 'Elimina spesa' }))
    await user.click(screen.getByRole('button', { name: 'Elimina' }))

    expect(await screen.findByRole('heading', { level: 1, name: 'Ottobre 2026' })).toBeInTheDocument()
    expect(fetchMock.mock.calls.some(([url, init]) => url === '/api/expenses/8' && init?.method === 'DELETE')).toBe(true)
  })

  it('con un indirizzo non valido dice che la spesa non esiste, senza chiamare il server per la spesa', async () => {
    const fetchMock = mockApi({ 'GET /api/categories': ok(CATEGORIES) })
    renderApp('/spese/abc')

    expect(await screen.findByText('Spesa non trovata')).toBeInTheDocument()
    expect(fetchMock.mock.calls.some(([url]) => String(url).startsWith('/api/expenses'))).toBe(false)
  })

  it('mostra il messaggio del server per una spesa inesistente', async () => {
    mockApi({
      'GET /api/categories': ok(CATEGORIES),
      'GET /api/expenses/99': { status: 404, body: { detail: 'Spesa 99 non trovata' } },
    })
    renderApp('/spese/99')

    expect(await screen.findByText('Spesa 99 non trovata')).toBeInTheDocument()
  })
})
