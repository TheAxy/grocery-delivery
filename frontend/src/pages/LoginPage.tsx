import { FormEvent, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../api'
import { useAppStore } from '../store'

export function LoginPage() {
  const navigate = useNavigate()
  const { setAuth } = useAppStore()
  const [email, setEmail] = useState('anna@example.com')
  const [password, setPassword] = useState('password123')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await api.login({ email, password })
      setAuth(response)
      navigate(response.user.role === 'admin' ? '/admin/products' : '/')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось выполнить вход')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-card">
      <h2>Вход</h2>
      <form className="form" onSubmit={onSubmit}>
        <label>
          <span>Email или логин</span>
          <input value={email} onChange={(event) => setEmail(event.target.value)} type="text" />
        </label>
        <label>
          <span>Пароль</span>
          <input value={password} onChange={(event) => setPassword(event.target.value)} type="password" />
        </label>
        {error && <div className="error">{error}</div>}
        <button type="submit" disabled={loading}>{loading ? 'Выполняется вход...' : 'Войти'}</button>
      </form>
      <p className="muted">
        Нет аккаунта? <Link to="/register">Зарегистрироваться</Link>
      </p>
    </div>
  )
}
