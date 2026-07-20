import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBolt, faCircle } from '@fortawesome/free-solid-svg-icons'
import './Marquee.css'

const items = [
  'LIVE: India vs Australia — Wankhede Stadium',
  'UPCOMING: Real Madrid vs Barcelona — Santiago Bernabeu',
  'IPL 2026 Opening Ceremony — Narendra Modi Stadium',
  'NEW MERCH DROP — India Cricket Jersey Available Now',
  'BREAKING: India wins the series against Australia',
  'EVENTS: IPL 2026 Season Kickoff This March',
]

export default function Marquee() {
  return (
    <div className="marquee-bar">
      <div className="marquee-label">
        <FontAwesomeIcon icon={faBolt} />
        LIVE
      </div>
      <div className="marquee-track">
        <div className="marquee-content">
          {[...items, ...items].map((item, i) => (
            <span key={i} className="marquee-item">
              <FontAwesomeIcon icon={faCircle} className="marquee-dot" />
              {item}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}