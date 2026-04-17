import { useEffect, useState } from 'react'
import { Order } from '@grocery-delivery/shared'
import { api } from '../api'
import { useAppStore } from '../store'

export function OrdersPage() {
  const { token } = useAppStore()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadOrders = async () => {
    if (!token) {
      return
    }

    setLoading(true)
    setError('')
    try {
      const response = await api.orders(token)
      setOrders(response)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось загрузить заказы')
    } finally {
      setLoading(false)
    }
  }

  const cancelOrder = async (orderId: number) => {
    if (!token) {
      return
    }

    try {
      const updated = await api.cancelOrder(orderId, token)
      setOrders((current) => current.map((order) => order.id === orderId ? updated : order))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось отменить заказ')
    }
  }

  useEffect(() => {
    loadOrders()
  }, [])

  if (loading) {
    return <div className="panel"><div className="placeholder">Загрузка заказов...</div></div>
  }

  return (
    <section className="panel">
      <div className="section-head">
        <div>
          <h2>Мои заказы</h2>
          <p>История оформленных доставок</p>
        </div>
      </div>
      {error && <div className="error">{error}</div>}
      {!orders.length ? (
        <div className="placeholder">У вас пока нет заказов</div>
      ) : (
        <div className="orders-list">
          {orders.map((order) => (
            <article key={order.id} className="order-card">
              <div className="order-head">
                <div>
                  <h3>Заказ #{order.id}</h3>
                  <p>{new Date(order.createdAt).toLocaleString('ru-RU')}</p>
                </div>
                <div className={`status ${order.status}`}>{order.status === 'created' ? 'создан' : 'отменён'}</div>
              </div>
              <p><strong>Адрес:</strong> {order.deliveryAddress}</p>
              <div className="order-items">
                {order.items.map((item) => (
                  <div key={`${order.id}-${item.productId}`} className="order-item">
                    <span>{item.productName}</span>
                    <span>{item.quantity} шт.</span>
                    <span>{item.total.toFixed(2)} ₽</span>
                  </div>
                ))}
              </div>
              <div className="summary">
                <span>Сумма заказа</span>
                <strong>{order.total.toFixed(2)} ₽</strong>
              </div>
              {order.status === 'created' && (
                <button className="danger-button" onClick={() => cancelOrder(order.id)}>Отменить заказ</button>
              )}
            </article>
          ))}
        </div>
      )}
    </section>
  )
}
