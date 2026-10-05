import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { INHERITED_OCTOBER_BUDGET, OCTOBER_ROUTES, OCTOBER_SUMMARY } from '../test/fixtures'
import { mockApi, ok, sentBody } from '../test/mockApi'
import { renderApp } from '../test/render'

const OWN_BUDGET = { month: '2026-10', amount: 1300, sourceMonth: '2026-10' }

describe('schermata Budget', () => {
  it('spiega da quale mese arriva il budget ereditato e non offre di rimuoverlo', async () => {
    mockApi({
      ...OCTOBER_ROUTES,
      'GET /api/budgets/2026-10': ok(INHERITED_OCTOBER_BUDGET),
    })
    renderApp('/budget/2026-10')

    expect(screen.getByRole('heading', { level: 1, name: 'Budget di ottobre 2026' })).toBeInTheDocument()
    expect(
      await screen.findByText('Ottobre non ha un budget proprio. Al momento vale quello di settembre 2026: 1.200,00 €.'),
    ).toBeInTheDocument()
    expect(screen.getByLabelText('Budget di ottobre')).toHaveValue('')
    expect(screen.queryByRole('button', { name: 'Rimuovi il budget di ottobre' })).not.toBeInTheDocument()
  })

  it('mostra in anteprima quanto rimarrebbe e salva il budget del mese', async () => {
    const fetchMock = mockApi({
      ...OCTOBER_ROUTES,
      'GET /api/budgets/2026-10': ok(INHERITED_OCTOBER_BUDGET),
      'PUT /api/budgets/2026-10': ok(OWN_BUDGET),
    })
    const user = userEvent.setup()
    renderApp('/budget/2026-10')

    await user.type(await screen.findByLabelText('Budget di ottobre'), '1.300')
    expect(screen.getByText('Con questo budget ti rimarrebbero 347,60 €.')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Salva budget' }))

    expect(sentBody(fetchMock, 'PUT /api/budgets/2026-10')).toEqual({ amount: 1300 })
    expect(await screen.findByRole('heading', { level: 1, name: 'Ottobre 2026' })).toBeInTheDocument()
  })

  it('avvisa in anteprima se il budget è già superato', async () => {
    mockApi({
      ...OCTOBER_ROUTES,
      'GET /api/budgets/2026-10': ok(INHERITED_OCTOBER_BUDGET),
    })
    const user = userEvent.setup()
    renderApp('/budget/2026-10')

    await user.type(await screen.findByLabelText('Budget di ottobre'), '900')
    expect(screen.getByText('Con questo budget saresti già oltre di 52,40 €.')).toBeInTheDocument()
  })

  it('precompila il budget proprio e permette di rimuoverlo', async () => {
    const fetchMock = mockApi({
      ...OCTOBER_ROUTES,
      'GET /api/budgets/2026-10': ok(OWN_BUDGET),
      'DELETE /api/budgets/2026-10': { status: 204 },
    })
    const user = userEvent.setup()
    renderApp('/budget/2026-10')

    expect(await screen.findByLabelText('Budget di ottobre')).toHaveValue('1300,00')
    await user.click(screen.getByRole('button', { name: 'Rimuovi il budget di ottobre' }))

    expect(await screen.findByRole('heading', { level: 1, name: 'Ottobre 2026' })).toBeInTheDocument()
    expect(fetchMock.mock.calls.some(([url, init]) => url === '/api/budgets/2026-10' && init?.method === 'DELETE')).toBe(true)
  })

  it('senza alcun budget lo dice chiaramente', async () => {
    mockApi({
      ...OCTOBER_ROUTES,
      'GET /api/summary?month=2026-10': ok({ ...OCTOBER_SUMMARY, budget: null, budgetSourceMonth: null, remaining: null }),
      'GET /api/budgets/2026-10': ok({ month: '2026-10', amount: null, sourceMonth: null }),
    })
    renderApp('/budget/2026-10')

    expect(await screen.findByText('Nessun budget impostato per ottobre 2026 né per i mesi precedenti.')).toBeInTheDocument()
  })

  it('rifiuta un importo non valido senza chiamare il server', async () => {
    const fetchMock = mockApi({
      ...OCTOBER_ROUTES,
      'GET /api/budgets/2026-10': ok(INHERITED_OCTOBER_BUDGET),
    })
    const user = userEvent.setup()
    renderApp('/budget/2026-10')

    await user.type(await screen.findByLabelText('Budget di ottobre'), '0')
    await user.click(screen.getByRole('button', { name: 'Salva budget' }))

    expect(screen.getByText("L'importo deve essere maggiore di zero")).toBeInTheDocument()
    expect(fetchMock.mock.calls.some(([, init]) => init?.method === 'PUT')).toBe(false)
  })

  it('con un mese non valido nell’indirizzo lo segnala', async () => {
    mockApi({})
    renderApp('/budget/ottobre')

    expect(screen.getByText('Mese non valido')).toBeInTheDocument()
  })
})
