import { useAppStore } from '../store'

export function ProfilePage() {
  const { user } = useAppStore()

  if (!user) {
    return null
  }

  return (
    <section className="panel profile-card">
      <div className="section-head">
        <div>
          <h2>Профиль</h2>
          <p>Данные текущего пользователя</p>
        </div>
      </div>
      <div className="profile-grid">
        <div className="profile-row">
          <span>Имя</span>
          <strong>{user.name}</strong>
        </div>
        <div className="profile-row">
          <span>Email</span>
          <strong>{user.email}</strong>
        </div>
        <div className="profile-row">
          <span>Роль</span>
          <strong>{user.role}</strong>
        </div>
        <div className="profile-row">
          <span>Адрес</span>
          <strong>{user.address}</strong>
        </div>
      </div>
    </section>
  )
}
