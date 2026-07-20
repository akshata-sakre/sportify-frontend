import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { getAllMatches, getAllNews, getAllEvents, getAllSports } from '../services/api'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faBolt, faBroadcastTower, faFutbol,
  faTrophy, faShirt, faArrowRight,
  faLocationDot, faCalendar, faTicket
} from '@fortawesome/free-solid-svg-icons'
import '../styles/Home.css'

export default function Home() {
  const [matches, setMatches] = useState([])
  const [news, setNews] = useState([])
  const [events, setEvents] = useState([])
  const [sports, setSports] = useState([])

  useEffect(() => {
    getAllMatches().then(res => setMatches(res.data.slice(0, 3)))
    getAllNews().then(res => setNews(res.data.slice(0, 3)))
    getAllEvents().then(res => setEvents(res.data.slice(0, 3)))
    getAllSports().then(res => setSports(res.data))
  }, [])

  return (
    <div className="home">

      {/* HERO */}
      <section className="hero">
        <div className="hero__grid" />
        <div className="hero__orb hero__orb--left" />
        <div className="hero__orb hero__orb--right" />

        <div className="hero__content">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}>

            <div className="hero__badge">
              <FontAwesomeIcon icon={faBolt} />
              LIVE SPORTS PLATFORM
            </div>

            <h1 className="hero__title">SPORTIFY</h1>

            <p className="hero__subtitle">YOUR ULTIMATE SPORTS HUB</p>

            <div className="hero__tags">
              {['LIVE SCORES', 'MATCH TICKETS', 'MERCH STORE', 'HIGHLIGHTS', 'EVENTS'].map((tag, i) => (
                <span key={i} className="hero__tag">{tag}</span>
              ))}
            </div>

            <div className="hero__btns">
              <Link to="/matches" className="btn btn--primary">
                <FontAwesomeIcon icon={faBolt} /> VIEW MATCHES
              </Link>
              <Link to="/merch" className="btn btn--outline">
                SHOP MERCH <FontAwesomeIcon icon={faArrowRight} />
              </Link>
            </div>

          </motion.div>
        </div>
      </section>

      {/* SPORTS TABS */}
      <div className="sports-tabs">
        <div className="sports-tabs__inner">
          {sports.map((sport, i) => (
            <Link to="/matches" key={sport.id} className={`sport-tab ${i === 0 ? 'sport-tab--active' : ''}`}>
              {sport.name.toUpperCase()}
            </Link>
          ))}
        </div>
      </div>

      {/* STATS */}
      <section className="stats">
        <div className="container">
          <div className="stats__grid">
            {[
              { label: 'LIVE MATCHES', value: '12+', icon: faBroadcastTower },
              { label: 'SPORTS', value: '03+', icon: faFutbol },
              { label: 'TEAMS', value: '10+', icon: faTrophy },
              { label: 'PRODUCTS', value: '50+', icon: faShirt }
            ].map((stat, i) => (
              <motion.div key={i} className="stat-card"
                whileHover={{ y: -8, transition: { duration: 0.25 } }}>
                <div className="stat-card__accent" />
                <div className="stat-card__inner">
                  <div className="stat-card__icon">
                    <FontAwesomeIcon icon={stat.icon} />
                  </div>
                  <div>
                    <h2 className="stat-card__value">{stat.value}</h2>
                    <p className="stat-card__label">{stat.label}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* MATCHES */}
      <section className="section">
        <div className="container">
          <div className="section__header">
            <div>
              <p className="section__eyebrow">LIVE & UPCOMING</p>
              <h2 className="section__title">Featured Matches</h2>
            </div>
            <Link to="/matches" className="btn btn--outline btn--sm">
              VIEW ALL <FontAwesomeIcon icon={faArrowRight} />
            </Link>
          </div>

          <div className="cards-grid">
            {matches.map((match, i) => (
              <motion.div key={match.id} className="match-card"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.15 }}
                whileHover={{ y: -8, transition: { duration: 0.2 } }}>
                <div className="card__top-bar" />
                <div className="card__body">
                  <div className="card__badges">
                    <span className="badge badge--sport">{match.sport.name.toUpperCase()}</span>
                    <span className={`badge ${match.status === 'LIVE' ? 'badge--live' : 'badge--upcoming'}`}>
                      {match.status === 'LIVE' && <span className="live-dot" />}
                      {match.status}
                    </span>
                  </div>
                  <div className="match-card__teams">
                    <h3 className="team-name">{match.team1.teamName}</h3>
                    <div className="vs-badge">VS</div>
                    <h3 className="team-name">{match.team2.teamName}</h3>
                  </div>
                  <div className="match-card__info">
                    <p><FontAwesomeIcon icon={faLocationDot} /> {match.venue}</p>
                    <p><FontAwesomeIcon icon={faCalendar} /> {new Date(match.matchDate).toLocaleDateString()}</p>
                  </div>
                  <div className="match-card__footer">
                    <span className="match-card__price">₹{match.ticketPrice}</span>
                    <Link to={`/tickets/${match.id}`} className="btn btn--primary btn--sm">
                      <FontAwesomeIcon icon={faTicket} /> BOOK NOW
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* NEWS */}
      <section className="section section--dark">
        <div className="container">
          <div className="section__header">
            <div>
              <p className="section__eyebrow">BREAKING NEWS</p>
              <h2 className="section__title">Latest Updates</h2>
            </div>
            <Link to="/news" className="btn btn--outline btn--sm">
              VIEW ALL <FontAwesomeIcon icon={faArrowRight} />
            </Link>
          </div>

          <div className="cards-grid">
            {news.map((item, i) => (
              <motion.div key={item.id} className="news-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -8, transition: { duration: 0.2 } }}>
                <div className="card__top-bar" />
                <div className="card__body">
                  <span className="badge badge--sport">{item.sport.name.toUpperCase()}</span>
                  <h3 className="news-card__title">{item.title}</h3>
                  <p className="news-card__content">{item.content?.slice(0, 120)}...</p>
                  <div className="news-card__footer">
                    <span className="news-card__source">SOURCE: {item.source?.toUpperCase()}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* EVENTS */}
      <section className="section">
        <div className="container">
          <div className="section__header">
            <div>
              <p className="section__eyebrow">COMING SOON</p>
              <h2 className="section__title">Upcoming Events</h2>
            </div>
            <Link to="/events" className="btn btn--outline btn--sm">
              VIEW ALL <FontAwesomeIcon icon={faArrowRight} />
            </Link>
          </div>

          <div className="cards-grid">
            {events.map((event, i) => (
              <motion.div key={event.id} className="event-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -8, transition: { duration: 0.2 } }}>
                <div className="card__top-bar" />
                <div className="card__body">
                  <span className="badge badge--sport">{event.sport.name.toUpperCase()}</span>
                  <h3 className="event-card__title">{event.title}</h3>
                  <p className="event-card__location">
                    <FontAwesomeIcon icon={faLocationDot} /> {event.location}
                  </p>
                  <div className="event-card__date">
                    {new Date(event.eventDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="footer">
        <div className="footer__orb footer__orb--left" />
        <div className="footer__orb footer__orb--right" />
        <div className="container footer__inner">
          <div className="footer__brand">
            <h2 className="footer__logo">SPORTIFY</h2>
            <p className="footer__desc">Enter the future of sports. Watch live matches, book tickets, stay updated with breaking news, and explore premium merchandise.</p>
          </div>
          <div className="footer__col">
            <h3 className="footer__col-title">EXPLORE</h3>
            <Link to="/matches" className="footer__link">Matches</Link>
            <Link to="/news" className="footer__link">News</Link>
            <Link to="/events" className="footer__link">Events</Link>
            <Link to="/merch" className="footer__link">Merchandise</Link>
          </div>
          <div className="footer__col">
            <h3 className="footer__col-title">PLATFORM</h3>
            <span className="footer__link">Live Match Tracking</span>
            <span className="footer__link">Ticket Booking</span>
            <span className="footer__link">Sports Events</span>
            <span className="footer__link">Premium Merchandise</span>
          </div>
        </div>
        <div className="footer__bottom">
          <p>© 2026 SPORTIFY • ULTIMATE SPORTS PLATFORM</p>
        </div>
      </footer>

    </div>
  )
}