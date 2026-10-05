import { motion } from 'motion/react'
import { useState, type FormEvent } from 'react'
import { createCategory, deleteCategory, listCategories, updateCategory } from '../api/categories'
import { ApiError } from '../api/http'
import type { Category } from '../api/types'
import { CoverHeader } from '../components/CoverHeader'
import { Highlight } from '../components/Highlight'
import { PencilIcon } from '../components/icons'
import { LoadError, Notice } from '../components/Notice'
import { HIGHLIGHTERS, firstFreeColor } from '../lib/palette'
import { useAsync } from '../lib/useAsync'
import './CategoriesPage.css'

const countLabel = (count: number) => (count === 0 ? 'Nessuna spesa' : count === 1 ? '1 spesa' : `${count} spese`)

function validateName(name: string): string | null {
  const trimmed = name.trim()
  if (trimmed === '') return 'Il nome è obbligatorio'
  if (trimmed.length > 30) return 'Il nome può avere al massimo 30 caratteri'
  return null
}

/** Errore di salvataggio: il nome duplicato (409) e la validazione vanno sui campi, il resto in un avviso. */
function describeSaveError(error: unknown): { name?: string; general?: string } {
  if (error instanceof ApiError) {
    if (error.status === 409) return { name: error.message }
    if (error.errors.name || error.errors.color) return { name: error.errors.name ?? error.errors.color }
    return { general: error.message }
  }
  return { general: 'Salvataggio non riuscito' }
}

export function CategoriesPage() {
  const { data: categories, error, loading, reload } = useAsync(listCategories, [])
  const [editingId, setEditingId] = useState<number | null>(null)

  return (
    <>
      <CoverHeader title="Categorie" />
      <div className="page">
        {error ? <LoadError error={error} onRetry={reload} /> : null}
        {loading && !categories ? (
          <p className="page__loading" role="status">
            Caricamento…
          </p>
        ) : null}
        {categories ? (
          <>
            <ul className="category-list">
              {categories.map((category) =>
                editingId === category.id ? (
                  <li key={category.id} className="category-row is-editing">
                    <CategoryEditor
                      category={category}
                      onDone={() => {
                        setEditingId(null)
                        reload()
                      }}
                      onCancel={() => setEditingId(null)}
                    />
                  </li>
                ) : (
                  <li key={category.id} className="category-row">
                    <span className="category-row__text">
                      <Highlight color={category.color}>{category.name}</Highlight>
                      <span className="category-row__count">{countLabel(category.expenseCount)}</span>
                    </span>
                    <button
                      type="button"
                      className="icon-btn"
                      aria-label={`Modifica ${category.name}`}
                      onClick={() => setEditingId(category.id)}
                    >
                      <PencilIcon />
                    </button>
                  </li>
                ),
              )}
            </ul>
            <NewCategory usedColors={categories.map((category) => category.color)} onCreated={reload} />
          </>
        ) : null}
      </div>
    </>
  )
}

interface CategoryFieldsProps {
  idPrefix: string
  name: string
  color: string
  nameError: string | null
  onName: (name: string) => void
  onColor: (color: string) => void
}

function CategoryFields({ idPrefix, name, color, nameError, onName, onColor }: CategoryFieldsProps) {
  return (
    <>
      <div className="field">
        <label className="field__label" htmlFor={`${idPrefix}-name`}>
          Nome
        </label>
        <input
          id={`${idPrefix}-name`}
          className="field__input"
          maxLength={40}
          autoComplete="off"
          value={name}
          onChange={(event) => onName(event.target.value)}
          aria-invalid={nameError ? true : undefined}
          aria-describedby={nameError ? `${idPrefix}-name-error` : undefined}
        />
        {nameError ? (
          <p id={`${idPrefix}-name-error`} className="field__error">
            {nameError}
          </p>
        ) : null}
      </div>
      <fieldset className="field">
        <legend className="field__label">Colore</legend>
        <div className="swatches">
          {HIGHLIGHTERS.map((item) => (
            <label key={item.value} className="swatch" style={{ background: item.value }}>
              <input
                type="radio"
                name={`${idPrefix}-color`}
                className="visually-hidden"
                value={item.value}
                checked={color.toUpperCase() === item.value}
                onChange={() => onColor(item.value)}
              />
              <span className="visually-hidden">{item.name}</span>
            </label>
          ))}
        </div>
      </fieldset>
      <p className="category-preview" aria-hidden="true">
        <Highlight color={color}>{name.trim() || 'Anteprima'}</Highlight>
      </p>
    </>
  )
}

