const MONTH_NAMES = [
  'gennaio', 'febbraio', 'marzo', 'aprile', 'maggio', 'giugno',
  'luglio', 'agosto', 'settembre', 'ottobre', 'novembre', 'dicembre',
]
const WEEKDAYS_SHORT = ['DOM', 'LUN', 'MAR', 'MER', 'GIO', 'VEN', 'SAB']
const WEEKDAYS = ['domenica', 'lunedì', 'martedì', 'mercoledì', 'giovedì', 'venerdì', 'sabato']

const pad = (value: number) => String(value).padStart(2, '0')
const capitalize = (text: string) => text.charAt(0).toUpperCase() + text.slice(1)

function parseMonth(month: string): [number, number] {
  const [year, monthNumber] = month.split('-').map(Number)
  return [year, monthNumber]
}

/** Le date ISO sono giorni di calendario: si leggono sempre come date locali. */
function parseDate(isoDate: string): Date {
  const [year, month, day] = isoDate.split('-').map(Number)
  return new Date(year, month - 1, day)
}

export function toIsoDate(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

export function addDays(isoDate: string, delta: number): string {
  const date = parseDate(isoDate)
  date.setDate(date.getDate() + delta)
  return toIsoDate(date)
}

export function currentMonth(today: Date = new Date()): string {
  return toIsoDate(today).slice(0, 7)
}

export function monthOf(isoDate: string): string {
  return isoDate.slice(0, 7)
}

export function isValidMonth(value: string | null | undefined): value is string {
  return typeof value === 'string' && /^\d{4}-(0[1-9]|1[0-2])$/.test(value)
}

export function addMonths(month: string, delta: number): string {
  const [year, monthNumber] = parseMonth(month)
  const date = new Date(year, monthNumber - 1 + delta, 1)
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}`
}

/** "2026-09" → "settembre" */
export function monthName(month: string): string {
  return MONTH_NAMES[parseMonth(month)[1] - 1]
}

/** "2026-10" → "Ottobre 2026" */
export function monthLabel(month: string): string {
  return `${capitalize(monthName(month))} ${parseMonth(month)[0]}`
}

/** Da quale mese arriva un budget ereditato: "da settembre" o "da dicembre 2025". */
export function sourceLabel(sourceMonth: string, month: string): string {
  const sameYear = sourceMonth.slice(0, 4) === month.slice(0, 4)
  return sameYear ? `da ${monthName(sourceMonth)}` : `da ${monthName(sourceMonth)} ${sourceMonth.slice(0, 4)}`
}

export function daysInMonth(month: string): number {
  const [year, monthNumber] = parseMonth(month)
  return new Date(year, monthNumber, 0).getDate()
}

/** Spec 5bis: mese corrente da oggi incluso, mesi passati 0, mesi futuri tutti i giorni. */
export function daysRemaining(month: string, today: Date = new Date()): number {
  const current = currentMonth(today)
  if (month < current) return 0
  if (month > current) return daysInMonth(month)
  return daysInMonth(month) - today.getDate() + 1
}

export function dayOfMonth(isoDate: string): number {
  return parseDate(isoDate).getDate()
}

export function weekdayShort(isoDate: string): string {
  return WEEKDAYS_SHORT[parseDate(isoDate).getDay()]
}

/** "2026-10-04" → "Domenica 4 ottobre" */
export function longDateLabel(isoDate: string): string {
  const date = parseDate(isoDate)
  return `${capitalize(WEEKDAYS[date.getDay()])} ${date.getDate()} ${MONTH_NAMES[date.getMonth()]}`
}
