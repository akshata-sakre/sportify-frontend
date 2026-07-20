import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { getAllNews, getAllSports } from '../services/api'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faNewspaper, faBolt, faFilter,
  faCalendar, faLink
} from '@fortawesome/free-solid-svg-icons'
import '../styles/News.css'

export default function News() {
  const [news, setNews] = useState([])
  const [sports, setSports] = useState([])
  const [selected, setSelected] = useState('ALL')

  useEffect(() => {
    getAllNews().then(res => setNews(res.data))
    getAllSports().then(res => setSports(res.data))
  }, [])

  const filtered = selected === 'ALL'
    ? news
    : news.filter(n => n.sport.name === selected)

  return (
    <div className="news-page">

      {/* HEADER */}
      <div className="news-header">
        <div className="news-header__orb" />
        <div className="news-header__inner">
          <p className="news-header__eyebrow">
            <FontAwesomeIcon icon={faBolt} /> SPORTIFY
          </p>
          <h1 className="news-header__title">SPORTS NEWS</h1>
          <p className="news-header__sub">Latest breaking news from the sports world</p>
        </div>
      </div>

      <div className="news-container">

        {/* FILTERS */}
        <div className="news-filters">
          <div className="news-filters__label">
            <FontAwesomeIcon icon={faFilter} /> FILTER BY SPORT
          </div>
          <div className="news-filters__btns">
            <button
              onClick={() => setSelected('ALL')}
              className={`news-filter-btn ${selected === 'ALL' ? 'news-filter-btn--active' : ''}`}>
              ALL NEWS
            </button>
            {sports.map(sport => (
              <button
                key={sport.id}
                onClick={() => setSelected(sport.name)}
                className={`news-filter-btn ${selected === sport.name ? 'news-filter-btn--active' : ''}`}>
                {sport.name.toUpperCase()}
              </button>
            ))}
          </div>
        </div>


        {/* COUNT */}
        <p className="news-count">
          Showing <span>{filtered.length}</span> article{filtered.length !== 1 ? 's' : ''}
        </p>

        {/* EMPTY */}
        {filtered.length === 0 ? (
          <div className="news-empty">
            <FontAwesomeIcon icon={faNewspaper} className="news-empty__icon" />
            <p>No news found</p>
          </div>
        ) : (
          <div className="news-grid">
            {filtered.map((item, i) => (
              <motion.div
                key={item.id}
                className="news-card news-card--clickable"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                whileHover={{ y: -6, transition: { duration: 0.2 } }}
                onClick={() => {
                  const url = item.sourceUrl
                    || `https://www.google.com/search?q=${encodeURIComponent(`${item.title} ${item.source || ''}`)}`
                  window.open(url, '_blank', 'noopener,noreferrer')
                }}>

                <div className="news-card__topbar" />

                {/* Image Area */}
                <div className="news-card__image">
                  <FontAwesomeIcon icon={faNewspaper} className="news-card__image-icon" />
                  <span className="news-card__sport-tag">
                    {item.sport.name.toUpperCase()}
                  </span>
                </div>

                <div className="news-card__body">
                  <span className="news-card__category">
                    {item.sport.name.toUpperCase()}
                  </span>
                  <h3 className="news-card__title">{item.title}</h3>
                  <p className="news-card__content">{item.content}</p>

                  <div className="news-card__footer">
                    <a
                      href={item.sourceUrl
                        || `https://www.google.com/search?q=${encodeURIComponent(`${item.title} ${item.source || ''}`)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="news-card__meta news-card__source-link"
                      onClick={(e) => e.stopPropagation()}>
                      <FontAwesomeIcon icon={faLink} />
                      {item.source?.toUpperCase()}
                    </a>
                    <span className="news-card__meta">
                      <FontAwesomeIcon icon={faCalendar} />
                      {new Date(item.publishedAt).toLocaleDateString()}
                    </span>
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