import { useState, useEffect } from "react"
import { getCartByUser, addToCart, removeFromCart, placeOrder } from "../services/api"
import { useAuth } from "../context/AuthContext"
import { useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
  faCartShopping, faShirt, faHatCowboy, faTrophy,
  faTrash, faLocationDot, faCheckCircle,
  faBolt, faTag, faTruck, faMoneyBillWave,
  faCreditCard, faUser, faMinus, faPlus
} from "@fortawesome/free-solid-svg-icons"
import { initiatePayment } from "../services/useRazorpay"
import "../styles/Cart.css"

const getCategoryIcon = (category) => {
  if (category === "Jersey") return faShirt
  if (category === "Cap") return faHatCowboy
  return faTrophy
}

/**
 * Groups raw cart items (which may have duplicate products) into
 * a single entry per product, summing quantities.
 *
 * Each raw item looks like:
 *   { id, quantity, product: { id, productName, price, category, ... } }
 *
 * Grouped item shape:
 *   { productId, product, quantity, cartItemIds[] }
 *   – cartItemIds holds every raw row id that maps to this product,
 *     so we can call the backend correctly for remove / update.
 */
const groupCartItems = (rawItems) => {
  const map = new Map()

  rawItems.forEach((item) => {
    const pid = item.product.id

    if (map.has(pid)) {
      const existing = map.get(pid)
      existing.quantity += item.quantity
      existing.cartItemIds.push(item.id)
    } else {
      map.set(pid, {
        productId: pid,
        product: item.product,
        quantity: item.quantity,
        cartItemIds: [item.id],
      })
    }
  })

  return Array.from(map.values())
}

