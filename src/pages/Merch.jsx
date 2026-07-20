import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { getAllProducts, addToCart } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faShirt, faCartShopping, faBolt,
  faFilter, faBoxOpen, faCheckCircle,
  faTriangleExclamation, faHatCowboy, faTrophy
} from '@fortawesome/free-solid-svg-icons'
import '../styles/Merch.css'

const getCategoryIcon = (category) => {
  if (category === 'Jersey') return faShirt
  if (category === 'Cap') return faHatCowboy
  return faTrophy
}

export default function Merch() {
  const [products, setProducts] = useState([])
  const [category, setCategory] = useState('ALL')
  const [message, setMessage] = useState({ text: '', type: '' })
  const { user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    getAllProducts().then(res => setProducts(res.data))
  }, [])

  const handleAddToCart = async (productId) => {
    if (!user) { navigate('/login'); return }
    try {
      await addToCart(user.id, productId, 1)
      setMessage({ text: 'Added to cart successfully!', type: 'success' })
    } catch (err) {
      setMessage({ text: 'Failed to add to cart.', type: 'error' })
    }
    setTimeout(() => setMessage({ text: '', type: '' }), 2500)
  }

  const categories = ['ALL', ...new Set(products.map(p => p.category))]
  const filtered = category === 'ALL' ? products : products.filter(p => p.category === category)

  return (
    <div className="merch-page">

      {/* HEADER */}
      <div className="merch-header">
        <div className="merch-header__orb" />
        <div className="merch-header__inner">
          <p className="merch-header__eyebrow">
            <FontAwesomeIcon icon={faBolt} /> SPORTIFY
          </p>
          <h1 className="merch-header__title">MERCH STORE</h1>
          <p className="merch-header__sub">Official sports merchandise — jerseys, caps & more</p>
        </div>
      </div>

      <div className="merch-container">

        {/* TOAST MESSAGE */}
        <AnimatePresence>
          {message.text && (
            <motion.div
              className={`merch-toast ${message.type === 'success' ? 'merch-toast--success' : 'merch-toast--error'}`}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}>
              <FontAwesomeIcon icon={message.type === 'success' ? faCheckCircle : faTriangleExclamation} />
              {message.text}
            </motion.div>
          )}
        </AnimatePresence>

        {/* FILTERS */}
        <div className="merch-filters">
          <div className="merch-filters__label">
            <FontAwesomeIcon icon={faFilter} /> FILTER BY CATEGORY
          </div>
          <div className="merch-filters__btns">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`merch-filter-btn ${category === cat ? 'merch-filter-btn--active' : ''}`}>
                {cat === 'ALL' ? 'ALL PRODUCTS' : cat.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* COUNT */}
        <p className="merch-count">
          Showing <span>{filtered.length}</span> product{filtered.length !== 1 ? 's' : ''}
        </p>

        {/* PRODUCTS GRID */}
        {filtered.length === 0 ? (
          <div className="merch-empty">
            <FontAwesomeIcon icon={faBoxOpen} className="merch-empty__icon" />
            <p>No products found</p>
          </div>
        ) : (
          <div className="merch-grid">
            {filtered.map((product, i) => (
              <motion.div
                key={product.id}
                className="product-card"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                whileHover={{ y: -6, transition: { duration: 0.2 } }}>

                <div className="product-card__topbar" />

                {/* Image Area */}
<div className="product-card__image">
  <img
    src={product.imageUrl}
    alt={product.productName}
    className="product-card__img"
  />

  <div className="product-card__icon-overlay">
    <FontAwesomeIcon
      icon={getCategoryIcon(product.category)}
    />
  </div>

  <span className="product-card__sport-tag">
    {product.sport?.name?.toUpperCase()}
  </span>
</div>

                <div className="product-card__body">
                  <span className="product-card__category">
                    {product.category.toUpperCase()}
                  </span>
                  <h3 className="product-card__name">{product.productName}</h3>
                  <p className="product-card__desc">{product.description}</p>

                  <div className="product-card__footer">
                    <div>
                      <p className="product-card__price">₹{product.price}</p>
                      <p className="product-card__stock">{product.stock} in stock</p>
                    </div>
                    <button
                      onClick={() => handleAddToCart(product.id)}
                      className="product-card__btn">
                      <FontAwesomeIcon icon={faCartShopping} />
                      ADD TO CART
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}