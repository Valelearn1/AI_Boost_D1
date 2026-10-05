export interface CategoryRef {
  id: number
  name: string
  color: string
}

export interface Category extends CategoryRef {
  expenseCount: number
}

export interface CategoryInput {
  name: string
  color: string
}

export interface Expense {
  id: number
  amount: number
  date: string
  description: string | null
  category: CategoryRef
}

export interface ExpenseInput {
  amount: number
  date: string
  description: string | null
  categoryId: number
}

/** amount e sourceMonth sono null se non c'è budget; sourceMonth ≠ month se ereditato. */
export interface Budget {
  month: string
  amount: number | null
  sourceMonth: string | null
}

export interface CategoryTotal {
  categoryId: number
  name: string
  color: string
  total: number
}

export interface Summary {
  month: string
  total: number
  budget: number | null
  budgetSourceMonth: string | null
  remaining: number | null
  byCategory: CategoryTotal[]
}
