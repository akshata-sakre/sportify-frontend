import { useState, useEffect } from 'react'
import { getAllNews, getAllSports, addNews, updateNews, deleteNews } from '../../services/api'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faNewspaper, faBolt, faPlus, faPen, faTrash } from '@fortawesome/free-solid-svg-icons'

const emptyForm = { sportId: '', title: '', content: '', source: '', sourceUrl: '', imageUrl: '' }

export default function AdminNews() {
  const [news, setNews] = useState([])
  const [sports, setSports] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchAll()
    getAllSports().then(res => setSports(res.data))
  }, [])

  const fetchAll = () => getAllNews().then(res => setNews(res.data))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const payload = {
        title: form.title,
        content: form.content,
        source: form.source,
        sourceUrl: form.sourceUrl,
        imageUrl: form.imageUrl
      }
      if (editingId) {
        await updateNews(editingId, payload)
      } else {
        await addNews(form.sportId, payload)
      }
      setShowForm(false)
      setForm(emptyForm)
      setEditingId(null)
      fetchAll()
    } catch (err) {
      alert(editingId ? 'Failed to update news' : 'Failed to add news')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (item) => {
    setShowForm(true)
    setEditingId(item.id)
    setForm({
      sportId: String(item.sport?.id || ''),
      title: item.title,
      content: item.content,
      source: item.source,
      sourceUrl: item.sourceUrl || '',
      imageUrl: item.imageUrl || ''
    })
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this news?')) return
    await deleteNews(id)
    fetchAll()
  }

  return (
    <div className="admin-page">
      <div className="admin-page__header">
        <div>
          <p className="admin-page__eyebrow"><FontAwesomeIcon icon={faBolt} /> MANAGE</p>
          <h1 className="admin-page__title">NEWS</h1>
        </div>
        <button className="admin-add-btn" onClick={() => { setShowForm(!showForm); setForm(emptyForm); setEditingId(null) }}>
          <FontAwesomeIcon icon={faPlus} /> ADD NEWS
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
              <label>Source</label>
              <input type="text" placeholder="ESPN" value={form.source} onChange={e => setForm({ ...form, source: e.target.value })} required />
            </div>
            <div className="admin-form__group">
              <label>Image URL</label>
              <input type="text" placeholder="https://..." value={form.imageUrl} onChange={e => setForm({ ...form, imageUrl: e.target.value })} />
            </div>
            <div className="admin-form__group admin-form__group--full">
              <label>Article Link (redirects here when card is clicked)</label>
              <input type="text" placeholder="https://espn.com/article..." value={form.sourceUrl} onChange={e => setForm({ ...form, sourceUrl: e.target.value })} required />
            </div>
            <div className="admin-form__group admin-form__group--full">
              <label>Title</label>
              <input type="text" placeholder="News title..." value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
            </div>
            <div className="admin-form__group admin-form__group--full">
              <label>Content</label>
              <textarea placeholder="News content..." value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} required />
            </div>
          </div>
          <button type="submit" className="admin-submit-btn" disabled={loading}>
            {loading ? (editingId ? 'UPDATING...' : 'ADDING...') : (editingId ? 'UPDATE NEWS' : 'ADD NEWS')}
          </button>
        </form>
      )}

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Image</th>
              <th>Title</th>
              <th>Sport</th>
              <th>Source</th>
              <th>Published</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {news.map(item => (
              <tr key={item.id}>
                <td>#{item.id}</td>
                <td>
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      style={{
                        width: "50px",
                        height: "50px",
                        objectFit: "cover",
                        borderRadius: "10px",
                        border: "1px solid rgba(255,0,51,.3)"
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: "50px",
                        height: "50px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        borderRadius: "10px",
                        border: "1px solid rgba(255,0,51,.3)",
                        color: "#ff0033"
                      }}
                    >
                      <FontAwesomeIcon icon={faNewspaper} />
                    </div>
                  )}
                </td>
                <td>{item.title?.slice(0, 40)}...</td>
                <td>{item.sport?.name}</td>
                <td>{item.source}</td>
                <td>{new Date(item.publishedAt).toLocaleDateString()}</td>
                <td style={{ display: 'flex', gap: '10px' }}>
                  <button className="admin-submit-btn" type="button" onClick={() => handleEdit(item)}>
                    <FontAwesomeIcon icon={faPen} /> EDIT
                  </button>
                  <button className="admin-delete-btn" onClick={() => handleDelete(item.id)}>
                    <FontAwesomeIcon icon={faTrash} /> DELETE
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