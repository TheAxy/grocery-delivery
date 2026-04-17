import { observer } from 'mobx-react-lite'
import { useOrdersResource, useSessionModel, useSharedStats } from '../state/manager'

export const ProfilePage = observer(function ProfilePage() {
  const { user, isAdmin } = useSessionModel()
  const ordersQuery = useOrdersResource()
  const stats = useSharedStats()

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
        {isAdmin ? (
          <>
            <div className="profile-row">
              <span>Товаров в каталоге</span>
              <strong>{stats.productCount}</strong>
            </div>
            <div className="profile-row">
              <span>Категорий</span>
              <strong>{stats.categoryCount}</strong>
            </div>
          </>
        ) : (
          <>
            <div className="profile-row">
              <span>Всего заказов</span>
              <strong>{stats.orderCount}</strong>
            </div>
            <div className="profile-row">
              <span>Активные заказы</span>
              <strong>{stats.activeOrdersCount}</strong>
            </div>
          </>
        )}
      </div>
      {!isAdmin && ordersQuery.error && <div className="error">{ordersQuery.error}</div>}
    </section>
  )
})
