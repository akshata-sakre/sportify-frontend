import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { getBookingsByUser, getOrdersByUser, getOrderItems, requestCancelBooking, requestCancelOrder } from "../services/api"
import { useAuth } from "../context/AuthContext"
import { useNavigate } from "react-router-dom"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
  faBolt, faUser, faEnvelope, faRightFromBracket,
  faTicket, faBoxOpen, faLocationDot, faCalendar,
  faChevronDown, faShirt, faHatCowboy, faTrophy,
  faMoneyBillWave, faCreditCard, faCircleCheck, faClock, faBan,
  faQrcode, faXmark, faShieldHalved, faHourglassHalf
} from "@fortawesome/free-solid-svg-icons"
import { QRCodeSVG } from "qrcode.react"
import "../styles/Profile.css"

const VENUE_UPI_ID = "sakreakshata@okaxis"

const getCategoryIcon = (category) => {
  if (category === "Jersey") return faShirt
  if (category === "Cap") return faHatCowboy
  return faTrophy
}

export default function Profile() {
  const [bookings, setBookings] = useState([])
  const [orders, setOrders] = useState([])
  const [orderItemsMap, setOrderItemsMap] = useState({})
  const [expandedOrder, setExpandedOrder] = useState(null)
  const [tab, setTab] = useState("bookings")
  const [cancellingId, setCancellingId] = useState(null)
  const [cancellingOrderId, setCancellingOrderId] = useState(null)
  const [qrBooking, setQrBooking] = useState(null)

  const { user, logout } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!user) { navigate("/login"); return }
    getBookingsByUser(user.id).then(res => setBookings(res.data))
    getOrdersByUser(user.id).then(res => setOrders(res.data))
  }, [])

  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  const toggleOrder = async (orderId) => {
    if (expandedOrder === orderId) {
      setExpandedOrder(null)
      return
    }
    setExpandedOrder(orderId)
    if (!orderItemsMap[orderId]) {
      const res = await getOrderItems(orderId)
      setOrderItemsMap(prev => ({ ...prev, [orderId]: res.data }))
    }
  }

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm("Request cancellation for this booking? An admin will need to approve it before it's cancelled.")) return
    setCancellingId(bookingId)
    try {
      await requestCancelBooking(bookingId)
      setBookings(prev => prev.map(b =>
        b.id === bookingId ? { ...b, status: "CANCELLATION_REQUESTED" } : b
      ))
    } catch (err) {
      alert(err.response?.data?.message || "Failed to request cancellation")
    } finally {
      setCancellingId(null)
    }
  }

  const handleCancelOrder = async (orderId, e) => {
    e.stopPropagation()
    if (!window.confirm("Request cancellation for this order? An admin will need to approve it before it's cancelled.")) return
    setCancellingOrderId(orderId)
    try {
      await requestCancelOrder(orderId)
      setOrders(prev => prev.map(o =>
        o.id === orderId ? { ...o, status: "CANCELLATION_REQUESTED" } : o
      ))
    } catch (err) {
      alert(err.response?.data?.message || "Failed to request cancellation")
    } finally {
      setCancellingOrderId(null)
    }
  }

  const statusClass = (status) => {
    if (status === "DELIVERED" || status === "CONFIRMED" || status === "PAID") return "status-badge--green"
    if (status === "PENDING" || status === "CANCELLATION_REQUESTED") return "status-badge--yellow"
    return "status-badge--red"
  }

  return (
    <div className="profile-page">

      {/* HEADER */}
      <div className="profile-header">
        <div className="profile-header__orb" />
        <div className="profile-header__inner">

          <div className="profile-user">
            <div className="profile-avatar">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="profile-user__info">
              <h1 className="profile-name">{user?.name}</h1>
              <p className="profile-email">
                <FontAwesomeIcon icon={faEnvelope} /> {user?.email}
              </p>
              <span className="profile-role">
                <FontAwesomeIcon icon={faUser} /> {user?.role}
              </span>
            </div>
          </div>

          <button onClick={handleLogout} className="profile-logout">
            <FontAwesomeIcon icon={faRightFromBracket} /> LOGOUT
          </button>
        </div>
      </div>

      <div className="profile-container">

        {/* TABS */}
        <div className="profile-tabs">
          <button
            className={`profile-tab ${tab === "bookings" ? "profile-tab--active" : ""}`}
            onClick={() => setTab("bookings")}>
            <FontAwesomeIcon icon={faTicket} /> BOOKINGS ({bookings.length})
          </button>
          <button
            className={`profile-tab ${tab === "orders" ? "profile-tab--active" : ""}`}
            onClick={() => setTab("orders")}>
            <FontAwesomeIcon icon={faBoxOpen} /> ORDERS ({orders.length})
          </button>
        </div>

        {/* BOOKINGS TAB */}
        {tab === "bookings" && (
          bookings.length === 0 ? (
            <div className="empty-state">
              <FontAwesomeIcon icon={faTicket} className="empty-state__icon" />
              <p>No bookings yet</p>
            </div>
          ) : (
            <div className="card-list">
              {bookings.map((booking, i) => (
                <motion.div
                  key={booking.id}
                  className="booking-card"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}>
                  <div className="booking-card__topbar" />
                  <div className="booking-card__body">
                    <div className="booking-card__main">
                      <h3 className="booking-card__teams">
                        {booking.match.team1.teamName} <span>vs</span> {booking.match.team2.teamName}
                      </h3>
                      <div className="booking-card__meta">
                        <span><FontAwesomeIcon icon={faLocationDot} /> {booking.match.venue}</span>
                        <span><FontAwesomeIcon icon={faCalendar} /> {new Date(booking.match.matchDate).toLocaleString()}</span>
                        <span><FontAwesomeIcon icon={faTicket} /> {booking.quantity} ticket{booking.quantity > 1 ? 's' : ''}</span>
                      </div>
                    </div>
                    <div className="booking-card__side">
                      <p className="booking-card__price">₹{booking.totalPrice}</p>
                      <span className={`status-badge ${statusClass(booking.status)}`}>
                        {booking.status}
                      </span>
                      {booking.status === "CONFIRMED" && booking.paymentMethod === "COD" && (
                        <button
                          className="booking-pay-btn"
                          onClick={() => setQrBooking(booking)}>
                          <FontAwesomeIcon icon={faQrcode} />
                          PAY AT VENUE
                        </button>
                      )}
                      {booking.status === "CONFIRMED" && (
                        <button
                          className="booking-cancel-btn"
                          disabled={cancellingId === booking.id}
                          onClick={() => handleCancelBooking(booking.id)}>
                          <FontAwesomeIcon icon={faBan} />
                          {cancellingId === booking.id ? "REQUESTING..." : "CANCEL"}
                        </button>
                      )}
                      {booking.status === "CANCELLATION_REQUESTED" && (
                        <span className="booking-cancel-pending">
                          <FontAwesomeIcon icon={faHourglassHalf} />
                          AWAITING ADMIN APPROVAL
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )
        )}

        {/* ORDERS TAB */}
        {tab === "orders" && (
          orders.length === 0 ? (
            <div className="empty-state">
              <FontAwesomeIcon icon={faBoxOpen} className="empty-state__icon" />
              <p>No orders yet</p>
            </div>
          ) : (
            <div className="card-list">
              {orders.map((order, i) => (
                <motion.div
                  key={order.id}
                  className="order-card"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}>
                  <div className="order-card__topbar" />
                  <div
                    className="order-card__header"
                    onClick={() => toggleOrder(order.id)}>
                    <div className="order-card__header-left">
                      <h3 className="order-card__id">ORDER #{order.id}</h3>
                      <div className="order-card__meta">
                        <span><FontAwesomeIcon icon={faCalendar} /> {new Date(order.createdAt).toLocaleString()}</span>
                        <span>
                          <FontAwesomeIcon icon={order.paymentMethod === 'COD' ? faMoneyBillWave : faCreditCard} />
                          {order.paymentMethod === 'COD' ? 'Cash on Delivery' : 'Paid Online'}
                        </span>
                      </div>
                    </div>
                    <div className="order-card__header-right">
                      <p className="order-card__price">₹{order.totalAmount}</p>
                      <span className={`status-badge ${statusClass(order.status)}`}>
                        {order.status?.replace('_', ' ')}
                      </span>
                      {(order.status === "PENDING" || order.status === "PAID") && (
                        <button
                          className="booking-cancel-btn"
                          disabled={cancellingOrderId === order.id}
                          onClick={(e) => handleCancelOrder(order.id, e)}>
                          <FontAwesomeIcon icon={faBan} />
                          {cancellingOrderId === order.id ? "REQUESTING..." : "CANCEL"}
                        </button>
                      )}
                      <FontAwesomeIcon
                        icon={faChevronDown}
                        className={`order-card__chevron ${expandedOrder === order.id ? 'order-card__chevron--open' : ''}`} />
                    </div>
                  </div>

                  <AnimatePresence>
                    {expandedOrder === order.id && (
                      <motion.div
                        className="order-card__details"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}>

                        <div className="order-card__address">
                          <p className="order-card__detail-label">
                            <FontAwesomeIcon icon={faLocationDot} /> DELIVERY ADDRESS
                          </p>
                          <p className="order-card__address-text">{order.address}</p>
                        </div>

                        <div className="order-card__items-label">
                          <FontAwesomeIcon icon={faBoxOpen} /> ITEMS IN THIS ORDER
                        </div>

                        {!orderItemsMap[order.id] ? (
                          <p className="order-card__loading">Loading items...</p>
                        ) : (
                          <div className="order-card__items">
                            {orderItemsMap[order.id].map(item => (
                              <div key={item.id} className="order-item-row">
                                <div className="order-item-row__icon">
                                  <FontAwesomeIcon icon={getCategoryIcon(item.product.category)} />
                                </div>
                                <div className="order-item-row__info">
                                  <p className="order-item-row__name">{item.product.productName}</p>
                                  <p className="order-item-row__qty">Qty: {item.quantity} × ₹{item.price}</p>
                                </div>
                                <p className="order-item-row__total">₹{item.quantity * item.price}</p>
                              </div>
                            ))}
                          </div>
                        )}

                        <div className="order-card__timeline">
                          <div className={`timeline-step ${order.status !== 'CANCELLED' ? 'timeline-step--done' : ''}`}>
                            <FontAwesomeIcon icon={faCircleCheck} /> Order Placed
                          </div>
                          <div className={`timeline-step ${order.status === 'DELIVERED' ? 'timeline-step--done' : 'timeline-step--pending'}`}>
                            <FontAwesomeIcon icon={order.status === 'DELIVERED' ? faCircleCheck : faClock} /> Delivered
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
          )
        )}

      </div>

      {/* PAY AT VENUE QR MODAL */}
      <AnimatePresence>
        {qrBooking && (
          <motion.div
            className="qr-modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setQrBooking(null)}>
            <motion.div
              className="qr-modal"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}>

              <button className="qr-modal__close" onClick={() => setQrBooking(null)}>
                <FontAwesomeIcon icon={faXmark} />
              </button>

              <p className="qr-modal__label">
                <FontAwesomeIcon icon={faShieldHalved} /> SCAN TO PAY AT VENUE
              </p>

              <div className="qr-modal__code">
                <QRCodeSVG
                  value={`upi://pay?pa=${VENUE_UPI_ID}&pn=Sportify&am=${qrBooking.totalPrice}&cu=INR&tn=Booking%20%23${qrBooking.id}`}
                  size={200}
                />
              </div>

              <p className="qr-modal__match">
                {qrBooking.match.team1.teamName} vs {qrBooking.match.team2.teamName}
              </p>
              <p className="qr-modal__amount">₹{qrBooking.totalPrice} due</p>
              <p className="qr-modal__note">
                Show this QR code at the venue counter to complete your payment
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}