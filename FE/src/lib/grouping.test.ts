import { describe, expect, it } from 'vitest'
import type { Expense } from '../api/types'
import { groupByDay, sumAmounts } from './grouping'

const ristoranti = { id: 4, name: 'Ristoranti', color: '#FFB050' }
const spesa = { id: 1, name: 'Spesa', color: '#7EE08A' }

const expense = (id: number, date: string, amount: number, category = spesa): Expense => ({
  id,
  amount,
  date,
  description: `Spesa ${id}`,
  category,
})

describe('groupByDay', () => {
  it('raggruppa per giorno mantenendo l’ordine e somma senza errori di arrotondamento', () => {
    const groups = groupByDay([
      expense(10, '2026-10-05', 3.2, ristoranti),
      expense(9, '2026-10-05', 46.8),
      expense(8, '2026-10-04', 38, ristoranti),
    ])

    expect(groups.map((group) => group.date)).toEqual(['2026-10-05', '2026-10-04'])
    expect(groups[0].total).toBe(50)
    expect(groups[0].expenses.map((item) => item.id)).toEqual([10, 9])
    expect(groups[1].total).toBe(38)
  })

  it('restituisce una lista vuota senza spese', () => {
    expect(groupByDay([])).toEqual([])
  })

  it('somma i centesimi in modo esatto', () => {
    expect(sumAmounts([0.1, 0.2])).toBe(0.3)
  })
})
