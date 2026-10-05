import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { ApiError, NETWORK_ERROR } from '../api/http'
import type { Expense, ExpenseInput } from '../api/types'
import { CATEGORIES, RISTORANTI } from '../test/fixtures'
import { ExpenseForm, type ExpenseFormProps } from './ExpenseForm'

function setup(props: Partial<ExpenseFormProps> = {}) {
  const onSubmit = vi.fn<(input: ExpenseInput) => Promise<void>>().mockResolvedValue(undefined)
  const user = userEvent.setup()
  render(<ExpenseForm categories={CATEGORIES} initial={null} today="2026-10-05" onSubmit={onSubmit} {...props} />)
  return { user, onSubmit }
}

const PIZZERIA: Expense = { id: 8, amount: 38, date: '2026-10-04', description: 'Pizzeria Da Gino', category: RISTORANTI }

describe('ExpenseForm', () => {
  it('non invia e spiega cosa manca', async () => {
    const { user, onSubmit } = setup()

    await user.click(screen.getByRole('button', { name: 'Salva spesa' }))

    expect(screen.getByText('Inserisci un importo')).toBeInTheDocument()
    expect(screen.getByText('Scegli una categoria')).toBeInTheDocument()
    expect(screen.getByLabelText('Importo')).toHaveAttribute('aria-invalid', 'true')
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('invia un importo con la virgola, la categoria, oggi e la descrizione', async () => {
    const { user, onSubmit } = setup()

    await user.type(screen.getByLabelText('Importo'), '12,50')
    await user.click(screen.getByRole('radio', { name: 'Ristoranti' }))
    await user.type(screen.getByLabelText('Descrizione (facoltativa)'), ' Pranzo ')
    await user.click(screen.getByRole('button', { name: 'Salva spesa' }))

    expect(onSubmit).toHaveBeenCalledWith({ amount: 12.5, date: '2026-10-05', description: 'Pranzo', categoryId: 4 })
  })

  it('usa la data di ieri e trasforma una descrizione vuota in null', async () => {
    const { user, onSubmit } = setup()

    await user.type(screen.getByLabelText('Importo'), '9')
    await user.click(screen.getByRole('radio', { name: 'Spesa' }))
    await user.click(screen.getByRole('radio', { name: 'Ieri' }))
    await user.type(screen.getByLabelText('Descrizione (facoltativa)'), '   ')
    await user.click(screen.getByRole('button', { name: 'Salva spesa' }))

    expect(onSubmit).toHaveBeenCalledWith({ amount: 9, date: '2026-10-04', description: null, categoryId: 1 })
  })

  it('permette di scegliere un’altra data', async () => {
    const { user, onSubmit } = setup()

    await user.type(screen.getByLabelText('Importo'), '20')
    await user.click(screen.getByRole('radio', { name: 'Casa' }))
    await user.click(screen.getByRole('radio', { name: 'Altra data…' }))
    const dateInput = screen.getByLabelText('Data della spesa')
    await user.clear(dateInput)
    await user.type(dateInput, '2026-09-28')
    await user.click(screen.getByRole('button', { name: 'Salva spesa' }))

    expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ date: '2026-09-28' }))
  })

  it('rifiuta un importo con troppi decimali', async () => {
    const { user, onSubmit } = setup()

    await user.type(screen.getByLabelText('Importo'), '12,345')
    await user.click(screen.getByRole('radio', { name: 'Casa' }))
    await user.click(screen.getByRole('button', { name: 'Salva spesa' }))

    expect(screen.getByText('Importo non valido: usa solo cifre e al massimo 2 decimali')).toBeInTheDocument()
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('con un doppio tocco su Salva invia una sola volta', async () => {
    const { user, onSubmit } = setup()
    onSubmit.mockReturnValue(new Promise(() => {}))

    await user.type(screen.getByLabelText('Importo'), '5')
    await user.click(screen.getByRole('radio', { name: 'Casa' }))
    await user.dblClick(screen.getByRole('button', { name: 'Salva spesa' }))

    expect(onSubmit).toHaveBeenCalledTimes(1)
    expect(screen.getByRole('button', { name: 'Salvataggio…' })).toBeDisabled()
  })

  it('mostra gli errori di campo restituiti dal server', async () => {
    const { user, onSubmit } = setup()
    onSubmit.mockRejectedValue(new ApiError(400, 'Dati non validi', { description: 'La descrizione può avere al massimo 100 caratteri' }))

    await user.type(screen.getByLabelText('Importo'), '5')
    await user.click(screen.getByRole('radio', { name: 'Casa' }))
    await user.click(screen.getByRole('button', { name: 'Salva spesa' }))

    expect(await screen.findByText('La descrizione può avere al massimo 100 caratteri')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Salva spesa' })).toBeEnabled()
  })

  it('se il server non risponde avvisa e conserva quanto scritto', async () => {
    const { user, onSubmit } = setup()
    onSubmit.mockRejectedValue(new ApiError(0, NETWORK_ERROR))

    await user.type(screen.getByLabelText('Importo'), '7,90')
    await user.click(screen.getByRole('radio', { name: 'Casa' }))
    await user.click(screen.getByRole('button', { name: 'Salva spesa' }))

    expect(await screen.findByText(NETWORK_ERROR)).toBeInTheDocument()
    expect(screen.getByLabelText('Importo')).toHaveValue('7,90')
  })

  it('in modifica precompila i campi e chiede conferma prima di eliminare', async () => {
    const onDelete = vi.fn<() => Promise<void>>().mockResolvedValue(undefined)
    const { user } = setup({ initial: PIZZERIA, onDelete })

    expect(screen.getByLabelText('Importo')).toHaveValue('38,00')
    expect(screen.getByRole('radio', { name: 'Ristoranti' })).toBeChecked()
    expect(screen.getByRole('radio', { name: 'Ieri' })).toBeChecked()
    expect(screen.getByLabelText('Descrizione (facoltativa)')).toHaveValue('Pizzeria Da Gino')

    await user.click(screen.getByRole('button', { name: 'Elimina spesa' }))
    expect(screen.getByText("Eliminare questa spesa? L'operazione non si può annullare.")).toBeInTheDocument()
    expect(onDelete).not.toHaveBeenCalled()

    await user.click(screen.getByRole('button', { name: 'Elimina' }))
    expect(onDelete).toHaveBeenCalledTimes(1)
  })
})
