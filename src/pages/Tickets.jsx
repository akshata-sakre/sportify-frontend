import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { getAllMatches, bookTicket, getBookingsByUser } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faTicket, faLocationDot, faCalendar,
  faChair, faBolt, faCheckCircle,
  faTriangleExclamation, faMinus, faPlus,
  faUser, faMoneyBillWave, faCreditCard,
  faTruck, faTag, faShieldHalved
} from '@fortawesome/free-solid-svg-icons'
import { initiatePayment } from '../services/useRazorpay'
import { QRCodeSVG } from 'qrcode.react'
import '../styles/Tickets.css'

const MAX_TICKETS_PER_BOOKING = 5
const VENUE_UPI_ID = 'sakreakshata@okaxis'

export default function Tickets() {
  const { matchId } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [match, setMatch] = useState(null)
  const [quantity, setQuantity] = useState(1)
  const [paymentMethod, setPaymentMethod] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [confirmedBooking, setConfirmedBooking] = useState(null)
  const [error, setError] = useState('')
  const [alreadyBooked, setAlreadyBooked] = useState(0)

  useEffect(() => {
    getAllMatches().then(res => {
      const found = res.data.find(m => m.id === parseInt(matchId))
      setMatch(found)
    })
  }, [matchId])

  useEffect(() => {
    if (!user) return
    getBookingsByUser(user.id).then(res => {
      const bookedForThisMatch = res.data
        .filter(b => b.match.id === parseInt(matchId) && b.status !== 'CANCELLED')
        .reduce((sum, b) => sum + b.quantity, 0)
      setAlreadyBooked(bookedForThisMatch)
    })
  }, [user, matchId, success])

  // ─── Helpers ──────────────────────────────────────────────────────────────

  const remainingAllowed = Math.max(0, MAX_TICKETS_PER_BOOKING - alreadyBooked)
  const limitReached = remainingAllowed === 0

  const total = match ? match.ticketPrice * quantity : 0
  const convenienceFee = paymentMethod === 'ONLINE' ? Math.round(total * 0.02) : 0
  const grandTotal = total + convenienceFee

  const finalizeBooking = async () => {
    try {
      const res = await bookTicket(user.id, matchId, quantity, paymentMethod)
      setConfirmedBooking(res.data)
      setSuccess(true)
    } catch (err) {
      const msg = err.response?.data
      setError(typeof msg === 'string' ? msg : (msg?.message || 'Booking failed. Please try again.'))
    } finally {
      setLoading(false)
    }
  }

  const handleBook = async () => {
    if (!user) { navigate('/login'); return }
    if (limitReached) {
      setError(`You've already booked the maximum ${MAX_TICKETS_PER_BOOKING} tickets for this match.`)
      return
    }
    if (!paymentMethod) {
      setError('Please select a payment method.')
      return
    }
    if (match.availableSeats < quantity) {
      setError(`Only ${match.availableSeats} seat(s) available.`)
      return
    }
    if (quantity > remainingAllowed) {
      setError(`You can only book ${remainingAllowed} more ticket(s) for this match.`)
      return
    }
    setError('')
    setLoading(true)

    if (paymentMethod === 'COD') {
      finalizeBooking()
      return
    }

    initiatePayment({
      amount: grandTotal,
      name: 'Sportify',
      description: `${quantity} ticket(s) – ${match.team1.teamName} vs ${match.team2.teamName}`,
      onSuccess: () => finalizeBooking(),
      onFailure: (msg) => {
        setError(msg || 'Payment failed. Please try again.')
        setLoading(false)
      },
    })
  }

  // ─── Loading ──────────────────────────────────────────────────────────────

  if (!match) return (
    <div className="tickets-loading">
      <div className="tickets-loading__spinner" />
      <p>Loading match details...</p>
    </div>
  )

  // ─── Success Screen ───────────────────────────────────────────────────────

  if (success) return (
    <div className="tickets-success-page">
      <motion.div
        className="tickets-success-card"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
      >
        <div className="tickets-success__icon">
          <FontAwesomeIcon icon={faCheckCircle} />
        </div>
        <h2 className="tickets-success__title">BOOKING CONFIRMED!</h2>
        <p className="tickets-success__sub">
          {paymentMethod === 'COD'
            ? 'Pay at the venue when you arrive'
            : 'Your payment was successful'}
        </p>

        <div className="tickets-success__details">
          {confirmedBooking?.id && (
            <div className="tickets-success__row">
              <span>Booking ID</span>
              <span>#{confirmedBooking.id}</span>
            </div>
          )}
          <div className="tickets-success__row">
            <span>Match</span>
            <span>{match.team1.teamName} vs {match.team2.teamName}</span>
          </div>
          <div className="tickets-success__row">
            <span>Tickets</span>
            <span>{quantity}</span>
          </div>
          <div className="tickets-success__row">
            <span>{paymentMethod === 'COD' ? 'Amount Due' : 'Amount Paid'}</span>
            <span>₹{grandTotal}</span>
          </div>
          <div className="tickets-success__row">
            <span>Payment</span>
            <span>{paymentMethod === 'COD' ? 'Pay at Venue' : 'Paid Online'}</span>
          </div>
        </div>

        {paymentMethod === 'COD' && (
          <div className="tickets-success__qr">
            <p className="tickets-success__qr-label">
              <FontAwesomeIcon icon={faShieldHalved} /> SCAN TO PAY AT VENUE
            </p>
            <div className="tickets-success__qr-code">
              <QRCodeSVG
                value={`upi://pay?pa=${VENUE_UPI_ID}&pn=Sportify&am=${grandTotal}&cu=INR&tn=Booking%20%23${confirmedBooking?.id}`}
                size={180}
              />
            </div>
            <p className="tickets-success__qr-note">
              Show this QR code at the venue counter to complete your payment of ₹{grandTotal}
            </p>
          </div>
        )}

        <button
          className="tickets-success__btn"
          onClick={() => navigate('/profile')}
        >
          <FontAwesomeIcon icon={faTicket} /> VIEW MY BOOKINGS
        </button>
      </motion.div>
    </div>
  )

  // ─── Main Render ──────────────────────────────────────────────────────────

  return (
    <div className="tickets-page">
      <div className="tickets-page__orb tickets-page__orb--left" />
      <div className="tickets-page__orb tickets-page__orb--right" />

      <div className="tickets-container">

        {/* PAGE TITLE */}
        <div className="tickets-title-row">
          <p className="tickets-eyebrow">
            <FontAwesomeIcon icon={faBolt} /> SPORTIFY
          </p>
          <h1 className="tickets-title">BOOK TICKETS</h1>
        </div>

        <div className="tickets-layout">

          {/* ── MATCH DETAIL CARD ── */}
          <motion.div
            className="match-detail-card"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="match-detail-card__topbar" />
            <div className="match-detail-card__body">

              <div className="match-detail-card__badges">
                <span className="tkt-badge tkt-badge--sport">
                  {match.sport.name.toUpperCase()}
                </span>
                <span className={`tkt-badge ${match.status === 'LIVE' ? 'tkt-badge--live' : 'tkt-badge--upcoming'}`}>
                  {match.status === 'LIVE' && <span className="live-dot" />}
                  {match.status}
                </span>
              </div>

              <div className="match-detail-card__teams">
                <h2 className="match-detail-card__team">{match.team1.teamName}</h2>
                <div className="match-detail-card__vs">VS</div>
                <h2 className="match-detail-card__team">{match.team2.teamName}</h2>
              </div>

              <div className="match-detail-card__info">
                <div className="match-detail-card__info-row">
                  <span className="info-label">
                    <FontAwesomeIcon icon={faLocationDot} /> VENUE
                  </span>
                  <span className="info-value">{match.venue}</span>
                </div>
                <div className="match-detail-card__info-row">
                  <span className="info-label">
                    <FontAwesomeIcon icon={faCalendar} /> DATE
                  </span>
                  <span className="info-value">
                    {new Date(match.matchDate).toLocaleString()}
                  </span>
                </div>
                <div className="match-detail-card__info-row">
                  <span className="info-label">
                    <FontAwesomeIcon icon={faChair} /> SEATS LEFT
                  </span>
                  <span className="info-value info-value--green">
                    {match.availableSeats}
                  </span>
                </div>
                <div className="match-detail-card__info-row">
                  <span className="info-label">
                    <FontAwesomeIcon icon={faTicket} /> PRICE / TICKET
                  </span>
                  <span className="info-value info-value--red">
                    ₹{match.ticketPrice}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* ── BOOKING CARD ── */}
          <motion.div
            className="booking-card"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="booking-card__topbar" />
            <div className="booking-card__body">
              <h2 className="booking-card__title">SELECT TICKETS</h2>

              {/* User info */}
              {user && (
                <div className="booking-card__user">
                  <FontAwesomeIcon icon={faUser} />
                  <span>{user.name} · {user.email}</span>
                </div>
              )}

              {error && (
                <div className="booking-error">
                  <FontAwesomeIcon icon={faTriangleExclamation} /> {error}
                </div>
              )}

              {user && limitReached ? (
                <div className="booking-error">
                  <FontAwesomeIcon icon={faTriangleExclamation} /> You've already booked the maximum {MAX_TICKETS_PER_BOOKING} tickets for this match.
                </div>
              ) : (
                <>
              {/* Quantity Selector */}
              <div className="quantity-row">
                <span className="quantity-label">
                  <FontAwesomeIcon icon={faTicket} /> NUMBER OF TICKETS
                </span>
                <div className="quantity-selector">
                  <button
                    className="quantity-btn"
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    aria-label="Decrease tickets"
                  >
                    <FontAwesomeIcon icon={faMinus} />
                  </button>
                  <span className="quantity-value">{quantity}</span>
                  <button
                    className="quantity-btn"
                    onClick={() => setQuantity(q => Math.min(match.availableSeats, remainingAllowed, q + 1))}
                    aria-label="Increase tickets"
                  >
                    <FontAwesomeIcon icon={faPlus} />
                  </button>
                </div>
              </div>
              <p className="quantity-limit-note">
                {alreadyBooked > 0
                  ? `You've booked ${alreadyBooked}/${MAX_TICKETS_PER_BOOKING} tickets for this match — ${remainingAllowed} left`
                  : `Max ${MAX_TICKETS_PER_BOOKING} tickets per user for this match`}
              </p>
                </>
              )}

              {!(user && limitReached) && (
              <>
              {/* Price Breakdown */}
              <div className="price-breakdown">
                <div className="price-breakdown__row">
                  <span>
                    <FontAwesomeIcon icon={faTag} /> Price per ticket
                  </span>
                  <span>₹{match.ticketPrice}</span>
                </div>
                <div className="price-breakdown__row">
                  <span>
                    <FontAwesomeIcon icon={faTicket} /> Quantity
                  </span>
                  <span>× {quantity}</span>
                </div>
                <div className="price-breakdown__row">
                  <span>
                    <FontAwesomeIcon icon={faTruck} /> Subtotal
                  </span>
                  <span>₹{total}</span>
                </div>
                {paymentMethod === 'ONLINE' && (
                  <div className="price-breakdown__row price-breakdown__row--fee">
                    <span>
                      <FontAwesomeIcon icon={faCreditCard} /> Convenience fee (2%)
                    </span>
                    <span>₹{convenienceFee}</span>
                  </div>
                )}
                <div className="price-breakdown__divider" />
                <div className="price-breakdown__row price-breakdown__row--total">
                  <span>TOTAL</span>
                  <span className="price-breakdown__total">₹{grandTotal}</span>
                </div>
              </div>

              {/* Payment Method */}
              <div className="booking-payment">
                <label className="booking-payment__label">
                  <FontAwesomeIcon icon={faCreditCard} /> PAYMENT METHOD
                </label>
                <div className="payment-options">
                  <button
                    type="button"
                    className={`payment-option ${paymentMethod === 'COD' ? 'payment-option--active' : ''}`}
                    onClick={() => setPaymentMethod('COD')}
                  >
                    <FontAwesomeIcon icon={faMoneyBillWave} />
                    <span>Pay at Venue</span>
                  </button>
                  <button
                    type="button"
                    className={`payment-option ${paymentMethod === 'ONLINE' ? 'payment-option--active' : ''}`}
                    onClick={() => setPaymentMethod('ONLINE')}
                  >
                    <FontAwesomeIcon icon={faCreditCard} />
                    <span>Pay Online</span>
                  </button>
                </div>
              </div>
              </>
              )}

              {/* Book Button */}
              {user && limitReached ? (
                <button
                  className="booking-btn"
                  onClick={() => navigate('/profile')}
                >
                  <FontAwesomeIcon icon={faTicket} /> VIEW MY BOOKINGS
                </button>
              ) : user ? (
                <button
                  onClick={handleBook}
                  disabled={loading || match.availableSeats === 0 || !paymentMethod}
                  className="booking-btn"
                >
                  {loading
                    ? 'PROCESSING...'
                    : match.availableSeats === 0
                      ? 'SOLD OUT'
                      : !paymentMethod
                        ? 'SELECT PAYMENT METHOD'
                        : paymentMethod === 'COD'
                          ? <><FontAwesomeIcon icon={faTicket} /> BOOK {quantity} TICKET{quantity > 1 ? 'S' : ''}</>
                          : <><FontAwesomeIcon icon={faBolt} /> PAY ₹{grandTotal}</>
                  }
                </button>
              ) : (
                <button
                  className="booking-btn booking-btn--login"
                  onClick={() => navigate('/login')}
                >
                  <FontAwesomeIcon icon={faUser} /> LOGIN TO BOOK
                </button>
              )}

              {paymentMethod === 'ONLINE' && user && (
                <p className="booking-secure">
                  <FontAwesomeIcon icon={faShieldHalved} /> Secured by Razorpay
                </p>
              )}

            </div>
          </motion.div>

        </div>
      </div>
    </div>
  )
}