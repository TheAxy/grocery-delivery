import { PropsWithChildren } from 'react'
import {
  MobxAppStateProvider,
  useMobxAdminProductActions,
  useMobxCartModel,
  useMobxOrderActions,
  useMobxOrdersResource,
  useMobxProductsResource,
  useMobxSessionModel,
  useMobxSharedStats
} from './mobx/rootStore'
import {
  ReduxAppStateProvider,
  useReduxAdminProductActions,
  useReduxCartModel,
  useReduxOrderActions,
  useReduxOrdersResource,
  useReduxProductsResource,
  useReduxSessionModel,
  useReduxSharedStats
} from './reduxManager'

const stateManager = import.meta.env.VITE_STATE_MANAGER === 'mobx' ? 'mobx' : 'redux'

export function AppStateProvider({ children }: PropsWithChildren) {
  return stateManager === 'mobx'
    ? <MobxAppStateProvider>{children}</MobxAppStateProvider>
    : <ReduxAppStateProvider>{children}</ReduxAppStateProvider>
}

export function useSessionModel() {
  return stateManager === 'mobx' ? useMobxSessionModel() : useReduxSessionModel()
}

export function useCartModel() {
  return stateManager === 'mobx' ? useMobxCartModel() : useReduxCartModel()
}

export function useProductsResource(search = '', category = '') {
  return stateManager === 'mobx' ? useMobxProductsResource(search, category) : useReduxProductsResource(search, category)
}

export function useOrdersResource() {
  return stateManager === 'mobx' ? useMobxOrdersResource() : useReduxOrdersResource()
}

export function useOrderActions() {
  return stateManager === 'mobx' ? useMobxOrderActions() : useReduxOrderActions()
}

export function useAdminProductActions() {
  return stateManager === 'mobx' ? useMobxAdminProductActions() : useReduxAdminProductActions()
}

export function useSharedStats() {
  return stateManager === 'mobx' ? useMobxSharedStats() : useReduxSharedStats()
}
