import { useEffect } from 'react'
import { Outlet, Link, NavLink } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import toast from 'react-hot-toast'
import { Home, Search, ClipboardList, User, ShoppingCart, Bell } from 'lucide-react'
import api from '../lib/axios'
import { getEcho } from '../lib/echo'
import { setUnreadCount, incrementUnread } from '../features/customer/notificationsSlice'

const TABS = [
  { to: '/', label: 'Home', icon: Home, end: true },
  { to: '/restaurants', label: 'Browse', icon: Search },
  { to: '/orders', label: 'Orders', icon: ClipboardList },
  { to: '/profile', label: 'Profile', icon: User },
]

export function CustomerLayout() {
  const dispatch = useDispatch()
  const { isAuthenticated, user } = useSelector((state) => state.auth)
  const totalItems = useSelector((state) => state.cart.totalItems)
  const unreadCount = useSelector((state) => state.notifications.unreadCount)

  useEffect(() => {
    if (!isAuthenticated || !user?.id) return

    api.get('/notifications', { params: { page: 1 } }).then(({ data }) => {
      dispatch(setUnreadCount(data.data.filter((n) => !n.read_at).length))
    })

    const echo = getEcho()
    const channel = echo.private(`App.Models.User.${user.id}`)
    channel.listen('.notification.created', (notification) => {
      dispatch(incrementUnread())
      toast(notification.title, { icon: '🔔' })
    })
    return () => echo.leave(`App.Models.User.${user.id}`)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, user?.id])

  return (
    <div className="flex min-h-screen flex-col bg-neutral-50">
      <header className="sticky top-0 z-30 hidden border-b border-neutral-200 bg-white/95 backdrop-blur md:block">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-6 px-6">
          <Link to="/" className="font-display text-xl font-extrabold text-brand-500">
            RestaurantApp
          </Link>
          <Link to="/restaurants" className="text-sm font-medium text-neutral-600 hover:text-neutral-900">
            Browse Restaurants
          </Link>
          {isAuthenticated && (
            <Link to="/orders" className="text-sm font-medium text-neutral-600 hover:text-neutral-900">
              Orders
            </Link>
          )}
          <div className="ml-auto flex items-center gap-2">
            {isAuthenticated && (
              <Link
                to="/notifications"
                className="relative flex size-10 items-center justify-center rounded-full text-neutral-500 hover:bg-neutral-100"
              >
                <Bell size={19} />
                {unreadCount > 0 && (
                  <span className="absolute right-1 top-1.5 size-2 rounded-full bg-danger-500" />
                )}
              </Link>
            )}
            <Link
              to="/cart"
              className="relative flex size-10 items-center justify-center rounded-full text-neutral-500 hover:bg-neutral-100"
            >
              <ShoppingCart size={19} />
              {totalItems > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex size-4.5 items-center justify-center rounded-full bg-brand-500 text-[10px] font-bold text-white">
                  {totalItems}
                </span>
              )}
            </Link>
            {isAuthenticated ? (
              <Link
                to="/profile"
                className="flex size-9 items-center justify-center rounded-full bg-brand-50 text-brand-500"
              >
                <User size={17} />
              </Link>
            ) : (
              <Link
                to="/auth/login"
                className="rounded-md bg-brand-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-600"
              >
                Log In
              </Link>
            )}
          </div>
        </div>
      </header>

      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-neutral-200 bg-white px-4 md:hidden">
        <Link to="/" className="font-display text-lg font-extrabold text-brand-500">
          RestaurantApp
        </Link>
        <div className="flex items-center gap-1">
          {isAuthenticated && (
            <Link
              to="/notifications"
              className="relative flex size-9 items-center justify-center rounded-full text-neutral-500"
            >
              <Bell size={18} />
              {unreadCount > 0 && <span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-danger-500" />}
            </Link>
          )}
          <Link
            to="/cart"
            className="relative flex size-9 items-center justify-center rounded-full text-neutral-500"
          >
            <ShoppingCart size={18} />
            {totalItems > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full bg-brand-500 text-[9px] font-bold text-white">
                {totalItems}
              </span>
            )}
          </Link>
        </div>
      </header>

      <main className="flex-1 pb-20 md:pb-0">
        <Outlet />
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-4 border-t border-neutral-200 bg-white md:hidden">
        {TABS.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex min-h-[56px] flex-col items-center justify-center gap-0.5 text-xs font-medium ${
                isActive ? 'text-brand-500' : 'text-neutral-400'
              }`
            }
          >
            <Icon size={20} />
            {label}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
