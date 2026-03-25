import { Product } from '@grocery-delivery/shared'
import { FormEvent, useEffect, useMemo, useState } from 'react'
import { api } from '../api'
import { useAppStore } from '../store'

export function ProductsPage() {
  const { token, user, cart, addToCart, changeQuantity, clearCart, removeFromCart } = useAppStore()
  const [products, setProducts] = useState<Product[]>([])
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [deliveryAddress, setDeliveryAddress] = useState(user?.address || '')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loadingProducts, setLoadingProducts] = useState(true)
  const [placingOrder, setPlacingOrder] = useState(false)

  useEffect(() => {
    setDeliveryAddress(user?.address || '')
  }, [user])

  const loadProducts = async () => {
    setLoadingProducts(true)
    try {
      const response = await api.products(search, category)
      setProducts(response)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось загрузить каталог')
    } finally {
      setLoadingProducts(false)
    }
  }

  useEffect(() => {
    loadProducts()
  }, [])

  const categories = useMemo(() => Array.from(new Set(products.map((product) => product.category))), [products])

  const cartView = useMemo(() => cart.map((item) => {
    const product = products.find((entry) => entry.id === item.productId)
    return product ? { ...product, quantity: item.quantity, lineTotal: product.price * item.quantity } : null
  }).filter(Boolean) as Array<Product & { quantity: number; lineTotal: number }>, [cart, products])

  const cartTotal = cartView.reduce((sum, item) => sum + item.lineTotal, 0)

  const onSearch = async (event: FormEvent) => {
    event.preventDefault()
    await loadProducts()
  }

  const onOrder = async (event: FormEvent) => {
    event.preventDefault()
    if (!token) {
      return
    }

    setError('')
    setMessage('')
    setPlacingOrder(true)

    try {
      await api.createOrder({ deliveryAddress, items: cart }, token)
      setMessage('Заказ успешно создан')
      clearCart()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось оформить заказ')
    } finally {
      setPlacingOrder(false)
    }
  }

  return (
    <div className="layout-grid">
      <section className="panel">
        <div className="section-head">
          <div>
            <h2>Каталог</h2>
            <p>Выберите продукты и добавьте их в заказ</p>
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

        {loadingProducts ? (
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
                    <button onClick={() => addToCart(product)} type="button">В корзину</button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <aside className="panel">
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
          <button type="submit" disabled={!cartView.length || placingOrder}>
            {placingOrder ? 'Оформление...' : 'Оформить заказ'}
          </button>
        </form>
      </aside>
    </div>
  )
}
