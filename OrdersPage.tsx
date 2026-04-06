import { useOrdersResource, useOrderActions } from '../state/manager'

export function OrdersPage() {
  const ordersQuery = useOrdersResource()
  const { cancelOrder } = useOrderActions()
  const orders = ordersQuery.data

  const onCancel = async (orderId: number) => {
    try {
      await cancelOrder(orderId)
    } catch {
    }
  }

  if (ordersQuery.loading) {
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
      {ordersQuery.error && <div className="error">{ordersQuery.error}</div>}
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
                <span className={`status status-${order.status}`}>{order.status}</span>
              </div>
              <p><strong>Адрес:</strong> {order.deliveryAddress}</p>
              <div className="order-items">
                {order.items.map((item) => (
                  <div key={`${order.id}-${item.productId}`} className="order-item-row">
                    <span>{item.productName}</span>
                    <span>{item.quantity} × {item.price.toFixed(2)} ₽</span>
                    <strong>{item.total.toFixed(2)} ₽</strong>
                  </div>
                ))}
              </div>
              <div className="summary">
                <span>Сумма заказа</span>
                <strong>{order.total.toFixed(2)} ₽</strong>
              </div>
              {order.status === 'created' && (
                <button className="danger-button" onClick={() => onCancel(order.id)}>Отменить заказ</button>
              )}
            </article>
          ))}
        </div>
      )}
    </section>
  )
}