function NewCategory({ usedColors, onCreated }: { usedColors: string[]; onCreated: () => void }) {
  const [name, setName] = useState('')
  const [color, setColor] = useState(() => firstFreeColor(usedColors))
  const [nameError, setNameError] = useState<string | null>(null)
  const [generalError, setGeneralError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (busy) return
    const invalid = validateName(name)
    setNameError(invalid)
    setGeneralError(null)
    if (invalid) return
    setBusy(true)
    try {
      const created = await createCategory({ name: name.trim(), color })
      setName('')
      setColor(firstFreeColor([...usedColors, created.color]))
      onCreated()
    } catch (error) {
      const described = describeSaveError(error)
      setNameError(described.name ?? null)
      setGeneralError(described.general ?? null)
    } finally {
      setBusy(false)
    }
  }

  return (
    <form className="category-editor" aria-labelledby="new-category-title" onSubmit={handleSubmit} noValidate>
      <h2 id="new-category-title" className="section-title">
        Nuova categoria
      </h2>
      {generalError ? <Notice tone="error">{generalError}</Notice> : null}
      <CategoryFields
        idPrefix="new-category"
        name={name}
        color={color}
        nameError={nameError}
        onName={setName}
        onColor={setColor}
      />
      <button type="submit" className="btn btn--primary" disabled={busy} data-spark="#ffb050">
        Aggiungi categoria
      </button>
    </form>
  )
}

function CategoryEditor({ category, onDone, onCancel }: { category: Category; onDone: () => void; onCancel: () => void }) {
  const [name, setName] = useState(category.name)
  const [color, setColor] = useState(category.color)
  const [nameError, setNameError] = useState<string | null>(null)
  const [generalError, setGeneralError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const idPrefix = `category-${category.id}`

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (busy) return
    const invalid = validateName(name)
    setNameError(invalid)
    setGeneralError(null)
    if (invalid) return
    setBusy(true)
    try {
      await updateCategory(category.id, { name: name.trim(), color })
      onDone()
    } catch (error) {
      const described = describeSaveError(error)
      setNameError(described.name ?? null)
      setGeneralError(described.general ?? null)
      setBusy(false)
    }
  }

  async function handleDelete() {
    setBusy(true)
    setGeneralError(null)
    try {
      await deleteCategory(category.id)
      onDone()
    } catch (error) {
      const message = error instanceof ApiError ? error.message : 'Eliminazione non riuscita'
      setGeneralError(error instanceof ApiError && error.status === 409 ? `${message}. Modifica o elimina prima quelle spese.` : message)
      setConfirming(false)
      setBusy(false)
    }
  }

  return (
    <form className="category-editor" aria-label={`Modifica ${category.name}`} onSubmit={handleSubmit} noValidate>
      {generalError ? <Notice tone="error">{generalError}</Notice> : null}
      <CategoryFields
        idPrefix={idPrefix}
        name={name}
        color={color}
        nameError={nameError}
        onName={setName}
        onColor={setColor}
      />
      <div className="category-editor__actions">
        <button type="submit" className="btn btn--primary" disabled={busy} data-spark="#ffb050">
          Salva
        </button>
        <button type="button" className="btn btn--secondary" onClick={onCancel} disabled={busy}>
          Annulla
        </button>
      </div>
      {confirming ? (
        <motion.div
          className="confirm"
          role="group"
          aria-label="Conferma eliminazione"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          style={{ overflow: 'hidden' }}
        >
          <p>Eliminare «{category.name}»?</p>
          <div className="confirm__actions">
            <button type="button" className="btn btn--secondary" onClick={() => setConfirming(false)} disabled={busy}>
              Annulla
            </button>
            <button type="button" className="btn btn--danger" onClick={handleDelete} disabled={busy}>
              Elimina
            </button>
          </div>
        </motion.div>
      ) : (
        <button type="button" className="btn--text btn--text-danger category-editor__delete" onClick={() => setConfirming(true)}>
          Elimina categoria
        </button>
      )}
    </form>
  )
}
