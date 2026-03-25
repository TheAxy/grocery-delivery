import { NavLink, Route, Routes, useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import { LoginPage } from './pages/LoginPage'
import { OrdersPage } from './pages/OrdersPage'
import { ProductsPage } from './pages/ProductsPage'
import { ProfilePage } from './pages/ProfilePage'
import { RegisterPage } from './pages/RegisterPage'
import { useAppStore } from './store'

function ProtectedRoutes() {
  return (
    <Routes>
      <Route path="/" element={<ProductsPage />} />
      <Route path="/orders" element={<OrdersPage />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="*" element={<ProductsPage />} />
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
              <NavLink to="/orders">Заказы</NavLink>
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
        <span>Пользователь: {user ? user.name : 'гость'}</span>
      </footer>
    </div>
  )
}
