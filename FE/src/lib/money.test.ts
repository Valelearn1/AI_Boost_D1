import { describe, expect, it } from 'vitest'
import { formatAmountInput, formatEuro, parseAmount } from './money'

const plain = (text: string) => text.replace(/\s/g, ' ')

describe('formatEuro', () => {
  it('usa il formato italiano con il separatore delle migliaia', () => {
    expect(plain(formatEuro(952.4))).toBe('952,40 €')
    expect(plain(formatEuro(1200))).toBe('1.200,00 €')
    expect(plain(formatEuro(-42.3))).toBe('-42,30 €')
  })
})

describe('formatAmountInput', () => {
  it('prepara il valore iniziale di un campo importo', () => {
    expect(formatAmountInput(38)).toBe('38,00')
    expect(formatAmountInput(1300)).toBe('1300,00')
  })
})

describe('parseAmount', () => {
  it.each([
    ['12,50', 12.5],
    ['12.50', 12.5],
    [' 3,2 € ', 3.2],
    ['1.234,56', 1234.56],
    ['1.200', 1200],
    ['1200', 1200],
    ['0,01', 0.01],
  ])('accetta «%s»', (input, expected) => {
    expect(parseAmount(input)).toEqual({ ok: true, value: expected })
  })

  it.each([
    ['', 'Inserisci un importo'],
    ['   ', 'Inserisci un importo'],
    ['0', "L'importo deve essere maggiore di zero"],
    ['0,00', "L'importo deve essere maggiore di zero"],
    ['12,345', 'Importo non valido: usa solo cifre e al massimo 2 decimali'],
    ['-5', 'Importo non valido: usa solo cifre e al massimo 2 decimali'],
    ['abc', 'Importo non valido: usa solo cifre e al massimo 2 decimali'],
    ['1,2,3', 'Importo non valido: usa solo cifre e al massimo 2 decimali'],
    ['100000000', "L'importo è troppo grande"],
  ])('rifiuta «%s»', (input, error) => {
    expect(parseAmount(input)).toEqual({ ok: false, error })
  })
})
