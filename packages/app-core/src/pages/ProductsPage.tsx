import { observer } from 'mobx-react-lite'
import { Product } from '@grocery-delivery/shared'
import { FormEvent, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useCartModel, useOrderActions, useProductsResource, useSessionModel } from '../state/manager'

export const ProductsPage = observer(function ProductsPage() {
  const { user, isAdmin } = useSessionModel()
  const { cart, addToCart, changeQuantity, clearCart, removeFromCart } = useCartModel()
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [deliveryAddress, setDeliveryAddress] = useState(user?.address || '')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const productsQuery = useProductsResource(search, category)
  const { createOrder, isCreating } = useOrderActions()

  useEffect(() => {
    setDeliveryAddress(user?.address || '')
  }, [user])

  const products = productsQuery.data
  const categories = Array.from(new Set(products.map((product) => product.category)))

  const cartView = cart.map((item) => {
    const product = products.find((entry) => entry.id === item.productId)
    return product ? { ...product, quantity: item.quantity, lineTotal: product.price * item.quantity } : null
  }).filter(Boolean) as Array<Product & { quantity: number; lineTotal: number }>

  const cartTotal = cartView.reduce((sum, item) => sum + item.lineTotal, 0)

  const onSearch = async (event: FormEvent) => {
    event.preventDefault()
    productsQuery.refetch()
  }

  const onOrder = async (event: FormEvent) => {
    event.preventDefault()
    if (isAdmin) {
      return
    }

    setError('')
    setMessage('')

    try {
      await createOrder({ deliveryAddress, items: cart })
      setMessage('Заказ успешно создан')
      clearCart()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось оформить заказ')
    }
  }

  return (
    <div className="layout-grid">
      <section className="panel">
        <div className="section-head">
          <div>
            <h2>Каталог</h2>
            <p>{isAdmin ? 'Просмотр товаров доступен и в режиме администратора' : 'Выберите продукты и добавьте их в заказ'}</p>
          </div>
        </div>

        <form className="search-bar" onSubmit={onSearch}>
          <input
            placeholder="Поиск по названию или описанию"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <select value={category} onChange={(event) => setCategory(event.target.value)}>
            <option value="">Все категории</option>
            {categories.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
          <button type="submit">Найти</button>
        </form>

        {productsQuery.error && <div className="error">{productsQuery.error}</div>}
        {productsQuery.loading ? (
          <div className="placeholder">Загрузка каталога...</div>
        ) : (
          <div className="product-grid">
            {products.map((product) => (
              <article className="card" key={product.id}>
                <img src={product.imageUrl} alt={product.name} className="product-image" />
                <div className="card-body">
                  <div className="badge">{product.category}</div>
                  <h3>{product.name}</h3>
                  <p>{product.description}</p>
                  <div className="price-row">
                    <strong>{product.price.toFixed(2)} ₽</strong>
                    {!isAdmin && <button onClick={() => addToCart(product)} type="button">В корзину</button>}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <aside className="panel">
        {isAdmin ? (
          <div className="admin-note">
            <h2>Режим администратора</h2>
            <p>Для управления карточками товаров используйте административный раздел.</p>
            <Link className="admin-link" to="/admin/products">Перейти в админку</Link>
          </div>
        ) : (
          <>
            <div className="section-head">
              <div>
                <h2>Корзина</h2>
                <p>Оформление доставки</p>
              </div>
            </div>

            {cartView.length === 0 ? (
              <div className="placeholder">Корзина пуста</div>
            ) : (
              <div className="cart-list">
                {cartView.map((item) => (
                  <div className="cart-item" key={item.id}>
                    <div>
                      <strong>{item.name}</strong>
                      <span>{item.price.toFixed(2)} ₽ за единицу</span>
                    </div>
                    <div className="cart-actions">
                      <input
                        type="number"
                        min={1}
                        value={item.quantity}
                        onChange={(event) => changeQuantity(item.id, Number(event.target.value))}
                      />
                      <button type="button" className="danger-button" onClick={() => removeFromCart(item.id)}>Удалить</button>
                    </div>
                    <div className="line-total">{item.lineTotal.toFixed(2)} ₽</div>
                  </div>
                ))}
              </div>
            )}

            <form className="form" onSubmit={onOrder}>
              <label>
                <span>Адрес доставки</span>
                <textarea
                  rows={4}
                  value={deliveryAddress}
                  onChange={(event) => setDeliveryAddress(event.target.value)}
                />
              </label>
              <div className="summary">
                <span>Итог</span>
                <strong>{cartTotal.toFixed(2)} ₽</strong>
              </div>
              {message && <div className="success">{message}</div>}
              {error && <div className="error">{error}</div>}
              <button type="submit" disabled={!cartView.length || isCreating}>
                {isCreating ? 'Оформление...' : 'Оформить заказ'}
              </button>
            </form>
          </>
        )}
      </aside>
    </div>
  )
})
