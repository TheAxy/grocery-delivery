import { observer } from 'mobx-react-lite'
import React, { Suspense, lazy } from 'react'
import { NavLink, Navigate, Route, Routes, useNavigate } from 'react-router-dom'
import { LoginPage, RegisterPage, useSessionModel } from '@grocery-delivery/app-core'

const CatalogPage = lazy(() => import('catalogMf/CatalogPage'))
const AdminProductsPage = lazy(() => import('catalogMf/AdminProductsPage'))
const OrdersPage = lazy(() => import('accountMf/OrdersPage'))
const ProfilePage = lazy(() => import('accountMf/ProfilePage'))

function RemoteFallback() {
  return <div className="panel"><div className="placeholder">Загрузка microfrontend...</div></div>
}

const ProtectedRoutes = observer(function ProtectedRoutes() {
  const { isAdmin } = useSessionModel()

  return (
    <Suspense fallback={<RemoteFallback />}>
      <Routes>
        <Route path="/" element={<Navigate to={isAdmin ? '/catalog/admin' : '/catalog'} replace />} />
        <Route path="/catalog" element={<CatalogPage />} />
        <Route path="/catalog/admin" element={isAdmin ? <AdminProductsPage /> : <Navigate to="/catalog" replace />} />
        <Route path="/admin/products" element={<Navigate to="/catalog/admin" replace />} />
        <Route path="/account/orders" element={isAdmin ? <Navigate to="/catalog/admin" replace /> : <OrdersPage />} />
        <Route path="/orders" element={<Navigate to="/account/orders" replace />} />
        <Route path="/account/profile" element={<ProfilePage />} />
        <Route path="/profile" element={<Navigate to="/account/profile" replace />} />
        <Route path="*" element={<Navigate to={isAdmin ? '/catalog/admin' : '/catalog'} replace />} />
      </Routes>
    </Suspense>
  )
})

function GuestRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

const App = observer(function App() {
  const { isAuthenticated, user, isAdmin, logout, isBootstrapping } = useSessionModel()
  const navigate = useNavigate()

  if (isAuthenticated && isBootstrapping && !user) {
    return <div className="panel"><div className="placeholder">Загрузка профиля...</div></div>
  }

  return (
    <div className="shell">
      <header className="header">
        <div>
          <h1>FreshBox</h1>
          <p>Монорепозиторий с host и microfrontend-приложениями</p>
        </div>
        <nav className="nav">
          {isAuthenticated ? (
            <>
              <NavLink to="/catalog">Каталог</NavLink>
              {isAdmin ? <NavLink to="/catalog/admin">Админка</NavLink> : <NavLink to="/account/orders">Заказы</NavLink>}
              <NavLink to="/account/profile">Профиль</NavLink>
              <button
                className="ghost-button"
                onClick={() => {
                  logout()
                  navigate('/')
                }}
              >
                Выйти
              </button>
            </>
          ) : (
            <>
              <NavLink to="/">Вход</NavLink>
              <NavLink to="/register">Регистрация</NavLink>
            </>
          )}
        </nav>
      </header>
      <main className="content">{isAuthenticated ? <ProtectedRoutes /> : <GuestRoutes />}</main>
      <footer className="footer">
        <span>Пользователь: {user ? `${user.name} (${user.role})` : 'гость'}</span>
        <span>Менеджер состояний: {process.env.STATE_MANAGER === 'mobx' ? 'MobX' : 'Redux RTK'}</span>
      </footer>
    </div>
  )
})

export default App
