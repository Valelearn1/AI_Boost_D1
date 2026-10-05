import { useReducedMotion } from 'motion/react'
import type { ReactNode } from 'react'
import { Link } from 'react-router'
import BlurText from './vendor/BlurText'
import ShapeGrid from './vendor/ShapeGrid'
import { ChevronLeftIcon } from './icons'
import './CoverHeader.css'

interface CoverHeaderProps {
  title: string
  /** Indirizzo del pulsante "Indietro"; in alternativa `start`. */
  backTo?: string
  start?: ReactNode
  end?: ReactNode
  children?: ReactNode
}

const TITLE_FROM = { filter: 'blur(6px)', opacity: 0, y: -6 }
const TITLE_TO = [{ filter: 'blur(0px)', opacity: 1, y: 0 }]

/** La copertina blu del diario: quadretti in movimento, titolo che si rivela, azioni ai lati. */
export function CoverHeader({ title, backTo, start, end, children }: CoverHeaderProps) {
  const reduceMotion = useReducedMotion()
  return (
    <header className="cover">
      <div className="cover__decor" aria-hidden="true">
        <ShapeGrid
          direction="diagonal"
          speed={reduceMotion ? 0 : 0.12}
          squareSize={28}
          borderColor="rgba(255, 255, 255, 0.07)"
          hoverFillColor="rgba(255, 228, 92, 0.22)"
          hoverTrailAmount={4}
        />
      </div>
      <div className="cover__inner">
        <div className="cover__bar">
          <div className="cover__slot">
            {backTo ? (
              <Link to={backTo} className="cover__icon" aria-label="Indietro">
                <ChevronLeftIcon />
              </Link>
            ) : (
              start
            )}
          </div>
          <h1 className="cover__title">
            <span className="visually-hidden">{title}</span>
            <BlurText
              key={title}
              text={title}
              animateBy="letters"
              delay={22}
              stepDuration={0.32}
              animationFrom={TITLE_FROM}
              animationTo={TITLE_TO}
            />
          </h1>
          <div className="cover__slot cover__slot--end">{end}</div>
        </div>
        {children}
      </div>
    </header>
  )
}
