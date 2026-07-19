import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import App from './App'
import { CatalogueProvider } from './hooks/useCatalogue'
import { AppStateProvider } from './state/AppStateContext'
import { PwaProvider } from './state/PwaContext'
import './styles.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HashRouter>
      <AppStateProvider>
        <CatalogueProvider>
          <PwaProvider>
            <App />
          </PwaProvider>
        </CatalogueProvider>
      </AppStateProvider>
    </HashRouter>
  </StrictMode>,
)
