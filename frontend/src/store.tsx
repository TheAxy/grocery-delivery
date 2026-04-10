import { PropsWithChildren } from 'react'
import { AppStateProvider } from './state/manager'

export function AppProvider({ children }: PropsWithChildren) {
  return <AppStateProvider>{children}</AppStateProvider>
}
