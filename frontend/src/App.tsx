import { observer } from 'mobx-react-lite'
import { NavLink, Navigate, Route, Routes, useNavigate } from 'react-router-dom'
import { AdminProductsPage } from './pages/AdminProductsPage'
import { LoginPage } from './pages/LoginPage'
import { OrdersPage } from './pages/OrdersPage'
import { ProductsPage } from './pages/ProductsPage'
import { ProfilePage } from './pages/ProfilePage'
import { RegisterPage } from './pages/RegisterPage'
import { useSessionModel } from './state/manager'

const ProtectedRoutes = observer(function ProtectedRoutes() {
  const { isAdmin } = useSessionModel()

  return (
    <Routes>
      <Route path="/" element={<ProductsPage />} />
      <Route path="/orders" element={isAdmin ? <Navigate to="/admin/products" replace /> : <OrdersPage />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/admin/products" element={isAdmin ? <AdminProductsPage /> : <Navigate to="/" replace />} />
      <Route path="*" element={<Navigate to={isAdmin ? '/admin/products' : '/'} replace />} />
    </Routes>
  )
})

function GuestRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="*" element={<LoginPage />} />
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
          <p>Личный кабинет доставки продуктов питания</p>
        </div>
        <nav className="nav">
          {isAuthenticated ? (
            <>
              <NavLink to="/">Каталог</NavLink>
              {!isAdmin && <NavLink to="/orders">Заказы</NavLink>}
              {isAdmin && <NavLink to="/admin/products">Админка</NavLink>}
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
        {isAuthenticated ? <ProtectedRoutes /> : <GuestRoutes />}
      </main>
      <footer className="footer">
        <span>Пользователь: {user ? `${user.name} (${user.role})` : 'гость'}</span>
        <span>Менеджер состояний: {import.meta.env.VITE_STATE_MANAGER === 'mobx' ? 'MobX' : 'Redux RTK'}</span>
      </footer>
    </div>
  )
})

export default App
