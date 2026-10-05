import type { Expense } from '../api/types'

export interface DayGroup {
  date: string
  total: number
  expenses: Expense[]
}

/** Somma in centesimi, per evitare 46.8 + 3.2 = 49.99999… */
export function sumAmounts(amounts: number[]): number {
  return amounts.reduce((cents, amount) => cents + Math.round(amount * 100), 0) / 100
}

/** Le spese arrivano già ordinate per data decrescente: raggruppa i giorni consecutivi. */
export function groupByDay(expenses: Expense[]): DayGroup[] {
  const groups: { date: string; expenses: Expense[] }[] = []
  for (const expense of expenses) {
    const last = groups.at(-1)
    if (last && last.date === expense.date) {
      last.expenses.push(expense)
    } else {
      groups.push({ date: expense.date, expenses: [expense] })
    }
  }
  return groups.map((group) => ({ ...group, total: sumAmounts(group.expenses.map((item) => item.amount)) }))
}
