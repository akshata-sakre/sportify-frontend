import { useState, useEffect } from 'react'
import { getAllUsers } from '../../services/api'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUsers, faBolt, faEnvelope, faUser } from '@fortawesome/free-solid-svg-icons'

export default function AdminUsers() {
  const [users, setUsers] = useState([])

  useEffect(() => {
    getAllUsers().then(res => setUsers(res.data))
  }, [])

  return (
    <div className="admin-page">
      <div className="admin-page__header">
        <p className="admin-page__eyebrow"><FontAwesomeIcon icon={faBolt} /> MANAGE</p>
        <h1 className="admin-page__title">USERS</h1>
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Username</th>
              <th>Email</th>
              <th>Role</th>
              <th>Joined</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id}>
                <td>#{user.id}</td>
                <td>
                  <div className="admin-table__user">
                    <div className="admin-table__avatar">
                      {user.name?.charAt(0).toUpperCase()}
                    </div>
                    {user.name}
                  </div>
                </td>
                <td><FontAwesomeIcon icon={faEnvelope} /> {user.email}</td>
                <td>
                  <span className={`admin-badge ${user.role === 'ADMIN' ? 'admin-badge--red' : 'admin-badge--blue'}`}>
                    {user.role}
                  </span>
                </td>
                <td>{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}