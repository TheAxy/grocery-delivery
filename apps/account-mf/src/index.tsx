import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { AppStateProvider } from '@grocery-delivery/app-core'
import OrdersPage from './OrdersPage'

const rootElement = document.getElementById('root')

if (rootElement) {
  createRoot(rootElement).render(
    <React.StrictMode>
      <BrowserRouter>
        <AppStateProvider>
          <OrdersPage />
        </AppStateProvider>
      </BrowserRouter>
    </React.StrictMode>
  )
}
