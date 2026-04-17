import { NavLink, Navigate, Route, Routes, useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import { AdminProductsPage } from './pages/AdminProductsPage'
import { LoginPage } from './pages/LoginPage'
import { OrdersPage } from './pages/OrdersPage'
import { ProductsPage } from './pages/ProductsPage'
import { ProfilePage } from './pages/ProfilePage'
import { RegisterPage } from './pages/RegisterPage'
import { useAppStore } from './store'

function ProtectedRoutes() {
  const { user } = useAppStore()
  const isAdmin = user?.role === 'admin'

  return (
    <Routes>
      <Route path="/" element={<ProductsPage />} />
      <Route path="/orders" element={isAdmin ? <Navigate to="/admin/products" replace /> : <OrdersPage />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/admin/products" element={isAdmin ? <AdminProductsPage /> : <Navigate to="/" replace />} />
      <Route path="*" element={<Navigate to={isAdmin ? '/admin/products' : '/'} replace />} />
    </Routes>
  )
}

function GuestRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="*" element={<LoginPage />} />
    </Routes>
  )
}

export default function App() {
  const { token, user, refreshProfile, logout } = useAppStore()
  const navigate = useNavigate()

  useEffect(() => {
    if (token) {
      refreshProfile().catch(() => logout())
    }
  }, [token])

  return (
    <div className="shell">
      <header className="header">
        <div>
          <h1>FreshBox</h1>
          <p>Личный кабинет доставки продуктов питания</p>
        </div>
        <nav className="nav">
          {token ? (
            <>
              <NavLink to="/">Каталог</NavLink>
              {user?.role !== 'admin' && <NavLink to="/orders">Заказы</NavLink>}
              {user?.role === 'admin' && <NavLink to="/admin/products">Админка</NavLink>}
              <NavLink to="/profile">Профиль</NavLink>
              <button className="ghost-button" onClick={() => {
                logout()
                navigate('/')
              }}>Выйти</button>
            </>
          ) : (
            <>
              <NavLink to="/">Вход</NavLink>
              <NavLink to="/register">Регистрация</NavLink>
            </>
          )}
        </nav>
      </header>
      <main className="content">
        {token ? <ProtectedRoutes /> : <GuestRoutes />}
      </main>
      <footer className="footer">
        <span>Пользователь: {user ? `${user.name} (${user.role})` : 'гость'}</span>
      </footer>
    </div>
  )
}
