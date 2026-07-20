import { useState, useEffect } from 'react'
import { getAllMatches, getAllSports, getAllTeams, addMatch, updateMatch, deleteMatch } from '../../services/api'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCalendarDays, faBolt, faPlus, faTrash } from '@fortawesome/free-solid-svg-icons'

const emptyForm = {
  sportId: '', team1Id: '', team2Id: '',
  matchDate: '', venue: '', status: 'UPCOMING',
  ticketPrice: '', totalSeats: '', availableSeats: ''
}

export default function AdminMatches() {
  const [matches, setMatches] = useState([])
  const [sports, setSports] = useState([])
  const [teams, setTeams] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchAll()
    getAllSports().then(res => setSports(res.data))
    getAllTeams().then(res => setTeams(res.data))
  }, [])

  const fetchAll = () => getAllMatches().then(res => setMatches(res.data))

  const filteredTeams = teams.filter(t => t.sport?.id === parseInt(form.sportId))

  console.log("Selected Sport:", form.sportId)
console.log("All Teams:", teams)
console.log("Filtered Teams:", filteredTeams)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const payload = {
        matchDate: form.matchDate,
        venue: form.venue,
        status: form.status,
        ticketPrice: parseFloat(form.ticketPrice),
        totalSeats: parseInt(form.totalSeats),
        availableSeats: parseInt(form.availableSeats)
      }
      if (editingId) {
        await updateMatch(editingId, payload)
      } else {
        await addMatch(form.sportId, form.team1Id, form.team2Id, payload)
      }
      setShowForm(false)
      setForm(emptyForm)
      setEditingId(null)
      fetchAll()
    } catch (err) {
      alert(editingId ? 'Failed to update match' : 'Failed to add match')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (match) => {
    setShowForm(true)
    setEditingId(match.id)
    setForm({
      sportId: String(match.sport.id),
      team1Id: String(match.team1.id),
      team2Id: String(match.team2.id),
      matchDate: match.matchDate?.slice(0, 16),
      venue: match.venue,
      status: match.status,
      ticketPrice: String(match.ticketPrice),
      totalSeats: String(match.totalSeats),
      availableSeats: String(match.availableSeats)
    })
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this match?')) return
    await deleteMatch(id)
    fetchAll()
  }

  return (
    <div className="admin-page">
      <div className="admin-page__header">
        <div>
          <p className="admin-page__eyebrow"><FontAwesomeIcon icon={faBolt} /> MANAGE</p>
          <h1 className="admin-page__title">MATCHES</h1>
        </div>
        <button className="admin-add-btn" onClick={() => { setShowForm(!showForm); setForm(emptyForm); setEditingId(null) }}>
          <FontAwesomeIcon icon={faPlus} /> ADD MATCH
        </button>
      </div>

      {showForm && (
        <form className="admin-form" onSubmit={handleSubmit}>
          <div className="admin-form__grid">
            <div className="admin-form__group">
              <label>Sport</label>
             <select
  value={form.sportId}
  onChange={(e) => {
    console.log("Sport Selected:", e.target.value)

    setForm({
      ...form,
      sportId: e.target.value,
      team1Id: "",
      team2Id: ""
    })
  }}
  disabled={!!editingId}
  required
>
                <option value="">Select Sport</option>
                {sports.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div className="admin-form__group">
              <label>Team 1</label>
              <select value={form.team1Id} onChange={e => setForm({ ...form, team1Id: e.target.value })} disabled={!!editingId} required>
                <option value="">Select Team 1</option>
                {filteredTeams.map(t => <option key={t.id} value={t.id}>{t.teamName}</option>)}
              </select>
            </div>
            <div className="admin-form__group">
              <label>Team 2</label>
              <select value={form.team2Id} onChange={e => setForm({ ...form, team2Id: e.target.value })} disabled={!!editingId} required>
                <option value="">Select Team 2</option>
                {filteredTeams.filter(t => t.id !== parseInt(form.team1Id)).map(t => <option key={t.id} value={t.id}>{t.teamName}</option>)}
              </select>
            </div>
            <div className="admin-form__group">
              <label>Match Date</label>
              <input type="datetime-local" value={form.matchDate} onChange={e => setForm({ ...form, matchDate: e.target.value })} required />
            </div>
            <div className="admin-form__group">
              <label>Venue</label>
              <input type="text" placeholder="Venue" value={form.venue} onChange={e => setForm({ ...form, venue: e.target.value })} required />
            </div>
            <div className="admin-form__group">
              <label>Status</label>
              <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                <option>UPCOMING</option>
                <option>LIVE</option>
                <option>COMPLETED</option>
              </select>
            </div>
            <div className="admin-form__group">
              <label>Ticket Price (₹)</label>
              <input type="number" placeholder="1500" value={form.ticketPrice} onChange={e => setForm({ ...form, ticketPrice: e.target.value })} required />
            </div>
            <div className="admin-form__group">
              <label>Total Seats</label>
              <input type="number" placeholder="500" value={form.totalSeats} onChange={e => setForm({ ...form, totalSeats: e.target.value })} required />
            </div>
            <div className="admin-form__group">
              <label>Available Seats</label>
              <input type="number" placeholder="500" value={form.availableSeats} onChange={e => setForm({ ...form, availableSeats: e.target.value })} required />
            </div>
          </div>
          <button type="submit" className="admin-submit-btn" disabled={loading}>
            {loading ? (editingId ? 'UPDATING...' : 'ADDING...') : (editingId ? 'UPDATE MATCH' : 'ADD MATCH')}
          </button>
        </form>
      )}

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Match</th>
              <th>Sport</th>
              <th>Date</th>
              <th>Venue</th>
              <th>Status</th>
              <th>Price</th>
              <th>Seats</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {matches.map(match => (
              <tr key={match.id}>
                <td>#{match.id}</td>
                <td><strong>{match.team1.teamName} vs {match.team2.teamName}</strong></td>
                <td>{match.sport.name}</td>
                <td>{new Date(match.matchDate).toLocaleDateString()}</td>
                <td>{match.venue}</td>
                <td>
                  <span className={`admin-badge ${match.status === 'LIVE' ? 'admin-badge--red' : match.status === 'UPCOMING' ? 'admin-badge--blue' : 'admin-badge--gray'}`}>
                    {match.status}
                  </span>
                </td>
                <td>₹{match.ticketPrice}</td>
                <td>{match.availableSeats}/{match.totalSeats}</td>
                <td style={{ display: 'flex', gap: '10px' }}>
                  <button className="admin-submit-btn" type="button" onClick={() => handleEdit(match)}>
                    EDIT
                  </button>
                  <button className="admin-delete-btn" onClick={() => handleDelete(match.id)}>
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