import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { AppStateProvider } from '@grocery-delivery/app-core'
import CatalogPage from './CatalogPage'

const rootElement = document.getElementById('root')

if (rootElement) {
  createRoot(rootElement).render(
    <React.StrictMode>
      <BrowserRouter>
        <AppStateProvider>
          <CatalogPage />
        </AppStateProvider>
      </BrowserRouter>
    </React.StrictMode>
  )
}
