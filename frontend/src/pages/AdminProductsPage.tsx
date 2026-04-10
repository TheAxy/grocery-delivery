import { observer } from 'mobx-react-lite'
import { ProductPayload } from '@grocery-delivery/shared'
import { FormEvent, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAdminProductActions, useProductsResource, useSessionModel } from '../state/manager'

const initialForm: ProductPayload = {
  name: '',
  description: '',
  category: '',
  price: 0,
  imageUrl: ''
}

export const AdminProductsPage = observer(function AdminProductsPage() {
  const { user } = useSessionModel()
  const productsQuery = useProductsResource()
  const { createProduct, updateProduct, deleteProduct, isSaving, error: mutationError } = useAdminProductActions()
  const products = [...productsQuery.data].sort((a, b) => a.id - b.id)
  const [form, setForm] = useState<ProductPayload>(initialForm)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

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
    setError('')
    setMessage('')

    try {
      const payload = {
        ...form,
        price: Number(form.price)
      }

      if (editingId) {
        await updateProduct(editingId, payload)
        setMessage('Товар обновлён')
      } else {
        await createProduct(payload)
        setMessage('Товар добавлен')
      }
      resetForm()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось сохранить товар')
    }
  }

  const onEdit = (product: typeof products[number]) => {
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
    setError('')
    setMessage('')

    try {
      await deleteProduct(productId)
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
        {(error || mutationError || productsQuery.error) && <div className="error">{error || mutationError || productsQuery.error}</div>}
        {message && <div className="success">{message}</div>}
        {productsQuery.loading ? (
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
            <button type="submit" disabled={isSaving}>{isSaving ? 'Сохранение...' : editingId ? 'Сохранить изменения' : 'Добавить товар'}</button>
            <button type="button" className="ghost-button" onClick={resetForm}>Сбросить</button>
          </div>
        </form>
      </aside>
    </div>
  )
})
