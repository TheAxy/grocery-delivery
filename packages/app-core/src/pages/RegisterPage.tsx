import { observer } from 'mobx-react-lite'
import { FormEvent, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useSessionModel } from '../state/manager'

export const RegisterPage = observer(function RegisterPage() {
  const navigate = useNavigate()
  const { register } = useSessionModel()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [address, setAddress] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setLoading(true)
    setError('')

    try {
      await register({ name, email, password, address })
      navigate('/')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось выполнить регистрацию')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-card">
      <h2>Регистрация</h2>
      <form className="form" onSubmit={onSubmit}>
        <label>
          <span>Имя</span>
          <input value={name} onChange={(event) => setName(event.target.value)} />
        </label>
        <label>
          <span>Email</span>
          <input value={email} onChange={(event) => setEmail(event.target.value)} type="email" />
        </label>
        <label>
          <span>Пароль</span>
          <input value={password} onChange={(event) => setPassword(event.target.value)} type="password" />
        </label>
        <label>
          <span>Адрес доставки</span>
          <textarea value={address} onChange={(event) => setAddress(event.target.value)} rows={4} />
        </label>
        {error && <div className="error">{error}</div>}
        <button type="submit" disabled={loading}>{loading ? 'Создание аккаунта...' : 'Создать аккаунт'}</button>
      </form>
      <p className="muted">
        Уже есть аккаунт? <Link to="/">Войти</Link>
      </p>
    </div>
  )
})
