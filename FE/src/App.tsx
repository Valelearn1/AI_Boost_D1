import { Navigate, Route, Routes } from 'react-router'
import { AppShell } from './components/AppShell'
import { BudgetPage } from './pages/BudgetPage'
import { CategoriesPage } from './pages/CategoriesPage'
import { ExpenseFormPage } from './pages/ExpenseFormPage'
import { MonthPage } from './pages/MonthPage'

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<MonthPage />} />
        <Route path="categorie" element={<CategoriesPage />} />
      </Route>
      <Route path="spese/nuova" element={<ExpenseFormPage />} />
      <Route path="spese/:id" element={<ExpenseFormPage />} />
      <Route path="budget/:mese" element={<BudgetPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
