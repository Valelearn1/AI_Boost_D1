import type { Budget, Category, Expense, Summary } from '../api/types'

export const SPESA = { id: 1, name: 'Spesa', color: '#7EE08A' }
export const CASA = { id: 2, name: 'Casa', color: '#6CCBFF' }
export const TRASPORTI = { id: 3, name: 'Trasporti', color: '#FFE45C' }
export const RISTORANTI = { id: 4, name: 'Ristoranti', color: '#FFB050' }
export const SVAGO = { id: 5, name: 'Svago', color: '#FF8AC2' }
export const SALUTE = { id: 6, name: 'Salute', color: '#5FE0D2' }
export const ALTRO = { id: 7, name: 'Altro', color: '#D4D8E0' }

export const CATEGORIES: Category[] = [
  { ...ALTRO, expenseCount: 0 },
  { ...CASA, expenseCount: 14 },
  { ...RISTORANTI, expenseCount: 11 },
  { ...SALUTE, expenseCount: 3 },
  { ...SPESA, expenseCount: 22 },
  { ...SVAGO, expenseCount: 4 },
  { ...TRASPORTI, expenseCount: 9 },
]

const expense = (id: number, date: string, amount: number, description: string, category: Expense['category']): Expense => ({
  id,
  amount,
  date,
  description,
  category,
})

/** Ottobre 2026 come nelle schermate di docs/design/stitch-prompt.md (ordinate come le restituisce l'API). */
export const OCTOBER_EXPENSES: Expense[] = [
  expense(10, '2026-10-05', 3.2, 'Caffè e brioche', RISTORANTI),
  expense(9, '2026-10-05', 46.8, 'Esselunga', SPESA),
  expense(8, '2026-10-04', 38, 'Pizzeria Da Gino', RISTORANTI),
  expense(7, '2026-10-04', 9.5, 'Cinema', SVAGO),
  expense(6, '2026-10-03', 60, 'Benzina', TRASPORTI),
  expense(5, '2026-10-03', 14.9, 'Farmacia', SALUTE),
  expense(4, '2026-10-02', 72.4, 'Bolletta luce', CASA),
  expense(3, '2026-10-02', 18.6, 'Mercato', SPESA),
  expense(2, '2026-10-01', 650, 'Affitto', CASA),
  expense(1, '2026-10-01', 39, 'Abbonamento ATM', TRASPORTI),
]

export const OCTOBER_SUMMARY: Summary = {
  month: '2026-10',
  total: 952.4,
  budget: 1200,
  budgetSourceMonth: '2026-09',
  remaining: 247.6,
  byCategory: [
    { categoryId: 2, name: 'Casa', color: '#6CCBFF', total: 722.4 },
    { categoryId: 3, name: 'Trasporti', color: '#FFE45C', total: 99 },
    { categoryId: 1, name: 'Spesa', color: '#7EE08A', total: 65.4 },
    { categoryId: 4, name: 'Ristoranti', color: '#FFB050', total: 41.2 },
    { categoryId: 6, name: 'Salute', color: '#5FE0D2', total: 14.9 },
    { categoryId: 5, name: 'Svago', color: '#FF8AC2', total: 9.5 },
  ],
}

export const emptySummary = (month: string): Summary => ({
  month,
  total: 0,
  budget: 1200,
  budgetSourceMonth: '2026-09',
  remaining: 1200,
  byCategory: [],
})

export const INHERITED_OCTOBER_BUDGET: Budget = { month: '2026-10', amount: 1200, sourceMonth: '2026-09' }

/** Rotte API della schermata Mese di ottobre. */
export const OCTOBER_ROUTES = {
  'GET /api/summary?month=2026-10': { status: 200, body: OCTOBER_SUMMARY },
  'GET /api/expenses?month=2026-10': { status: 200, body: OCTOBER_EXPENSES },
}
