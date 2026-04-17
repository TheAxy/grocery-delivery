import { Product, ProductPayload } from '@grocery-delivery/shared'
import { FormEvent, useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { api } from '../api'
import { useAppStore } from '../store'

const initialForm: ProductPayload = {
  name: '',
  description: '',
  category: '',
  price: 0,
  imageUrl: ''
}

export function AdminProductsPage() {
  const { token, user } = useAppStore()
  const [products, setProducts] = useState<Product[]>([])
  const [form, setForm] = useState<ProductPayload>(initialForm)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const loadProducts = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await api.products()
      setProducts(response)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось загрузить товары')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadProducts()
  }, [])

  if (!user) {
    return null
  }

  if (user.role !== 'admin') {
    return <Navigate to="/" replace />
  }

  const resetForm = () => {
    setForm(initialForm)
    setEditingId(null)
  }

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (!token) {
      return
    }

    setSaving(true)
    setError('')
    setMessage('')

    try {
      const payload = {
        ...form,
        price: Number(form.price)
      }

      if (editingId) {
        const updated = await api.updateProduct(editingId, payload, token)
        setProducts((current) => current.map((product) => product.id === editingId ? updated : product))
        setMessage('Товар обновлён')
      } else {
        const created = await api.createProduct(payload, token)
        setProducts((current) => [...current, created].sort((a, b) => a.id - b.id))
        setMessage('Товар добавлен')
      }
      resetForm()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось сохранить товар')
    } finally {
      setSaving(false)
    }
  }

  const onEdit = (product: Product) => {
    setEditingId(product.id)
    setForm({
      name: product.name,
      description: product.description,
      category: product.category,
      price: product.price,
      imageUrl: product.imageUrl
    })
    setMessage('')
    setError('')
  }

  const onDelete = async (productId: number) => {
    if (!token) {
      return
    }

    setError('')
    setMessage('')

    try {
      await api.deleteProduct(productId, token)
      setProducts((current) => current.filter((product) => product.id !== productId))
      if (editingId === productId) {
        resetForm()
      }
      setMessage('Товар удалён')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось удалить товар')
    }
  }

  return (
    <div className="layout-grid admin-layout">
      <section className="panel">
        <div className="section-head">
          <div>
            <h2>Управление товарами</h2>
            <p>Добавление, редактирование и удаление карточек каталога</p>
          </div>
        </div>
        {error && <div className="error">{error}</div>}
        {message && <div className="success">{message}</div>}
        {loading ? (
          <div className="placeholder">Загрузка товаров...</div>
        ) : (
          <div className="admin-products">
            {products.map((product) => (
              <article className="admin-product-card" key={product.id}>
                <img src={product.imageUrl} alt={product.name} className="admin-product-image" />
                <div className="admin-product-body">
                  <div className="badge">{product.category}</div>
                  <h3>{product.name}</h3>
                  <p>{product.description}</p>
                  <div className="admin-product-bottom">
                    <strong>{product.price.toFixed(2)} ₽</strong>
                    <div className="admin-actions">
                      <button type="button" className="ghost-button" onClick={() => onEdit(product)}>Изменить</button>
                      <button type="button" className="danger-button" onClick={() => onDelete(product.id)}>Удалить</button>
                    </div>
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
            <h2>{editingId ? `Редактирование товара #${editingId}` : 'Новый товар'}</h2>
            <p>{editingId ? 'Измените данные карточки и сохраните их' : 'Заполните форму для добавления товара'}</p>
          </div>
        </div>

        <form className="form" onSubmit={onSubmit}>
          <label>
            <span>Название</span>
            <input value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} />
          </label>
          <label>
            <span>Описание</span>
            <textarea rows={4} value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} />
          </label>
          <label>
            <span>Категория</span>
            <input value={form.category} onChange={(event) => setForm((current) => ({ ...current, category: event.target.value }))} />
          </label>
          <label>
            <span>Цена</span>
            <input type="number" min="0" step="0.01" value={form.price} onChange={(event) => setForm((current) => ({ ...current, price: Number(event.target.value) }))} />
          </label>
          <label>
            <span>Ссылка на изображение</span>
            <input value={form.imageUrl} onChange={(event) => setForm((current) => ({ ...current, imageUrl: event.target.value }))} />
          </label>
          <div className="form-actions">
            <button type="submit" disabled={saving}>{saving ? 'Сохранение...' : editingId ? 'Сохранить изменения' : 'Добавить товар'}</button>
            <button type="button" className="ghost-button" onClick={resetForm}>Сбросить</button>
          </div>
        </form>
      </aside>
    </div>
  )
}
