import { useSelector } from 'react-redux'
import { Navigate, useLocation } from 'react-router-dom'

const PANEL_HOME = {
  customer: '/',
  restaurant_owner: '/owner/dashboard',
  delivery_partner: '/delivery/dashboard',
  admin: '/admin/dashboard',
  superadmin: '/superadmin/dashboard',
}

export function PrivateRoute({ children, roles = [] }) {
  const { isAuthenticated, user } = useSelector((state) => state.auth)
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />
  }

  if (roles.length > 0 && !roles.includes(user.role)) {
    return <Navigate to={PANEL_HOME[user.role] ?? '/'} replace />
  }

  return children
}

export function PublicOnlyRoute({ children }) {
  const { isAuthenticated, user } = useSelector((state) => state.auth)

  if (!isAuthenticated) return children

  return <Navigate to={PANEL_HOME[user.role] ?? '/'} replace />
}
