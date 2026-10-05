import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router'
import { listExpenses } from '../api/expenses'
import { getSummary } from '../api/summary'
import type { Expense, Summary } from '../api/types'
import { BudgetBar } from '../components/BudgetBar'
import { CoverHeader } from '../components/CoverHeader'
import { Highlight } from '../components/Highlight'
import { ChevronLeftIcon, ChevronRightIcon, PencilIcon } from '../components/icons'
import { LoadError } from '../components/Notice'
import { SlidingNumber } from '../components/vendor/SlidingNumber'
import { groupByDay } from '../lib/grouping'
import { formatEuro } from '../lib/money'
import {
  addMonths,
  currentMonth,
  dayOfMonth,
  daysRemaining,
  isValidMonth,
  longDateLabel,
  monthLabel,
  monthName,
  sourceLabel,
  toIsoDate,
  weekdayShort,
} from '../lib/months'
import { useAsync } from '../lib/useAsync'
import './MonthPage.css'

export function MonthPage() {
  const [params] = useSearchParams()
  const location = useLocation()
  const requested = params.get('mese')
  const month = isValidMonth(requested) ? requested : currentMonth()
  const state = location.state as { savedId?: number; turn?: number } | null
  // `key`: cambiando mese si riparte da zero (filtro compreso)
  return <MonthView key={month} month={month} initialSavedId={state?.savedId ?? null} turn={state?.turn ?? 0} />
}

const EASE_OUT = [0.16, 1, 0.3, 1] as const

function MonthView({ month, initialSavedId, turn }: { month: string; initialSavedId: number | null; turn: number }) {
  const navigate = useNavigate()
  const location = useLocation()
  // La spesa appena salvata si evidenzia una volta sola: lo stato viene tolto dalla cronologia,
  // così tornando indietro o avanti la pagina non scorre e non rievidenzia di nuovo
  const [savedId] = useState(initialSavedId)
  useEffect(() => {
    if (initialSavedId !== null) {
      navigate({ pathname: location.pathname, search: location.search }, { replace: true, state: null })
    }
    // solo al primo montaggio della vista
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  const [today] = useState(() => new Date())
  const [filter, setFilter] = useState<number | null>(null)
  const { data, error, loading, reload } = useAsync(
    () => Promise.all([getSummary(month), listExpenses(month)]),
    [month],
  )
  const [summary, expenses] = data ?? [null, null]
  const previous = addMonths(month, -1)
  const next = addMonths(month, 1)
  const visible = expenses && filter !== null ? expenses.filter((item) => item.category.id === filter) : expenses

  return (
    <>
      <CoverHeader
        title={monthLabel(month)}
        start={
          <Link to={`/?mese=${previous}`} state={{ turn: -1 }} className="cover__icon" aria-label={`Mese precedente, ${monthLabel(previous)}`}>
            <ChevronLeftIcon />
          </Link>
        }
        end={
          <Link to={`/?mese=${next}`} state={{ turn: 1 }} className="cover__icon" aria-label={`Mese successivo, ${monthLabel(next)}`}>
            <ChevronRightIcon />
          </Link>
        }
      >
        <MonthSummary month={month} summary={summary} today={today} />
      </CoverHeader>

      {/* Si sfoglia il diario: la pagina arriva dalla parte del mese scelto */}
      <motion.div
        className="page"
        initial={{ opacity: 0, x: turn * 56 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.32, ease: EASE_OUT }}
      >
        {error ? <LoadError error={error} onRetry={reload} /> : null}
        {loading && !data ? (
          <p className="page__loading" role="status">
            Caricamento…
          </p>
        ) : null}
        {summary && expenses && visible ? (
          expenses.length === 0 ? (
            <EmptyMonth month={month} />
          ) : (
            <>
              <Breakdown summary={summary} filter={filter} onFilter={setFilter} />
              <DayList expenses={visible} savedId={savedId} today={toIsoDate(today)} />
            </>
          )
        ) : null}
      </motion.div>
    </>
  )
}

function MonthSummary({ month, summary, today }: { month: string; summary: Summary | null; today: Date }) {
  const days = daysRemaining(month, today)
  const remaining = summary?.remaining ?? null
  const inherited = summary?.budgetSourceMonth && summary.budgetSourceMonth !== month ? summary.budgetSourceMonth : null

  return (
    <div className="month-summary">
      <div>
        <p className="month-summary__label">Speso</p>
        <p className="month-summary__total num" aria-busy={summary === null}>
          {summary ? (
            <>
              <span className="visually-hidden">{formatEuro(summary.total)}</span>
              <span className="month-summary__digits" aria-hidden="true">
                <SlidingNumber
                  number={summary.total}
                  fromNumber={0}
                  decimalPlaces={2}
                  decimalSeparator=","
                  thousandSeparator="."
                />
                <span>&nbsp;€</span>
              </span>
            </>
          ) : (
            '—'
          )}
        </p>
      </div>
      <Link to={`/budget/${month}`} className="month-summary__budget">
        <span className="visually-hidden">Modifica il budget di {monthLabel(month)}: </span>
        <dl className="month-summary__facts">
          <div>
            <dt className="month-summary__edit">
              Budget <PencilIcon size={14} />
            </dt>
            <dd className="num">{summary === null ? '—' : summary.budget !== null ? formatEuro(summary.budget) : 'Non impostato'}</dd>
            {inherited ? <dd className="month-summary__note">{sourceLabel(inherited, month)}</dd> : null}
          </div>
          {remaining !== null && remaining < 0 ? (
            <div>
              <dt>Superato di</dt>
              <dd className="num">
                <Highlight color="var(--hl-coral)" className="swipe--ink">
                  {formatEuro(-remaining)}
                </Highlight>
              </dd>
            </div>
          ) : (
            <div>
              <dt>Rimangono</dt>
              <dd className="num">{remaining !== null ? formatEuro(remaining) : '—'}</dd>
            </div>
          )}
          <div>
            <dt>Mancano</dt>
            <dd className="num">{days === 1 ? '1 giorno' : `${days} giorni`}</dd>
          </div>
        </dl>
        <BudgetBar spent={summary?.total ?? 0} budget={summary?.budget ?? null} />
      </Link>
    </div>
  )
}

function Breakdown({
  summary,
  filter,
  onFilter,
}: {
  summary: Summary
  filter: number | null
  onFilter: (categoryId: number | null) => void
}) {
  return (
    <section aria-labelledby="breakdown-title">
      <div className="section-head">
        <h2 id="breakdown-title" className="section-title">
          Per categoria
        </h2>
        {filter !== null ? (
          <button type="button" className="btn--text" onClick={() => onFilter(null)}>
            Mostra tutte
          </button>
        ) : null}
      </div>
      <ul className="breakdown">
        {summary.byCategory.map((item) => {
          const share = summary.total > 0 ? item.total / summary.total : 0
          const selected = filter === item.categoryId
          return (
            <li key={item.categoryId}>
              <button
                type="button"
                className={`breakdown__row${filter !== null && !selected ? ' is-dimmed' : ''}`}
                aria-pressed={selected}
                onClick={() => onFilter(selected ? null : item.categoryId)}
              >
                <Highlight color={item.color}>{item.name}</Highlight>
                <span className="breakdown__amount num">{formatEuro(item.total)}</span>
                <span className="breakdown__share" aria-hidden="true">
                  <span style={{ width: `${share * 100}%`, background: item.color }} />
                </span>
              </button>
            </li>
          )
        })}
      </ul>
    </section>
  )
}

function DayList({ expenses, savedId, today }: { expenses: Expense[]; savedId: number | null; today: string }) {
  return (
    <section aria-labelledby="days-title">
      <div className="section-head">
        <h2 id="days-title" className="section-title">
          Spese
        </h2>
      </div>
      <AnimatePresence initial={true}>
      {groupByDay(expenses).map((group, index) => (
        <motion.section
          key={group.date}
          className="day"
          aria-label={longDateLabel(group.date)}
          layout="position"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0, transition: { duration: 0.3, ease: EASE_OUT, delay: Math.min(index, 8) * 0.06 } }}
          exit={{ opacity: 0, height: 0, paddingTop: 0, marginTop: 0, transition: { duration: 0.2 } }}
        >
          <div className={`day__gutter${group.date === today ? ' is-today' : ''}`} aria-hidden="true">
            <span className="day__number">{dayOfMonth(group.date)}</span>
            <span className="day__weekday">{weekdayShort(group.date)}</span>
          </div>
          <div>
            <p className="day__total num">
              <span className="visually-hidden">Totale del giorno: </span>
              {formatEuro(group.total)}
            </p>
            <ul>
              <AnimatePresence initial={false}>
                {group.expenses.map((expense) => (
                  <ExpenseRow key={expense.id} expense={expense} justSaved={expense.id === savedId} />
                ))}
              </AnimatePresence>
            </ul>
          </div>
        </motion.section>
      ))}
      </AnimatePresence>
    </section>
  )
}

