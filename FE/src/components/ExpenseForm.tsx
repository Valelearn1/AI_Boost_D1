import { motion } from 'motion/react'
import { useRef, useState, type CSSProperties, type FormEvent } from 'react'
import { ApiError } from '../api/http'
import type { Category, Expense, ExpenseInput } from '../api/types'
import { formatAmountInput, parseAmount } from '../lib/money'
import { addDays } from '../lib/months'
import { Notice } from './Notice'
import './ExpenseForm.css'

type DateChoice = 'today' | 'yesterday' | 'other'
type FieldErrors = Partial<Record<'amount' | 'categoryId' | 'date' | 'description', string>>

const DATE_CHOICES: [DateChoice, string][] = [
  ['today', 'Oggi'],
  ['yesterday', 'Ieri'],
  ['other', 'Altra data…'],
]

export interface ExpenseFormProps {
  categories: Category[]
  /** null = nuova spesa */
  initial: Expense | null
  /** Data di oggi (ISO): iniettata per i test */
  today: string
  onSubmit: (input: ExpenseInput) => Promise<void>
  onDelete?: () => Promise<void>
}

export function ExpenseForm({ categories, initial, today, onSubmit, onDelete }: ExpenseFormProps) {
  const yesterday = addDays(today, -1)
  const [amount, setAmount] = useState(initial ? formatAmountInput(initial.amount) : '')
  const [categoryId, setCategoryId] = useState<number | null>(initial?.category.id ?? null)
  const [dateChoice, setDateChoice] = useState<DateChoice>(() => {
    if (!initial || initial.date === today) return 'today'
    return initial.date === yesterday ? 'yesterday' : 'other'
  })
  const [otherDate, setOtherDate] = useState(initial?.date ?? today)
  const [description, setDescription] = useState(initial?.description ?? '')
  const [errors, setErrors] = useState<FieldErrors>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  // Doppio tocco con il Wi-Fi lento: il secondo invio parte prima che il pulsante si disattivi
  const inFlight = useRef(false)

  const date = dateChoice === 'today' ? today : dateChoice === 'yesterday' ? yesterday : otherDate

  function fail(error: unknown, fallback: string) {
    if (error instanceof ApiError && Object.keys(error.errors).length > 0) {
      setErrors(error.errors as FieldErrors)
    } else {
      setFormError(error instanceof ApiError ? error.message : fallback)
    }
    inFlight.current = false
    setBusy(false)
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (inFlight.current) return
    const parsed = parseAmount(amount)
    const nextErrors: FieldErrors = {}
    if (!parsed.ok) nextErrors.amount = parsed.error
    if (categoryId === null) nextErrors.categoryId = 'Scegli una categoria'
    if (!date) nextErrors.date = 'Scegli una data'
    setErrors(nextErrors)
    setFormError(null)
    if (!parsed.ok || categoryId === null || !date) return

    inFlight.current = true
    setBusy(true)
    try {
      const trimmed = description.trim()
      await onSubmit({ amount: parsed.value, date, description: trimmed === '' ? null : trimmed, categoryId })
    } catch (error) {
      fail(error, 'Salvataggio non riuscito')
    }
  }

  async function handleDelete() {
    if (!onDelete || inFlight.current) return
    inFlight.current = true
    setBusy(true)
    try {
      await onDelete()
    } catch (error) {
      setConfirmingDelete(false)
      fail(error, 'Eliminazione non riuscita')
    }
  }

  return (
    <form className="expense-form page" onSubmit={handleSubmit} noValidate>
      {formError ? <Notice tone="error" title="Non salvata">{formError}</Notice> : null}

      <div className="field">
        <label className="field__label" htmlFor="amount">
          Importo
        </label>
        <div className="amount-input" data-invalid={errors.amount ? 'true' : undefined}>
          <input
            id="amount"
            className="amount-input__value num"
            inputMode="decimal"
            autoComplete="off"
            enterKeyHint="next"
            placeholder="0,00"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            aria-invalid={errors.amount ? true : undefined}
            aria-describedby={errors.amount ? 'amount-error' : undefined}
            autoFocus={initial === null}
          />
          <span className="amount-input__currency" aria-hidden="true">
            €
          </span>
        </div>
        {errors.amount ? (
          <p id="amount-error" className="field__error">
            {errors.amount}
          </p>
        ) : null}
      </div>

      <fieldset className="field" aria-describedby={errors.categoryId ? 'category-error' : undefined}>
        <legend className="field__label">Categoria</legend>
        <div className="chips">
          {categories.map((category) => (
            <label key={category.id} className="chip" style={{ '--swipe': category.color } as CSSProperties}>
              <input
                type="radio"
                name="category"
                className="visually-hidden"
                value={category.id}
                checked={categoryId === category.id}
                onChange={() => setCategoryId(category.id)}
              />
              <span className="swipe chip__name">{category.name}</span>
            </label>
          ))}
        </div>
        {errors.categoryId ? (
          <p id="category-error" className="field__error">
            {errors.categoryId}
          </p>
        ) : null}
      </fieldset>

      <fieldset className="field">
        <legend className="field__label">Data</legend>
        <div className="segmented">
          {DATE_CHOICES.map(([value, label]) => (
            <label key={value} className="segmented__option">
              <input
                type="radio"
                name="date-choice"
                className="visually-hidden"
                value={value}
                checked={dateChoice === value}
                onChange={() => setDateChoice(value)}
              />
              {label}
            </label>
          ))}
        </div>
        {dateChoice === 'other' ? (
          <input
            type="date"
            className="field__input"
            aria-label="Data della spesa"
            value={otherDate}
            max="9999-12-31"
            onChange={(event) => setOtherDate(event.target.value)}
          />
        ) : null}
        {errors.date ? <p className="field__error">{errors.date}</p> : null}
      </fieldset>

      <div className="field">
        <label className="field__label" htmlFor="description">
          Descrizione (facoltativa)
        </label>
        <input
          id="description"
          className="field__input"
          maxLength={100}
          enterKeyHint="done"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          aria-invalid={errors.description ? true : undefined}
          aria-describedby="description-help"
        />
        <p id="description-help" className="field__help">
          Max 100 caratteri
        </p>
        {errors.description ? <p className="field__error">{errors.description}</p> : null}
      </div>

      <div className="form-actions">
        <button type="submit" className="btn btn--primary" disabled={busy} data-spark="#ffb050">
          {busy && !confirmingDelete ? 'Salvataggio…' : initial ? 'Salva modifiche' : 'Salva spesa'}
        </button>
      </div>

      {onDelete ? (
        confirmingDelete ? (
          <motion.div
            className="confirm"
            role="group"
            aria-label="Conferma eliminazione"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            style={{ overflow: 'hidden' }}
          >
            <p>Eliminare questa spesa? L'operazione non si può annullare.</p>
            <div className="confirm__actions">
              <button type="button" className="btn btn--secondary" onClick={() => setConfirmingDelete(false)} disabled={busy}>
                Annulla
              </button>
              <button type="button" className="btn btn--danger" onClick={handleDelete} disabled={busy}>
                Elimina
              </button>
            </div>
          </motion.div>
        ) : (
          <button type="button" className="btn--text btn--text-danger expense-form__delete" onClick={() => setConfirmingDelete(true)}>
            Elimina spesa
          </button>
        )
      ) : null}
    </form>
  )
}
