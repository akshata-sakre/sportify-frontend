import { useState, useEffect } from 'react'
import { getAllBookings, cancelBooking, approveCancelBooking, rejectCancelBooking } from '../../services/api'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faTicket, faSearch, faXmark, faUser,
  faCalendarDays, faLocationDot, faSpinner,
  faTriangleExclamation, faCheckCircle, faBan, faCheck, faHourglassHalf
} from '@fortawesome/free-solid-svg-icons'

export default function AdminTicketBookings() {
  const [bookings, setBookings] = useState([])
  const [filtered, setFiltered] = useState([])
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [cancellingId, setCancellingId] = useState(null)
  const [successMsg, setSuccessMsg] = useState('')

  const bookingStatusClass = (status) => {
    if (status === 'CONFIRMED') return 'admin-badge--green'
    if (status === 'CANCELLATION_REQUESTED') return 'admin-badge--yellow'
    return 'admin-badge--red'
  }

  useEffect(() => {
    fetchBookings()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [bookings, search, statusFilter])

  const fetchBookings = async () => {
    setLoading(true)
    try {
      const res = await getAllBookings()
      setBookings(res.data)
    } catch {
      setError('Failed to load bookings.')
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = () => {
    let result = [...bookings]

    if (statusFilter !== 'ALL') {
      result = result.filter(b => b.match?.status === statusFilter)
    }

    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(b =>
        b.user?.name?.toLowerCase().includes(q) ||
        b.user?.email?.toLowerCase().includes(q) ||
        b.match?.team1?.teamName?.toLowerCase().includes(q) ||
        b.match?.team2?.teamName?.toLowerCase().includes(q) ||
        b.match?.venue?.toLowerCase().includes(q)
      )
    }

    setFiltered(result)
  }

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this booking?')) return
    setCancellingId(id)
    try {
      await cancelBooking(id)
      setSuccessMsg('Booking cancelled successfully.')
      setTimeout(() => setSuccessMsg(''), 3000)
      fetchBookings()
    } catch {
      setError('Failed to cancel booking.')
      setTimeout(() => setError(''), 3000)
    } finally {
      setCancellingId(null)
    }
  }

  const handleApprove = async (id) => {
    if (!window.confirm("Approve this user's cancellation request? Their seats will be released.")) return
    setCancellingId(id)
    try {
      await approveCancelBooking(id)
      setSuccessMsg('Cancellation approved.')
      setTimeout(() => setSuccessMsg(''), 3000)
      fetchBookings()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to approve cancellation.')
      setTimeout(() => setError(''), 3000)
    } finally {
      setCancellingId(null)
    }
  }

  const handleReject = async (id) => {
    if (!window.confirm('Reject this cancellation request? The booking will stay confirmed.')) return
    setCancellingId(id)
    try {
      await rejectCancelBooking(id)
      setSuccessMsg('Cancellation request rejected.')
      setTimeout(() => setSuccessMsg(''), 3000)
      fetchBookings()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reject cancellation.')
      setTimeout(() => setError(''), 3000)
    } finally {
      setCancellingId(null)
    }
  }

  const totalTickets = filtered.reduce((s, b) => s + (b.quantity || 0), 0)
  const totalRevenue = filtered.reduce((s, b) => s + ((b.quantity || 0) * (b.match?.ticketPrice || 0)), 0)
  const pendingCount = bookings.filter(b => b.status === 'CANCELLATION_REQUESTED').length

  return (
    <div className="admin-section">

      {/* Header */}
      <div className="admin-section__header">
        <div>
          <h1 className="admin-section__title">
            <FontAwesomeIcon icon={faTicket} /> Ticket Bookings
          </h1>
          <p className="admin-section__sub">
            {filtered.length} booking{filtered.length !== 1 ? 's' : ''} · {totalTickets} tickets · ₹{totalRevenue.toLocaleString()} revenue
            {pendingCount > 0 && (
              <span className="admin-pending-flag">
                <FontAwesomeIcon icon={faHourglassHalf} /> {pendingCount} cancellation request{pendingCount !== 1 ? 's' : ''} awaiting approval
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Messages */}
      {successMsg && (
        <div className="admin-alert admin-alert--success">
          <FontAwesomeIcon icon={faCheckCircle} /> {successMsg}
        </div>
      )}
      {error && (
        <div className="admin-alert admin-alert--error">
          <FontAwesomeIcon icon={faTriangleExclamation} /> {error}
        </div>
      )}

      {/* Filters */}
      <div className="admin-filters">
        <div className="admin-search">
          <FontAwesomeIcon icon={faSearch} className="admin-search__icon" />
          <input
            type="text"
            placeholder="Search by user, team, venue..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="admin-search__input"
          />
          {search && (
            <button className="admin-search__clear" onClick={() => setSearch('')}>
              <FontAwesomeIcon icon={faXmark} />
            </button>
          )}
        </div>

        <div className="admin-filter-tabs">
          {['ALL', 'UPCOMING', 'LIVE', 'COMPLETED'].map(s => (
            <button
              key={s}
              className={`admin-filter-tab ${statusFilter === s ? 'admin-filter-tab--active' : ''}`}
              onClick={() => setStatusFilter(s)}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="admin-loading">
          <FontAwesomeIcon icon={faSpinner} spin />
          <p>Loading bookings...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="admin-empty">
          <FontAwesomeIcon icon={faTicket} />
          <p>No bookings found</p>
        </div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>#</th>
                <th><FontAwesomeIcon icon={faUser} /> User</th>
                <th><FontAwesomeIcon icon={faCalendarDays} /> Match</th>
                <th><FontAwesomeIcon icon={faLocationDot} /> Venue</th>
                <th>Date</th>
                <th>Qty</th>
                <th>Amount</th>
                <th>Match</th>
                <th>Booking</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((b, i) => (
                <tr key={b.id}>
                  <td className="admin-table__id">#{b.id}</td>

                  <td>
                    <div className="admin-table__user">
                      <div className="admin-table__avatar">
                        {b.user?.name?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="admin-table__name">{b.user?.name}</p>
                        <p className="admin-table__email">{b.user?.email}</p>
                      </div>
                    </div>
                  </td>

                  <td>
                    <p className="admin-table__match">
                      {b.match?.team1?.teamName} <span>vs</span> {b.match?.team2?.teamName}
                    </p>
                    <p className="admin-table__sport">{b.match?.sport?.name}</p>
                  </td>

                  <td className="admin-table__venue">{b.match?.venue || '—'}</td>

                  <td className="admin-table__date">
                    {b.match?.matchDate
                      ? new Date(b.match.matchDate).toLocaleDateString('en-IN', {
                          day: '2-digit', month: 'short', year: 'numeric'
                        })
                      : '—'}
                  </td>

                  <td className="admin-table__qty">{b.quantity}</td>

                  <td className="admin-table__amount">
                    ₹{((b.quantity || 0) * (b.match?.ticketPrice || 0)).toLocaleString()}
                  </td>

                  <td>
                    <span className={`admin-badge admin-badge--${b.match?.status?.toLowerCase()}`}>
                      {b.match?.status === 'LIVE' && <span className="live-dot" />}
                      {b.match?.status || 'N/A'}
                    </span>
                  </td>

                  <td>
                    <span className={`admin-badge ${bookingStatusClass(b.status)}`}>
                      {b.status === 'CANCELLATION_REQUESTED' && <FontAwesomeIcon icon={faHourglassHalf} />}
                      {b.status?.replace('_', ' ') || 'N/A'}
                    </span>
                  </td>

                  <td>
                    {b.status === 'CANCELLATION_REQUESTED' ? (
                      <div className="admin-action-group">
                        <button
                          className="admin-btn admin-btn--success"
                          onClick={() => handleApprove(b.id)}
                          disabled={cancellingId === b.id}
                        >
                          {cancellingId === b.id
                            ? <FontAwesomeIcon icon={faSpinner} spin />
                            : <><FontAwesomeIcon icon={faCheck} /> Approve</>
                          }
                        </button>
                        <button
                          className="admin-btn admin-btn--neutral"
                          onClick={() => handleReject(b.id)}
                          disabled={cancellingId === b.id}
                        >
                          <FontAwesomeIcon icon={faXmark} /> Reject
                        </button>
                      </div>
                    ) : b.status === 'CONFIRMED' ? (
                      <button
                        className="admin-btn admin-btn--danger"
                        onClick={() => handleCancel(b.id)}
                        disabled={cancellingId === b.id}
                      >
                        {cancellingId === b.id
                          ? <FontAwesomeIcon icon={faSpinner} spin />
                          : <><FontAwesomeIcon icon={faBan} /> Cancel</>
                        }
                      </button>
                    ) : (
                      <span className="admin-table__muted">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}