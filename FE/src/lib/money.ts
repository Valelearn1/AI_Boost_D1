// 'always': in italiano Intl non raggrupperebbe i numeri di 4 cifre ("1200,00 €")
const euro = new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR', useGrouping: 'always' })

export const MAX_AMOUNT = 99_999_999.99

/** 1234.5 → "1.234,50 €" */
export function formatEuro(value: number): string {
  return euro.format(value)
}

/** 38 → "38,00": valore iniziale dei campi importo. */
export function formatAmountInput(value: number): string {
  return value.toFixed(2).replace('.', ',')
}

export type AmountResult = { ok: true; value: number } | { ok: false; error: string }

const INVALID = 'Importo non valido: usa solo cifre e al massimo 2 decimali'

/**
 * Legge un importo scritto all'italiana ("12,50", "1.234,56") o con il punto decimale ("12.50").
 * Senza virgola, un punto seguito da gruppi di tre cifre è il separatore delle migliaia ("1.200").
 */
export function parseAmount(input: string): AmountResult {
  const raw = input.replace(/[\s€]/g, '')
  if (raw === '') {
    return { ok: false, error: 'Inserisci un importo' }
  }
  let normalized = raw
  if (raw.includes(',')) {
    normalized = raw.replace(/\./g, '').replace(',', '.')
  } else if (/^\d{1,3}(\.\d{3})+$/.test(raw)) {
    normalized = raw.replace(/\./g, '')
  }
  if (!/^\d+(\.\d{1,2})?$/.test(normalized)) {
    return { ok: false, error: INVALID }
  }
  const value = Number(normalized)
  if (value <= 0) {
    return { ok: false, error: "L'importo deve essere maggiore di zero" }
  }
  if (value > MAX_AMOUNT) {
    return { ok: false, error: "L'importo è troppo grande" }
  }
  return { ok: true, value }
}
