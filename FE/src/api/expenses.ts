import { jsonBody, request } from './http'
import type { Expense, ExpenseInput } from './types'

export const listExpenses = (month: string) => request<Expense[]>(`/expenses?month=${month}`)

export const getExpense = (id: number) => request<Expense>(`/expenses/${id}`)

export const createExpense = (input: ExpenseInput) => request<Expense>('/expenses', jsonBody('POST', input))

export const updateExpense = (id: number, input: ExpenseInput) =>
  request<Expense>(`/expenses/${id}`, jsonBody('PUT', input))

export const deleteExpense = (id: number) => request<void>(`/expenses/${id}`, { method: 'DELETE' })
