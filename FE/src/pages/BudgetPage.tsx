import { useState, type FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router'
import { getBudget, removeBudget, setBudget } from '../api/budgets'
import { ApiError } from '../api/http'
import { getSummary } from '../api/summary'
import type { Budget } from '../api/types'
import { BudgetBar } from '../components/BudgetBar'
import { CoverHeader } from '../components/CoverHeader'
import { LoadError, Notice } from '../components/Notice'
import CountUp from '../components/vendor/CountUp'
import { formatAmountInput, formatEuro, parseAmount } from '../lib/money'
import { isValidMonth, monthLabel, monthName } from '../lib/months'
import { useAsync } from '../lib/useAsync'
import './BudgetPage.css'

export function BudgetPage() {
  const { mese } = useParams()
  if (!isValidMonth(mese)) {
    return (
      <>
        <CoverHeader title="Budget" backTo="/" />
        <div className="page">
          <Notice tone="error" title="Mese non valido">
            L'indirizzo deve indicare un mese, per esempio /budget/2026-10.
          </Notice>
        </div>
      </>
    )
  }
  return <BudgetEditor key={mese} month={mese} />
}

function budgetNotice(budget: Budget, month: string): string | null {
  const year = month.slice(0, 4)
  if (budget.amount === null || budget.sourceMonth === null) {
    return `Nessun budget impostato per ${monthName(month)} ${year} né per i mesi precedenti.`
  }
  if (budget.sourceMonth !== month) {
    const name = monthName(month)
    return `${name.charAt(0).toUpperCase()}${name.slice(1)} non ha un budget proprio. Al momento vale quello di ${monthName(budget.sourceMonth)} ${budget.sourceMonth.slice(0, 4)}: ${formatEuro(budget.amount)}.`
  }
  return null
}

function BudgetEditor({ month }: { month: string }) {
  const navigate = useNavigate()
  const { data, error, loading, reload } = useAsync(() => Promise.all([getBudget(month), getSummary(month)]), [month])
  const [budget, summary] = data ?? [null, null]
  // null = campo non ancora toccato: vale il budget proprio del mese, se c'è
  const [typed, setTyped] = useState<string | null>(null)
  const [amountError, setAmountError] = useState<string | null>(null)
  const [generalError, setGeneralError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const ownBudget = budget !== null && budget.amount !== null && budget.sourceMonth === month
  const value = typed ?? (ownBudget && budget.amount !== null ? formatAmountInput(budget.amount) : '')
  const parsed = parseAmount(value)
  const backTo = `/?mese=${month}`
  const label = `Budget di ${monthName(month)}`

  async function run(action: () => Promise<unknown>) {
    setBusy(true)
    setGeneralError(null)
    try {
      await action()
      navigate(backTo)
    } catch (failure) {
      setGeneralError(failure instanceof ApiError ? failure.message : 'Operazione non riuscita')
      setBusy(false)
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (busy) return
    if (!parsed.ok) {
      setAmountError(parsed.error)
      return
    }
    setAmountError(null)
    void run(() => setBudget(month, parsed.value))
  }

  let preview = null
  if (parsed.ok && summary) {
    const remainingCents = Math.round(parsed.value * 100) - Math.round(summary.total * 100)
    preview = (
      <div className="budget-preview">
        <BudgetBar spent={summary.total} budget={parsed.value} tone="paper" />
        <p>
          <span className="visually-hidden">
            {remainingCents >= 0
              ? `Con questo budget ti rimarrebbero ${formatEuro(remainingCents / 100)}.`
              : `Con questo budget saresti già oltre di ${formatEuro(-remainingCents / 100)}.`}
          </span>
          <span aria-hidden="true">
            {remainingCents >= 0 ? 'Con questo budget ti rimarrebbero ' : 'Con questo budget saresti già oltre di '}
            <CountUp className="num" to={Math.abs(remainingCents) / 100} duration={0.5} format={formatEuro} />.
          </span>
        </p>
      </div>
    )
  }

  const notice = budget ? budgetNotice(budget, month) : null

  return (
    <>
      <CoverHeader title={`Budget di ${monthName(month)} ${month.slice(0, 4)}`} backTo={backTo} />
      <div className="page">
        {error ? <LoadError error={error} onRetry={reload} /> : null}
        {loading && !data ? (
          <p className="page__loading" role="status">
            Caricamento…
          </p>
        ) : null}
        {budget && summary ? (
          <form className="budget-form" onSubmit={handleSubmit} noValidate>
            {notice ? <Notice tone="info">{notice}</Notice> : null}
            {generalError ? <Notice tone="error" title="Non salvato">{generalError}</Notice> : null}
            <div className="field">
              <label className="field__label" htmlFor="budget-amount">
                {label}
              </label>
              <div className="amount-input amount-input--compact" data-invalid={amountError ? 'true' : undefined}>
                <input
                  id="budget-amount"
                  className="amount-input__value num"
                  inputMode="decimal"
                  autoComplete="off"
                  placeholder=""
                  value={value}
                  onChange={(event) => setTyped(event.target.value)}
                  aria-invalid={amountError ? true : undefined}
                  aria-describedby={amountError ? 'budget-error' : undefined}
                />
                <span className="amount-input__currency" aria-hidden="true">
                  €
                </span>
              </div>
              {amountError ? (
                <p id="budget-error" className="field__error">
                  {amountError}
                </p>
              ) : null}
              <p className="field__help">Speso finora a {monthLabel(month).toLowerCase()}: {formatEuro(summary.total)}</p>
            </div>
            {preview}
            <button type="submit" className="btn btn--primary" disabled={busy} data-spark="#ffb050">
              Salva budget
            </button>
            {ownBudget ? (
              <button
                type="button"
                className="btn--text btn--text-muted budget-form__remove"
                disabled={busy}
                onClick={() => void run(() => removeBudget(month))}
              >
                Rimuovi il budget di {monthName(month)}
              </button>
            ) : null}
          </form>
        ) : null}
      </div>
    </>
  )
}
