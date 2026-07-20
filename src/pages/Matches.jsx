import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { getAllMatches, getAllSports } from '../services/api'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faLocationDot, faCalendar, faTicket,
  faChair, faBolt, faFilter
} from '@fortawesome/free-solid-svg-icons'
import '../styles/Matches.css'

export default function Matches() {
  const [matches, setMatches] = useState([])
  const [sports, setSports] = useState([])
  const [selectedSport, setSelectedSport] = useState('ALL')

  useEffect(() => {
    getAllMatches().then(res => setMatches(res.data))
    getAllSports().then(res => setSports(res.data))
  }, [])

  const filtered = selectedSport === 'ALL'
    ? matches
    : matches.filter(m => m.sport.name === selectedSport)

  return (
    <div className="matches-page">

      {/* PAGE HEADER */}
      <div className="matches-header">
        <div className="matches-header__orb" />
        <div className="matches-header__inner">
          <p className="matches-header__eyebrow">
            <FontAwesomeIcon icon={faBolt} /> SPORTIFY
          </p>
          <h1 className="matches-header__title">MATCHES</h1>
          <p className="matches-header__sub">Book tickets for upcoming & live matches</p>
        </div>
      </div>

      <div className="matches-container">

        {/* FILTERS */}
        <div className="matches-filters">
          <div className="matches-filters__label">
            <FontAwesomeIcon icon={faFilter} /> FILTER BY SPORT
          </div>
          <div className="matches-filters__btns">
            <button
              onClick={() => setSelectedSport('ALL')}
              className={`filter-btn ${selectedSport === 'ALL' ? 'filter-btn--active' : ''}`}>
              ALL SPORTS
            </button>
            {sports.map(sport => (
              <button
                key={sport.id}
                onClick={() => setSelectedSport(sport.name)}
                className={`filter-btn ${selectedSport === sport.name ? 'filter-btn--active' : ''}`}>
                {sport.name.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* RESULTS COUNT */}
        <p className="matches-count">
          Showing <span>{filtered.length}</span> match{filtered.length !== 1 ? 'es' : ''}
        </p>

        {/* MATCHES GRID */}
        {filtered.length === 0 ? (
          <div className="matches-empty">
            <FontAwesomeIcon icon={faTicket} className="matches-empty__icon" />
            <p>No matches found</p>
          </div>
        ) : (
          <div className="matches-grid">
            {filtered.map((match, i) => (
              <motion.div
                key={match.id}
                className="match-card"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -6, transition: { duration: 0.2 } }}>

                <div className="match-card__topbar" />

                <div className="match-card__body">
                  {/* Badges */}
                  <div className="match-card__badges">
                    <span className="badge badge--sport">
                      {match.sport.name.toUpperCase()}
                    </span>
                    <span className={`badge ${match.status === 'LIVE' ? 'badge--live' : 'badge--upcoming'}`}>
                      {match.status === 'LIVE' && <span className="live-dot" />}
                      {match.status}
                    </span>
                  </div>

                  {/* Teams */}
                  <div className="match-card__teams">
                    <h3 className="match-card__team">{match.team1.teamName}</h3>
                    <div className="match-card__vs">VS</div>
                    <h3 className="match-card__team">{match.team2.teamName}</h3>
                  </div>

                  {/* Info */}
                  <div className="match-card__info">
                    <p>
                      <FontAwesomeIcon icon={faLocationDot} />
                      {match.venue}
                    </p>
                    <p>
                      <FontAwesomeIcon icon={faCalendar} />
                      {new Date(match.matchDate).toLocaleString()}
                    </p>
                    <p>
                      <FontAwesomeIcon icon={faChair} />
                      {match.availableSeats} seats left
                    </p>
                  </div>

                  {/* Footer */}
                  <div className="match-card__footer">
                    <span className="match-card__price">₹{match.ticketPrice}</span>
                    <Link to={`/tickets/${match.id}`} className="match-card__btn">
                      <FontAwesomeIcon icon={faTicket} /> BOOK NOW
                    </Link>
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