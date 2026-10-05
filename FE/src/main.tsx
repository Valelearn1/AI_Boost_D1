import '@fontsource-variable/archivo/wdth.css'
import './styles/tokens.css'
import './styles/base.css'
import { MotionConfig } from 'motion/react'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'
import { AppRoutes } from './App'
import ClickSpark from './components/vendor/ClickSpark'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* "user": con "riduci movimento" attivo sul telefono, niente spostamenti e niente layout animati */}
    <MotionConfig reducedMotion="user">
      {/* Scintille solo sugli elementi con data-spark ("+" e i pulsanti di salvataggio) */}
      <ClickSpark sparkSize={9} sparkRadius={22} sparkCount={10} duration={420}>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </ClickSpark>
    </MotionConfig>
  </StrictMode>,
)
