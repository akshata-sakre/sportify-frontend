import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { getAllEvents, getAllSports } from '../services/api'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faCalendarCheck, faBolt, faFilter,
  faLocationDot, faCalendar, faTrophy, faLink
} from '@fortawesome/free-solid-svg-icons'
import '../styles/Events.css'

export default function Events() {
  const [events, setEvents] = useState([])
  const [sports, setSports] = useState([])
  const [selected, setSelected] = useState('ALL')
  const [brokenImages, setBrokenImages] = useState(new Set())

  useEffect(() => {
    getAllEvents().then(res => setEvents(res.data))
    getAllSports().then(res => setSports(res.data))
  }, [])

  const filtered = selected === 'ALL'
    ? events
    : events.filter(e => e.sport.name === selected)

  return (
    <div className="events-page">

      {/* HEADER */}
      <div className="events-header">
        <div className="events-header__orb" />
        <div className="events-header__inner">
          <p className="events-header__eyebrow">
            <FontAwesomeIcon icon={faBolt} /> SPORTIFY
          </p>
          <h1 className="events-header__title">SPORTS EVENTS</h1>
          <p className="events-header__sub">Upcoming sports events near you</p>
        </div>
      </div>

      <div className="events-container">

        {/* FILTERS */}
        <div className="events-filters">
          <div className="events-filters__label">
            <FontAwesomeIcon icon={faFilter} /> FILTER BY SPORT
          </div>
          <div className="events-filters__btns">
            <button
              onClick={() => setSelected('ALL')}
              className={`events-filter-btn ${selected === 'ALL' ? 'events-filter-btn--active' : ''}`}>
              ALL EVENTS
            </button>
            {sports.map(sport => (
              <button
                key={sport.id}
                onClick={() => setSelected(sport.name)}
                className={`events-filter-btn ${selected === sport.name ? 'events-filter-btn--active' : ''}`}>
                {sport.name.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* COUNT */}
        <p className="events-count">
          Showing <span>{filtered.length}</span> event{filtered.length !== 1 ? 's' : ''}
        </p>

        {/* EMPTY */}
        {filtered.length === 0 ? (
          <div className="events-empty">
            <FontAwesomeIcon icon={faCalendarCheck} className="events-empty__icon" />
            <p>No events found</p>
          </div>
        ) : (
          <div className="events-grid">
            {filtered.map((event, i) => (
              <motion.div
                key={event.id}
                className="event-card event-card--clickable"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                whileHover={{ y: -6, transition: { duration: 0.2 } }}
                onClick={() => {
                  const url = event.eventUrl
                    || `https://www.google.com/search?q=${encodeURIComponent(`${event.title} ${event.location || ''}`)}`
                  window.open(url, '_blank', 'noopener,noreferrer')
                }}>

                <div className="event-card__topbar" />

                {/* Image Area */}
                <div className="event-card__image">
                  {event.imageUrl && !brokenImages.has(event.id) ? (
                    <img
                      src={event.imageUrl}
                      alt={event.title}
                      className="event-card__image-img"
                      onError={() => setBrokenImages(prev => new Set(prev).add(event.id))} />
                  ) : (
                    <FontAwesomeIcon icon={faTrophy} className="event-card__image-icon" />
                  )}
                  <span className="event-card__sport-tag">
                    {event.sport.name.toUpperCase()}
                  </span>
                </div>

                <div className="event-card__body">
                  <span className="event-card__category">
                    {event.sport.name.toUpperCase()}
                  </span>

                  <h3 className="event-card__title">{event.title}</h3>
                  <p className="event-card__desc">{event.description}</p>

                  <div className="event-card__info">
                    <div className="event-card__info-row">
                      <FontAwesomeIcon icon={faLocationDot} />
                      <span>{event.location}</span>
                    </div>
                    <div className="event-card__info-row">
                      <FontAwesomeIcon icon={faCalendar} />
                      <span>{new Date(event.eventDate).toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="event-card__footer">
                    <div className="event-card__date-badge">
                      {new Date(event.eventDate).toLocaleDateString('en-IN', {
                        day: 'numeric', month: 'short', year: 'numeric'
                      })}
                    </div>
                    <a
                      href={event.eventUrl
                        || `https://www.google.com/search?q=${encodeURIComponent(`${event.title} ${event.location || ''}`)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="event-card__link"
                      onClick={(e) => e.stopPropagation()}>
                      <FontAwesomeIcon icon={faLink} />
                      MORE INFO
                    </a>
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