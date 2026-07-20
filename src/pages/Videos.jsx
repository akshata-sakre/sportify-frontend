import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { getAllVideos, getAllSports } from '../services/api'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faVideo, faBolt, faFilter,
  faPlay, faFilm, faStar
} from '@fortawesome/free-solid-svg-icons'
import '../styles/Videos.css'

export default function Videos() {
  const [videos, setVideos] = useState([])
  const [sports, setSports] = useState([])
  const [selected, setSelected] = useState('ALL')

  useEffect(() => {
    getAllVideos().then(res => setVideos(res.data))
    getAllSports().then(res => setSports(res.data))
  }, [])

  const filtered = selected === 'ALL'
    ? videos
    : videos.filter(v => v.sport.name === selected)

  const getTypeIcon = (type) => {
    if (type === 'HIGHLIGHT') return faStar
    if (type === 'LIVE') return faBolt
    return faFilm
  }

  return (
    <div className="videos-page">

      {/* HEADER */}
      <div className="videos-header">
        <div className="videos-header__orb" />
        <div className="videos-header__inner">
          <p className="videos-header__eyebrow">
            <FontAwesomeIcon icon={faBolt} /> SPORTIFY
          </p>
          <h1 className="videos-header__title">VIDEOS & HIGHLIGHTS</h1>
          <p className="videos-header__sub">Watch the best moments in sports</p>
        </div>
      </div>

      <div className="videos-container">

        {/* FILTERS */}
        <div className="videos-filters">
          <div className="videos-filters__label">
            <FontAwesomeIcon icon={faFilter} /> FILTER BY SPORT
          </div>
          <div className="videos-filters__btns">
            <button
              onClick={() => setSelected('ALL')}
              className={`videos-filter-btn ${selected === 'ALL' ? 'videos-filter-btn--active' : ''}`}>
              ALL VIDEOS
            </button>
            {sports.map(sport => (
              <button
                key={sport.id}
                onClick={() => setSelected(sport.name)}
                className={`videos-filter-btn ${selected === sport.name ? 'videos-filter-btn--active' : ''}`}>
                {sport.name.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* COUNT */}
        <p className="videos-count">
          Showing <span>{filtered.length}</span> video{filtered.length !== 1 ? 's' : ''}
        </p>

        {/* EMPTY */}
        {filtered.length === 0 ? (
          <div className="videos-empty">
            <FontAwesomeIcon icon={faVideo} className="videos-empty__icon" />
            <p>No videos found</p>
          </div>
        ) : (
          <div className="videos-grid">
            {filtered.map((video, i) => (
              <motion.div
                key={video.id}
                className="video-card"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                whileHover={{ y: -6, transition: { duration: 0.2 } }}>

                {/* Thumbnail */}
                <div
                  className="video-card__thumb"
                  onClick={() => window.open(video.url, '_blank')}>
                  <div className="video-card__thumb-bg" />
                  <div className="video-card__play">
                    <FontAwesomeIcon icon={faPlay} />
                  </div>
                  <div className="video-card__type-badge">
                    <FontAwesomeIcon icon={getTypeIcon(video.type)} />
                    {video.type}
                  </div>
                </div>

                <div className="video-card__body">
                  <div className="video-card__badges">
                    <span className="video-badge video-badge--sport">
                      {video.sport.name.toUpperCase()}
                    </span>
                    <span className={`video-badge ${video.type === 'LIVE' ? 'video-badge--live' : 'video-badge--highlight'}`}>
                      {video.type === 'LIVE' && <span className="live-dot" />}
                      {video.type}
                    </span>
                  </div>

                  <h3 className="video-card__title">{video.title}</h3>

                  <button
                    className="video-card__btn"
                    onClick={() => window.open(video.url, '_blank')}>
                    <FontAwesomeIcon icon={faPlay} />
                    WATCH NOW
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}