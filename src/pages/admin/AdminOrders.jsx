import { useState, useEffect } from 'react'
import { getAllOrders, updateOrderStatus, approveCancelOrder, rejectCancelOrder } from '../../services/api'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBoxOpen, faBolt, faCheck, faXmark, faSpinner } from '@fortawesome/free-solid-svg-icons'

export default function AdminOrders() {
  const [orders, setOrders] = useState([])
  const [busyId, setBusyId] = useState(null)

  useEffect(() => { fetchAll() }, [])
  const fetchAll = () => getAllOrders().then(res => setOrders(res.data))

  const handleStatus = async (id, status) => {
    await updateOrderStatus(id, status)
    fetchAll()
  }

  const handleApprove = async (id) => {
    if (!window.confirm("Approve this order's cancellation request? Stock will be restored.")) return
    setBusyId(id)
    try {
      await approveCancelOrder(id)
      fetchAll()
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to approve cancellation')
    } finally {
      setBusyId(null)
    }
  }

  const handleReject = async (id) => {
    if (!window.confirm('Reject this cancellation request? The order will stay active.')) return
    setBusyId(id)
    try {
      await rejectCancelOrder(id)
      fetchAll()
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to reject cancellation')
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="admin-page">
      <div className="admin-page__header">
        <div>
          <p className="admin-page__eyebrow"><FontAwesomeIcon icon={faBolt} /> MANAGE</p>
          <h1 className="admin-page__title">ORDERS</h1>
        </div>
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>User</th>
              <th>Amount</th>
              <th>Payment</th>
              <th>Address</th>
              <th>Date</th>
              <th>Status</th>
              <th>Update</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(order => (
              <tr key={order.id}>
                <td>#{order.id}</td>
                <td>{order.user?.name}</td>
                <td>₹{order.totalAmount}</td>
                <td>
                  <span className={`admin-badge ${order.paymentMethod === 'COD' ? 'admin-badge--gray' : 'admin-badge--blue'}`}>
                    {order.paymentMethod || 'COD'}
                  </span>
                </td>
                <td>{order.address?.slice(0, 30)}...</td>
                <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                <td>
                  <span className={`admin-badge ${
                    order.status === 'DELIVERED' ? 'admin-badge--green'
                    : order.status === 'PAID' || order.status === 'SHIPPED' ? 'admin-badge--blue'
                    : order.status === 'CANCELLED' ? 'admin-badge--red'
                    : 'admin-badge--yellow'
                  }`}>
                    {order.status?.replace('_', ' ')}
                  </span>
                </td>
                <td>
                  {order.status === 'CANCELLATION_REQUESTED' ? (
                    <div className="admin-action-group">
                      <button
                        className="admin-btn admin-btn--success"
                        onClick={() => handleApprove(order.id)}
                        disabled={busyId === order.id}>
                        {busyId === order.id
                          ? <FontAwesomeIcon icon={faSpinner} spin />
                          : <><FontAwesomeIcon icon={faCheck} /> Approve</>
                        }
                      </button>
                      <button
                        className="admin-btn admin-btn--neutral"
                        onClick={() => handleReject(order.id)}
                        disabled={busyId === order.id}>
                        <FontAwesomeIcon icon={faXmark} /> Reject
                      </button>
                    </div>
                  ) : (
                    <select
                      className="admin-status-select"
                      value={order.status}
                      onChange={e => handleStatus(order.id, e.target.value)}>
                      <option>PENDING</option>
                      <option>PAID</option>
                      <option>SHIPPED</option>
                      <option>DELIVERED</option>
                      <option>CANCELLED</option>
                    </select>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}