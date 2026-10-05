import './BudgetBar.css'

interface BudgetBarProps {
  spent: number
  budget: number | null
  /** "cover" sulla copertina blu, "paper" sulla pagina bianca. */
  tone?: 'cover' | 'paper'
}

/** La barra del budget è una passata di evidenziatore giallo; oltre il budget finisce in corallo. */
export function BudgetBar({ spent, budget, tone = 'cover' }: BudgetBarProps) {
  const ratio = budget ? Math.min(spent / budget, 1) : 0
  const over = budget !== null && spent > budget
  return (
    <div
      className={`budget-bar budget-bar--${tone}`}
      role="progressbar"
      aria-label="Budget usato"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(ratio * 100)}
    >
      <span className="budget-bar__fill" style={{ width: `${ratio * 100}%` }} />
      {over ? <span className="budget-bar__over" /> : null}
    </div>
  )
}
