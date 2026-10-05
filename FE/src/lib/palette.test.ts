import { describe, expect, it } from 'vitest'
import { HIGHLIGHTERS, firstFreeColor } from './palette'

describe('palette degli evidenziatori', () => {
  it('contiene i 10 colori di DESIGN.md', () => {
    expect(HIGHLIGHTERS).toHaveLength(10)
    expect(HIGHLIGHTERS.map((item) => item.value)).toContain('#C7A6FF')
  })

  it('propone il primo colore non ancora usato, ignorando maiuscole e minuscole', () => {
    expect(firstFreeColor(['#7ee08a', '#6CCBFF'])).toBe('#FFE45C')
    expect(firstFreeColor(HIGHLIGHTERS.map((item) => item.value))).toBe('#7EE08A')
  })
})
