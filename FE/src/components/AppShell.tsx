import { Link, NavLink, Outlet } from 'react-router'
import { CalendarIcon, PlusIcon, TagIcon } from './icons'
import './AppShell.css'

/** Schermate con la barra in basso: Mese · + · Categorie, raggiungibili col pollice. */
export function AppShell() {
  return (
    <div className="shell">
      <main>
        <Outlet />
      </main>
      <nav className="tabbar" aria-label="Sezioni">
        <div className="tabbar__inner">
          <NavLink to="/" end className="tabbar__tab">
            <CalendarIcon />
            <span>Mese</span>
          </NavLink>
          <Link to="/spese/nuova" className="tabbar__add" aria-label="Aggiungi spesa" data-spark="#ffe45c">
            <PlusIcon />
          </Link>
          <NavLink to="/categorie" className="tabbar__tab">
            <TagIcon />
            <span>Categorie</span>
          </NavLink>
        </div>
      </nav>
    </div>
  )
}
