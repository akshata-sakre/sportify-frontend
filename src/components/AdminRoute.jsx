import { useAuth } from '../context/AuthContext'
import { Navigate } from 'react-router-dom'

export default function AdminRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) return null
  if (!user) return <Navigate to="/login" />
  if (user.role !== 'ADMIN') return <Navigate to="/" />

  return children
}