export default function Cart() {
  // Grouped items shown to the user (raw cart rows may contain duplicates per product)
  const [cart, setCart] = useState([])

  const [address, setAddress] = useState("")
  const [paymentMethod, setPaymentMethod] = useState("COD")
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [success, setSuccess] = useState(false)
  const [confirmedOrder, setConfirmedOrder] = useState(null)
  const [error, setError] = useState("")
  // productId of the item whose quantity is currently being updated on the server
  const [updatingId, setUpdatingId] = useState(null)

  const { user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!user) { navigate("/login"); return }
    fetchCart()
  }, [])

  // ─── Helpers ──────────────────────────────────────────────────────────────

  const fetchCart = async () => {
    setFetching(true)
    try {
      const res = await getCartByUser(user.id)
      setCart(groupCartItems(res.data))
    } catch {
      setError("Couldn't load your cart. Please refresh.")
    } finally {
      setFetching(false)
    }
  }

  // ─── Quantity Controls ────────────────────────────────────────────────────
  // The backend has no "set quantity" endpoint: addToCart always inserts a new
  // row (duplicates get summed by groupCartItems), and removeFromCart deletes
  // every row for that product. So a quantity change is: wipe the product's
  // row(s), then re-add a single row with the new total quantity.

  const setQuantity = async (productId, newQuantity) => {
    if (newQuantity < 1 || updatingId) return
    setUpdatingId(productId)
    try {
      await removeFromCart(user.id, productId)
      await addToCart(user.id, productId, newQuantity)
      await fetchCart()
    } catch {
      setError("Couldn't update quantity. Please try again.")
    } finally {
      setUpdatingId(null)
    }
  }

  const increaseQuantity = (productId) => {
    const grouped = cart.find((i) => i.productId === productId)
    if (!grouped) return
    setQuantity(productId, grouped.quantity + 1)
  }

  const decreaseQuantity = (productId) => {
    const grouped = cart.find((i) => i.productId === productId)
    if (!grouped || grouped.quantity <= 1) return
    setQuantity(productId, grouped.quantity - 1)
  }

  // ─── Remove ───────────────────────────────────────────────────────────────

  const handleRemove = async (productId) => {
    try {
      // A single call deletes every row for this product/user pair.
      await removeFromCart(user.id, productId)
      await fetchCart()
    } catch {
      setError("Couldn't remove item. Please try again.")
    }
  }

  // ─── Place Order ──────────────────────────────────────────────────────────

  const finalizeOrder = async () => {
    try {
      const res = await placeOrder(user.id, address, paymentMethod)
      setConfirmedOrder(res.data)
      setSuccess(true)
      setCart([])
    } catch {
      setError("Order failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }
const handleOrder = async () => {
  if (!address.trim()) {
    setError("Please enter your delivery address")
    return
  }

  if (address.trim().length < 15) {
    setError("Address must be at least 15 characters long")
    return
  }

  if (address.trim().length > 250) {
    setError("Address cannot exceed 250 characters")
    return
  }

  if (cart.length === 0) {
    setError("Your cart is empty")
    return
  }

  setError("")
  setLoading(true)

  if (paymentMethod === "COD") {
    finalizeOrder()
    return
  }

  initiatePayment({
    amount: total,
    name: "Sportify",
    description: `Order for ${cart.length} item(s)`,
    onSuccess: () => finalizeOrder(),
    onFailure: (msg) => {
      setError(msg || "Payment failed. Please try again.")
      setLoading(false)
    }
  })
}

  // ─── Derived Values ───────────────────────────────────────────────────────

  const total = cart.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  )

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0)

  // ─── Success Screen ───────────────────────────────────────────────────────

  if (success) return (
    <div className="cart-success-page">
      <motion.div
        className="cart-success-card"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
      >
        <div className="cart-success__icon">
          <FontAwesomeIcon icon={faCheckCircle} />
        </div>
        <h2 className="cart-success__title">ORDER CONFIRMED!</h2>
        <p className="cart-success__sub">
          {paymentMethod === "COD"
            ? "Pay in cash when your order arrives"
            : "Your payment was successful"}
        </p>

        {confirmedOrder && (
          <div className="cart-success__details">
            <div className="cart-success__row">
              <span>Order ID</span>
              <span>#{confirmedOrder.id}</span>
            </div>
            <div className="cart-success__row">
              <span>Total Amount</span>
              <span>₹{confirmedOrder.totalAmount}</span>
            </div>
            <div className="cart-success__row">
              <span>Payment Method</span>
              <span>
                {confirmedOrder.paymentMethod === "COD"
                  ? "Cash on Delivery"
                  : "Paid Online"}
              </span>
            </div>
            <div className="cart-success__row">
              <span>Delivery Address</span>
              <span>{confirmedOrder.address}</span>
            </div>
          </div>
        )}

        <button
          className="cart-success__btn"
          onClick={() => navigate("/profile")}
        >
          <FontAwesomeIcon icon={faCartShopping} /> VIEW MY ORDERS
        </button>
      </motion.div>
    </div>
  )

  // ─── Main Render ──────────────────────────────────────────────────────────

  return (
    <div className="cart-page">

      {/* HEADER */}
      <div className="cart-header">
        <div className="cart-header__orb" />
        <div className="cart-header__inner">
          <p className="cart-header__eyebrow">
            <FontAwesomeIcon icon={faBolt} /> SPORTIFY
          </p>
          <h1 className="cart-header__title">MY CART</h1>
          <p className="cart-header__sub">
            {totalItems} item{totalItems !== 1 ? "s" : ""} in your cart
          </p>
        </div>
      </div>

      <div className="cart-container">

        {fetching ? (
          <div className="cart-loading">
            <p>Loading your cart…</p>
          </div>
        ) : cart.length === 0 ? (
          <div className="cart-empty">
            <FontAwesomeIcon icon={faCartShopping} className="cart-empty__icon" />
            <p className="cart-empty__text">Your cart is empty</p>
            <button
              className="cart-empty__btn"
              onClick={() => navigate("/merch")}
            >
              <FontAwesomeIcon icon={faShirt} /> SHOP MERCH
            </button>
          </div>
        ) : (
          <div className="cart-layout">

            {/* ── CART ITEMS ── */}
            <div className="cart-items">
              <p className="cart-items__label">
                <FontAwesomeIcon icon={faTag} /> CART ITEMS
              </p>

              <AnimatePresence>
                {cart.map((item, i) => (
                  <motion.div
                    key={item.productId}
                    className="cart-item"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ delay: i * 0.06 }}
                  >
                    {/* Left: icon + info */}
                    <div className="cart-item__left">
                      <div className="cart-item__icon">
                        <FontAwesomeIcon
                          icon={getCategoryIcon(item.product.category)}
                        />
                      </div>
                      <div className="cart-item__info">
                        <h3 className="cart-item__name">
                          {item.product.productName}
                        </h3>
                        <p className="cart-item__category">
                          {item.product.category.toUpperCase()}
                        </p>
                        <p className="cart-item__price">
                          ₹{item.product.price} × {item.quantity}
                        </p>
                      </div>
                    </div>

                    {/* Middle: quantity controls */}
                    <div className="quantity-controls">
                      <button
                        className="qty-btn"
                        onClick={() => decreaseQuantity(item.productId)}
                        disabled={updatingId === item.productId || item.quantity <= 1}
                        aria-label="Decrease quantity"
                      >
                        <FontAwesomeIcon icon={faMinus} />
                      </button>

                      <span className="qty-value">{item.quantity}</span>

                      <button
                        className="qty-btn"
                        onClick={() => increaseQuantity(item.productId)}
                        disabled={updatingId === item.productId}
                        aria-label="Increase quantity"
                      >
                        <FontAwesomeIcon icon={faPlus} />
                      </button>
                    </div>

                    {/* Right: line total + remove */}
                    <div className="cart-item__right">
                      <p className="cart-item__total">
                        ₹{item.product.price * item.quantity}
                      </p>
                      <button
                        className="cart-item__remove"
                        onClick={() => handleRemove(item.productId)}
                      >
                        <FontAwesomeIcon icon={faTrash} /> REMOVE
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* ── ORDER SUMMARY ── */}
            <div className="cart-summary">
              <div className="cart-summary__topbar" />
              <div className="cart-summary__body">
                <h2 className="cart-summary__title">ORDER SUMMARY</h2>

                {/* User info */}
                <div className="cart-summary__user">
                  <FontAwesomeIcon icon={faUser} />
                  <span>{user?.name} · {user?.email}</span>
                </div>

                <div className="cart-summary__rows">
                  <div className="cart-summary__row">
                    <span>
                      <FontAwesomeIcon icon={faTag} /> Items ({totalItems})
                    </span>
                    <span>₹{total}</span>
                  </div>
                  <div className="cart-summary__row">
                    <span>
                      <FontAwesomeIcon icon={faTruck} /> Delivery
                    </span>
                    <span className="cart-summary__free">FREE</span>
                  </div>
                  <div className="cart-summary__divider" />
                  <div className="cart-summary__row cart-summary__row--total">
                    <span>TOTAL</span>
                    <span className="cart-summary__total-price">₹{total}</span>
                  </div>
                </div>

                {/* Delivery address */}
                <div className="cart-summary__address">
                  <label className="cart-summary__label">
                    <FontAwesomeIcon icon={faLocationDot} /> DELIVERY ADDRESS
                  </label>
                <textarea
  value={address}
  onChange={(e) => setAddress(e.target.value)}
  placeholder="House No., Street, Area, City, State, Pincode"
  className="cart-summary__textarea"
  maxLength={250}
/>

<p className="cart-summary__hint">
  Enter complete address including house no., street, city, state and pincode.
</p>
                </div>

                {/* Payment method */}
                <div className="cart-summary__payment">
                  <label className="cart-summary__label">
                    <FontAwesomeIcon icon={faCreditCard} /> PAYMENT METHOD
                  </label>
                  <div className="payment-options">
                    <button
                      type="button"
                      className={`payment-option ${paymentMethod === "COD" ? "payment-option--active" : ""}`}
                      onClick={() => setPaymentMethod("COD")}
                    >
                      <FontAwesomeIcon icon={faMoneyBillWave} />
                      <span>Cash on Delivery</span>
                    </button>
                    <button
                      type="button"
                      className={`payment-option ${paymentMethod === "ONLINE" ? "payment-option--active" : ""}`}
                      onClick={() => setPaymentMethod("ONLINE")}
                    >
                      <FontAwesomeIcon icon={faCreditCard} />
                      <span>Pay Online</span>
                    </button>
                  </div>
                </div>

                {error && <div className="cart-error">{error}</div>}

                <button
                  onClick={handleOrder}
                  disabled={loading}
                  className="cart-summary__btn"
                >
                  {loading
                    ? "PROCESSING…"
                    : paymentMethod === "COD"
                      ? <><FontAwesomeIcon icon={faMoneyBillWave} /> PLACE ORDER (COD)</>
                      : <><FontAwesomeIcon icon={faBolt} /> PAY ₹{total}</>
                  }
                </button>

                {paymentMethod === "ONLINE" && (
                  <p className="cart-summary__secure">🔒 Secured by Razorpay</p>
                )}
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  )
}
