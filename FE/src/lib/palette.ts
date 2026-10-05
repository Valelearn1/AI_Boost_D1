/** Colori evidenziatore di DESIGN.md, nell'ordine in cui vengono proposti. */
export const HIGHLIGHTERS = [
  { name: 'Verde', value: '#7EE08A' },
  { name: 'Azzurro', value: '#6CCBFF' },
  { name: 'Giallo', value: '#FFE45C' },
  { name: 'Arancio', value: '#FFB050' },
  { name: 'Rosa', value: '#FF8AC2' },
  { name: 'Turchese', value: '#5FE0D2' },
  { name: 'Grigio', value: '#D4D8E0' },
  { name: 'Corallo', value: '#FF8F7A' },
  { name: 'Lilla', value: '#C7A6FF' },
  { name: 'Lime', value: '#C6E85A' },
] as const

export function firstFreeColor(usedColors: string[]): string {
  const used = new Set(usedColors.map((color) => color.toUpperCase()))
  return HIGHLIGHTERS.find((item) => !used.has(item.value))?.value ?? HIGHLIGHTERS[0].value
}
