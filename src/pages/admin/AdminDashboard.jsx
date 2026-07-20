import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faBolt,
  faGauge,
  faUsers,
  faCalendarDays,
  faCalendarCheck,
  faShirt,
  faBoxOpen,
  faNewspaper,
  faVideo,
  faTicket,
  faRightFromBracket,
  faFutbol
} from '@fortawesome/free-solid-svg-icons'

import AdminStats from './AdminStats'
import AdminUsers from './AdminUsers'
import AdminMatches from './AdminMatches'
import AdminProducts from './AdminProducts'
import AdminOrders from './AdminOrders'
import AdminNews from './AdminNews'
import AdminEvents from './AdminEvents'
import AdminTicketBookings from './AdminTicketBookings'
import AdminVideos from "./AdminVideos"
import AdminTeams from "./AdminTeams";
import AdminSports from "./AdminSports";
import '../../styles/Admin.css'

const navGroups = [
  {
    heading: 'OVERVIEW',
    items: [
      { to: '/admin', icon: faGauge, label: 'Dashboard', exact: true },
    ]
  },
  {
    heading: 'MANAGE',
    items: [
      { to: '/admin/users', icon: faUsers, label: 'View Users' },
      {
  to: "/admin/sports",
  icon: faFutbol,
  label: "Sports"
},
      {
  to: "/admin/teams",
  icon: faUsers,
  label: "Teams",
},
      { to: '/admin/bookings', icon: faTicket, label: 'Ticket Bookings' },
      { to: '/admin/orders', icon: faBoxOpen, label: 'Orders' },
    ]
  },
  {
    heading: 'ADD CONTENT',
    items: [
      { to: '/admin/matches', icon: faCalendarDays, label: 'Add Matches' },
      { to: '/admin/events', icon: faCalendarCheck, label: 'Add Events' },
      { to: '/admin/products', icon: faShirt, label: 'Add Merch' },
      { to: '/admin/news', icon: faNewspaper, label: 'Add News' },
       { to: '/admin/videos', icon: faVideo, label: 'Add Videos' },
    ]
  },
]

export default function AdminDashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const isActive = (to, exact) => {
    if (exact) return location.pathname === to
    return location.pathname.startsWith(to)
  }

  return (
    <div className="admin-layout">

      {/* SIDEBAR */}
      <aside className="admin-sidebar">

        {/* Logo */}
        <div className="admin-sidebar__logo">
          <FontAwesomeIcon icon={faBolt} />
          SPORTIFY
          <span>ADMIN</span>
        </div>

        {/* Nav Groups */}
        <nav className="admin-sidebar__nav">
          {navGroups.map(group => (
            <div key={group.heading} className="admin-nav-group">
              <p className="admin-nav-group__heading">{group.heading}</p>
              {group.items.map(item => (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`admin-nav-item ${isActive(item.to, item.exact) ? 'admin-nav-item--active' : ''}`}
                >
                  <FontAwesomeIcon icon={item.icon} />
                  {item.label}
                </Link>
              ))}
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="admin-sidebar__footer">
          <div className="admin-sidebar__user">
            <div className="admin-sidebar__avatar">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="admin-sidebar__name">{user?.name}</p>
              <p className="admin-sidebar__role">ADMINISTRATOR</p>
            </div>
          </div>
          <button onClick={handleLogout} className="admin-logout" title="Logout">
            <FontAwesomeIcon icon={faRightFromBracket} />
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="admin-main">
        <Routes>
          <Route path="/" element={<AdminStats />} />
          <Route path="/users" element={<AdminUsers />} />
          <Route path="/matches" element={<AdminMatches />} />
          <Route path="/products" element={<AdminProducts />} />
          <Route path="/orders" element={<AdminOrders />} />
          <Route path="/news" element={<AdminNews />} />
          <Route path="/events" element={<AdminEvents />} />
          <Route path="/bookings" element={<AdminTicketBookings />} />
          <Route path="/videos" element={<AdminVideos />} />
          <Route path="/teams" element={<AdminTeams />} />
          <Route
  path="/sports"
  element={<AdminSports />}
/>
          
        </Routes>
      </main>

    </div>
  )
}