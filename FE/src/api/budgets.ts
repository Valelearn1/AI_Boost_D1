import { jsonBody, request } from './http'
import type { Budget } from './types'

export const getBudget = (month: string) => request<Budget>(`/budgets/${month}`)

export const setBudget = (month: string, amount: number) => request<Budget>(`/budgets/${month}`, jsonBody('PUT', { amount }))

export const removeBudget = (month: string) => request<void>(`/budgets/${month}`, { method: 'DELETE' })
