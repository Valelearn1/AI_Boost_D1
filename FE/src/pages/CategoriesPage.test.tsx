import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { CATEGORIES } from '../test/fixtures'
import { mockApi, ok, sentBody } from '../test/mockApi'
import { renderApp } from '../test/render'

describe('schermata Categorie', () => {
  it('elenca le categorie con il numero di spese', async () => {
    mockApi({ 'GET /api/categories': ok(CATEGORIES) })
    renderApp('/categorie')

    const casa = (await screen.findByText('Casa')).closest('li') as HTMLElement
    expect(within(casa).getByText('14 spese')).toBeInTheDocument()
    const altro = screen.getByText('Altro').closest('li') as HTMLElement
    expect(within(altro).getByText('Nessuna spesa')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Categorie' })).toHaveClass('active')
  })

  it('crea una categoria con nome e colore', async () => {
    const created = { id: 8, name: 'Regali', color: '#C7A6FF', expenseCount: 0 }
    const fetchMock = mockApi({
      'GET /api/categories': [ok(CATEGORIES), ok([...CATEGORIES, created])],
      'POST /api/categories': { status: 201, body: created },
    })
    const user = userEvent.setup()
    renderApp('/categorie')

    const form = await screen.findByRole('form', { name: 'Nuova categoria' })
    await user.type(within(form).getByLabelText('Nome'), '  Regali ')
    await user.click(within(form).getByRole('radio', { name: 'Lilla' }))
    await user.click(within(form).getByRole('button', { name: 'Aggiungi categoria' }))

    expect(await screen.findByText('Regali', { selector: 'li span' })).toBeInTheDocument()
    expect(sentBody(fetchMock, 'POST /api/categories')).toEqual({ name: 'Regali', color: '#C7A6FF' })
    expect(within(form).getByLabelText('Nome')).toHaveValue('')
  })

  it('mostra il nome duplicato come errore del campo', async () => {
    mockApi({
      'GET /api/categories': ok(CATEGORIES),
      'POST /api/categories': { status: 409, body: { detail: 'Esiste già una categoria «casa»' } },
    })
    const user = userEvent.setup()
    renderApp('/categorie')

    const form = await screen.findByRole('form', { name: 'Nuova categoria' })
    await user.type(within(form).getByLabelText('Nome'), 'casa')
    await user.click(within(form).getByRole('button', { name: 'Aggiungi categoria' }))

    expect(await within(form).findByText('Esiste già una categoria «casa»')).toBeInTheDocument()
  })

  it('non invia un nome vuoto o troppo lungo', async () => {
    const fetchMock = mockApi({ 'GET /api/categories': ok(CATEGORIES) })
    const user = userEvent.setup()
    renderApp('/categorie')

    const form = await screen.findByRole('form', { name: 'Nuova categoria' })
    await user.click(within(form).getByRole('button', { name: 'Aggiungi categoria' }))
    expect(within(form).getByText('Il nome è obbligatorio')).toBeInTheDocument()

    await user.type(within(form).getByLabelText('Nome'), 'x'.repeat(31))
    await user.click(within(form).getByRole('button', { name: 'Aggiungi categoria' }))
    expect(within(form).getByText('Il nome può avere al massimo 30 caratteri')).toBeInTheDocument()
    expect(fetchMock.mock.calls.some(([, init]) => init?.method === 'POST')).toBe(false)
  })

  it('rinomina una categoria', async () => {
    const fetchMock = mockApi({
      'GET /api/categories': ok(CATEGORIES),
      'PUT /api/categories/5': ok({ id: 5, name: 'Tempo libero', color: '#FF8AC2', expenseCount: 4 }),
    })
    const user = userEvent.setup()
    renderApp('/categorie')

    await user.click(await screen.findByRole('button', { name: 'Modifica Svago' }))
    const form = screen.getByRole('form', { name: 'Modifica Svago' })
    const name = within(form).getByLabelText('Nome')
    await user.clear(name)
    await user.type(name, 'Tempo libero')
    await user.click(within(form).getByRole('button', { name: 'Salva' }))

    expect(sentBody(fetchMock, 'PUT /api/categories/5')).toEqual({ name: 'Tempo libero', color: '#FF8AC2' })
    expect(await screen.findByRole('button', { name: 'Modifica Svago' })).toBeInTheDocument()
  })

  it('spiega perché non si può eliminare una categoria con spese', async () => {
    mockApi({
      'GET /api/categories': ok(CATEGORIES),
      'DELETE /api/categories/2': { status: 409, body: { detail: 'La categoria «Casa» ha 14 spese' } },
    })
    const user = userEvent.setup()
    renderApp('/categorie')

    await user.click(await screen.findByRole('button', { name: 'Modifica Casa' }))
    await user.click(screen.getByRole('button', { name: 'Elimina categoria' }))
    expect(screen.getByText('Eliminare «Casa»?')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Elimina' }))

    expect(
      await screen.findByText('La categoria «Casa» ha 14 spese. Modifica o elimina prima quelle spese.'),
    ).toBeInTheDocument()
  })

  it('elimina una categoria senza spese', async () => {
    const fetchMock = mockApi({
      'GET /api/categories': [ok(CATEGORIES), ok(CATEGORIES.filter((item) => item.id !== 7))],
      'DELETE /api/categories/7': { status: 204 },
    })
    const user = userEvent.setup()
    renderApp('/categorie')

    await user.click(await screen.findByRole('button', { name: 'Modifica Altro' }))
    await user.click(screen.getByRole('button', { name: 'Elimina categoria' }))
    await user.click(screen.getByRole('button', { name: 'Elimina' }))

    expect(await screen.findByRole('button', { name: 'Modifica Casa' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Modifica Altro' })).not.toBeInTheDocument()
    expect(fetchMock.mock.calls.some(([url, init]) => url === '/api/categories/7' && init?.method === 'DELETE')).toBe(true)
  })
})