function ExpenseRow({ expense, justSaved }: { expense: Expense; justSaved: boolean }) {
  const title = expense.description ?? expense.category.name
  const rowRef = useRef<HTMLAnchorElement>(null)
  // La spesa appena salvata viene portata in vista; la passata parte solo dopo, così si vede tracciarsi
  const [revealed, setRevealed] = useState(false)

  useEffect(() => {
    if (!justSaved) return
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
    rowRef.current?.scrollIntoView?.({ block: 'center', behavior: reduced ? 'auto' : 'smooth' })
    const timer = window.setTimeout(() => setRevealed(true), reduced ? 0 : 450)
    return () => window.clearTimeout(timer)
  }, [justSaved])

  return (
    <motion.li layout="position" exit={{ opacity: 0, height: 0, transition: { duration: 0.18 } }} style={{ overflow: 'hidden' }}>
      <Link ref={rowRef} to={`/spese/${expense.id}`} className="expense-row">
        <span className="expense-row__text">
          <span className="expense-row__title">
            {justSaved && revealed ? (
              <Highlight color={expense.category.color} animate>
                {title}
              </Highlight>
            ) : (
              title
            )}
            {justSaved ? <span className="visually-hidden">appena salvata</span> : null}
          </span>
          <span className="expense-row__category">
            <Highlight color={expense.category.color}>{expense.category.name}</Highlight>
          </span>
        </span>
        <span className="expense-row__amount num">{formatEuro(expense.amount)}</span>
      </Link>
    </motion.li>
  )
}

function EmptyMonth({ month }: { month: string }) {
  return (
    <div className="empty">
      <p className="empty__title">
        Nessuna spesa a {monthName(month)} {month.slice(0, 4)}.
      </p>
      <p className="empty__text">Le spese che aggiungi compaiono qui, giorno per giorno.</p>
      <Link to="/spese/nuova" className="btn btn--secondary">
        Aggiungi spesa
      </Link>
    </div>
  )
}
