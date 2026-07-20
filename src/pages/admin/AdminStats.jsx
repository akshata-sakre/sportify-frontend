import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { getAllMatches, getAllProducts, getAllUsers, getOrdersByUser, getAllNews } from '../../services/api'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faUsers, faCalendarDays, faShirt,
  faBoxOpen, faNewspaper, faBolt
} from '@fortawesome/free-solid-svg-icons'

export default function AdminStats() {
  const [stats, setStats] = useState({
    users: 0, matches: 0, products: 0, news: 0
  })

  useEffect(() => {
    Promise.all([
      getAllUsers(),
      getAllMatches(),
      getAllProducts(),
      getAllNews()
    ]).then(([users, matches, products, news]) => {
      setStats({
        users: users.data.length,
        matches: matches.data.length,
        products: products.data.length,
        news: news.data.length
      })
    })
  }, [])

  const cards = [
    { label: 'Total Users', value: stats.users, icon: faUsers, color: '#ff0033' },
    { label: 'Total Matches', value: stats.matches, icon: faCalendarDays, color: '#ff4d6d' },
    { label: 'Total Products', value: stats.products, icon: faShirt, color: '#ffaa00' },
    { label: 'Total News', value: stats.news, icon: faNewspaper, color: '#00cc66' },
  ]

  return (
    <div className="admin-page">
      <div className="admin-page__header">
        <p className="admin-page__eyebrow"><FontAwesomeIcon icon={faBolt} /> OVERVIEW</p>
        <h1 className="admin-page__title">DASHBOARD</h1>
      </div>

      <div className="admin-stats-grid">
        {cards.map((card, i) => (
          <motion.div
            key={i}
            className="admin-stat-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}>
            <div className="admin-stat-card__icon" style={{ background: card.color }}>
              <FontAwesomeIcon icon={card.icon} />
            </div>
            <div>
              <h2 className="admin-stat-card__value">{card.value}</h2>
              <p className="admin-stat-card__label">{card.label}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}