import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { listCategories } from '../api/categories'
import { createExpense, deleteExpense, getExpense, updateExpense } from '../api/expenses'
import type { ExpenseInput } from '../api/types'
import { CoverHeader } from '../components/CoverHeader'
import { ExpenseForm } from '../components/ExpenseForm'
import { LoadError, Notice } from '../components/Notice'
import { monthOf, toIsoDate } from '../lib/months'
import { useAsync } from '../lib/useAsync'

export function ExpenseFormPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [today] = useState(() => toIsoDate(new Date()))
  const expenseId = id === undefined ? null : Number(id)
  const invalidId = expenseId !== null && !(Number.isInteger(expenseId) && expenseId > 0)

  const { data, error, loading, reload } = useAsync(
    () => Promise.all([listCategories(), expenseId !== null && !invalidId ? getExpense(expenseId) : Promise.resolve(null)]),
    [id],
  )
  const [categories, expense] = data ?? [null, null]
  const backTo = expense ? `/?mese=${monthOf(expense.date)}` : '/'

  async function save(input: ExpenseInput) {
    const saved = expense ? await updateExpense(expense.id, input) : await createExpense(input)
    navigate(`/?mese=${monthOf(saved.date)}`, { state: { savedId: saved.id } })
  }

  async function remove() {
    if (!expense) return
    await deleteExpense(expense.id)
    navigate(`/?mese=${monthOf(expense.date)}`)
  }

  let content
  if (invalidId) {
    content = (
      <Notice tone="error" title="Spesa non trovata">
        L'indirizzo non corrisponde a nessuna spesa.
      </Notice>
    )
  } else if (error) {
    content = <LoadError error={error} onRetry={reload} />
  } else if (loading || !categories) {
    content = (
      <p className="page__loading" role="status">
        Caricamento…
      </p>
    )
  } else if (categories.length === 0) {
    content = (
      <Notice tone="info" title="Nessuna categoria">
        Per registrare una spesa crea prima una categoria in <Link to="/categorie">Categorie</Link>.
      </Notice>
    )
  } else {
    return (
      <>
        <CoverHeader title={expense ? 'Modifica spesa' : 'Nuova spesa'} backTo={backTo} />
        <ExpenseForm
          categories={categories}
          initial={expense}
          today={today}
          onSubmit={save}
          onDelete={expense ? remove : undefined}
        />
      </>
    )
  }

  return (
    <>
      <CoverHeader title={expenseId === null ? 'Nuova spesa' : 'Modifica spesa'} backTo={backTo} />
      <div className="page">{content}</div>
    </>
  )
}
