import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faHouse, faCalendarDays, faShirt, faNewspaper,
  faVideo, faCalendarCheck, faCartShopping, faUser,
  faRightFromBracket, faBolt, faBars, faXmark
} from '@fortawesome/free-solid-svg-icons'
import './Navbar.css'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    setMenuOpen(false)
    navigate('/login')
  }

  const closeMenu = () => setMenuOpen(false)

  const navLinks = [
    { to: '/', icon: faHouse, label: 'Home' },
    { to: '/matches', icon: faCalendarDays, label: 'Matches' },
    { to: '/merch', icon: faShirt, label: 'Merch' },
    { to: '/news', icon: faNewspaper, label: 'News' },
    { to: '/videos', icon: faVideo, label: 'Videos' },
    { to: '/events', icon: faCalendarCheck, label: 'Events' },
  ]

  return (
    <nav className="navbar">
      <div className="navbar-inner">

        <Link to="/" className="navbar-logo" onClick={closeMenu}>
          <FontAwesomeIcon icon={faBolt} className="navbar-logo-icon" />
          SPORTIFY
        </Link>

        <button
          className="navbar-toggle"
          onClick={() => setMenuOpen(prev => !prev)}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}>
          <FontAwesomeIcon icon={menuOpen ? faXmark : faBars} />
        </button>

        <div className={`navbar-links ${menuOpen ? 'navbar-links--open' : ''}`}>
          {navLinks.map(link => (
            <Link key={link.to} to={link.to} className="nav-link" onClick={closeMenu}>
              <FontAwesomeIcon icon={link.icon} />
              {link.label.toUpperCase()}
            </Link>
          ))}

         {user ? (
  <>
{user?.role === "ADMIN" && (
  <Link to="/admin" className="nav-link" onClick={closeMenu}>
    ADMIN
  </Link>
)}

    <Link to="/cart" className="nav-link" onClick={closeMenu}>
      <FontAwesomeIcon icon={faCartShopping} />
      CART
    </Link>
              <Link to="/profile" className="nav-link nav-link--active" onClick={closeMenu}>
                <FontAwesomeIcon icon={faUser} />
                {user.name.toUpperCase()}
              </Link>
              <button onClick={handleLogout} className="navbar-btn">
                <FontAwesomeIcon icon={faRightFromBracket} />
                LOGOUT
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="navbar-btn navbar-btn--outline" onClick={closeMenu}>
                LOGIN
              </Link>
              <Link to="/register" className="navbar-btn" onClick={closeMenu}>
                REGISTER
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}