import { request } from './http'
import type { Summary } from './types'

export const getSummary = (month: string) => request<Summary>(`/summary?month=${month}`)
