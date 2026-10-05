import { describe, expect, it } from 'vitest'
import {
  addDays,
  addMonths,
  currentMonth,
  dayOfMonth,
  daysInMonth,
  daysRemaining,
  isValidMonth,
  longDateLabel,
  monthLabel,
  monthName,
  monthOf,
  sourceLabel,
  toIsoDate,
  weekdayShort,
} from './months'

const OCT_5 = new Date(2026, 9, 5, 12)

describe('date e mesi', () => {
  it('converte date locali in ISO senza spostamenti di fuso', () => {
    expect(toIsoDate(OCT_5)).toBe('2026-10-05')
    expect(currentMonth(OCT_5)).toBe('2026-10')
    expect(monthOf('2026-10-31')).toBe('2026-10')
  })

  it('somma giorni e mesi attraversando fine mese e fine anno', () => {
    expect(addDays('2026-03-01', -1)).toBe('2026-02-28')
    expect(addMonths('2026-01', -1)).toBe('2025-12')
    expect(addMonths('2026-12', 1)).toBe('2027-01')
  })

  it('valida il formato AAAA-MM', () => {
    expect(isValidMonth('2026-10')).toBe(true)
    expect(isValidMonth('2026-13')).toBe(false)
    expect(isValidMonth('2026-1')).toBe(false)
    expect(isValidMonth('ottobre')).toBe(false)
    expect(isValidMonth(null)).toBe(false)
  })

  it('scrive i mesi in italiano', () => {
    expect(monthName('2026-09')).toBe('settembre')
    expect(monthLabel('2026-10')).toBe('Ottobre 2026')
    expect(sourceLabel('2026-09', '2026-10')).toBe('da settembre')
    expect(sourceLabel('2025-12', '2026-02')).toBe('da dicembre 2025')
  })

  it('conta i giorni restanti: da oggi incluso, zero nel passato, tutti nel futuro', () => {
    expect(daysRemaining('2026-10', OCT_5)).toBe(27)
    expect(daysRemaining('2026-09', OCT_5)).toBe(0)
    expect(daysRemaining('2026-11', OCT_5)).toBe(30)
    expect(daysInMonth('2028-02')).toBe(29)
  })

  it('descrive i giorni', () => {
    expect(dayOfMonth('2026-10-05')).toBe(5)
    expect(weekdayShort('2026-10-05')).toBe('LUN')
    expect(longDateLabel('2026-10-04')).toBe('Domenica 4 ottobre')
  })
})
