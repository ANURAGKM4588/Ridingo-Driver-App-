import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import DriverApp from './DriverApp.tsx'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <DriverApp />
  </StrictMode>,
)
