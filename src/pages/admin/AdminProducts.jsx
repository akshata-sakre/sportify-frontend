import { useState, useEffect } from 'react'
import { getAllProducts, getAllSports, addProduct, updateProduct, deleteProduct } from '../../services/api'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faShirt, faBolt, faPlus, faTrash } from '@fortawesome/free-solid-svg-icons'

const emptyForm = {
  sportId: '', productName: '', description: '',
  price: '', stock: '', imageUrl: '', category: ''
}

export default function AdminProducts() {
  const [products, setProducts] = useState([])
  const [sports, setSports] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchAll()
    getAllSports().then(res => setSports(res.data))
  }, [])

  const fetchAll = () => getAllProducts().then(res => setProducts(res.data))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const payload = {
        productName: form.productName,
        description: form.description,
        price: parseFloat(form.price),
        stock: parseInt(form.stock),
        imageUrl: form.imageUrl,
        category: form.category
      }
      if (editingId) {
        await updateProduct(editingId, payload)
      } else {
        await addProduct(form.sportId, payload)
      }
      setShowForm(false)
      setForm(emptyForm)
      setEditingId(null)
      fetchAll()
    } catch (err) {
      alert(editingId ? 'Failed to update product' : 'Failed to add product')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (product) => {
    setShowForm(true)
    setEditingId(product.id)
    setForm({
      sportId: String(product.sport?.id || ''),
      productName: product.productName,
      description: product.description || '',
      price: String(product.price),
      stock: String(product.stock),
      imageUrl: product.imageUrl || '',
      category: product.category
    })
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product?')) return
    await deleteProduct(id)
    fetchAll()
  }

  return (
    <div className="admin-page">
      <div className="admin-page__header">
        <div>
          <p className="admin-page__eyebrow"><FontAwesomeIcon icon={faBolt} /> MANAGE</p>
          <h1 className="admin-page__title">PRODUCTS</h1>
        </div>
        <button className="admin-add-btn" onClick={() => { setShowForm(!showForm); setForm(emptyForm); setEditingId(null) }}>
          <FontAwesomeIcon icon={faPlus} /> ADD PRODUCT
        </button>
      </div>

      {showForm && (
        <form className="admin-form" onSubmit={handleSubmit}>
          <div className="admin-form__grid">
            <div className="admin-form__group">
              <label>Sport</label>
              <select value={form.sportId} onChange={e => setForm({ ...form, sportId: e.target.value })} disabled={!!editingId} required>
                <option value="">Select Sport</option>
                {sports.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div className="admin-form__group">
              <label>Product Name</label>
              <input type="text" placeholder="India Cricket Jersey" value={form.productName} onChange={e => setForm({ ...form, productName: e.target.value })} required />
            </div>
            <div className="admin-form__group">
              <label>Category</label>
              <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} required>
                <option value="">Select Category</option>
                <option>Jersey</option>
                <option>Cap</option>
                <option>Trophy</option>
                <option>Accessories</option>
              </select>
            </div>
            <div className="admin-form__group">
              <label>Price (₹)</label>
              <input type="number" placeholder="999" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} required />
            </div>
            <div className="admin-form__group">
              <label>Stock</label>
              <input type="number" placeholder="100" value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })} required />
            </div>
            <div className="admin-form__group">
              <label>Image URL</label>
              <input type="text" placeholder="https://..." value={form.imageUrl} onChange={e => setForm({ ...form, imageUrl: e.target.value })} />
            </div>
            <div className="admin-form__group admin-form__group--full">
              <label>Description</label>
              <textarea placeholder="Product description..." value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
            </div>
          </div>
          <button type="submit" className="admin-submit-btn" disabled={loading}>
            {loading ? (editingId ? 'UPDATING...' : 'ADDING...') : (editingId ? 'UPDATE PRODUCT' : 'ADD PRODUCT')}
          </button>
        </form>
      )}

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Product</th>
              <th>Category</th>
              <th>Sport</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {products.map(p => (
              <tr key={p.id}>
                <td>#{p.id}</td>
                <td><strong>{p.productName}</strong></td>
                <td>{p.category}</td>
                <td>{p.sport?.name}</td>
                <td>₹{p.price}</td>
                <td>{p.stock}</td>
                <td style={{ display: 'flex', gap: '10px' }}>
                  <button className="admin-submit-btn" type="button" onClick={() => handleEdit(p)}>
                    EDIT
                  </button>
                  <button className="admin-delete-btn" onClick={() => handleDelete(p.id)}>
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}