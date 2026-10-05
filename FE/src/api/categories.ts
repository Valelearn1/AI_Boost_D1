import { jsonBody, request } from './http'
import type { Category, CategoryInput } from './types'

export const listCategories = () => request<Category[]>('/categories')

export const createCategory = (input: CategoryInput) => request<Category>('/categories', jsonBody('POST', input))

export const updateCategory = (id: number, input: CategoryInput) =>
  request<Category>(`/categories/${id}`, jsonBody('PUT', input))

export const deleteCategory = (id: number) => request<void>(`/categories/${id}`, { method: 'DELETE' })
