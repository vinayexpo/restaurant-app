import { useEffect, useState } from 'react'
import { Outlet, NavLink, Navigate, Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import toast from 'react-hot-toast'
import {
  LayoutDashboard,
  ClipboardList,
  UtensilsCrossed,
  Star,
  Tag,
  TrendingUp,
  Settings,
  LogOut,
  Bell,
  Menu,
  X,
} from 'lucide-react'
import { logout } from '../features/auth/authSlice'
import { setOwnerRestaurant } from '../features/owner/ownerSlice'
import { authService } from '../services/authService'
import { ownerService } from '../services/ownerService'
import { subscribeToUserNotifications } from '../hooks/usePushNotifications'
import { pushService } from '../services/pushService'
import { setUnreadCount, incrementUnread } from '../features/customer/notificationsSlice'

const NAV_ITEMS = [
  { to: '/owner/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/owner/orders', label: 'Orders', icon: ClipboardList },
  { to: '/owner/menu/items', label: 'Menu', icon: UtensilsCrossed },
  { to: '/owner/reviews', label: 'Reviews', icon: Star },
  { to: '/owner/coupons', label: 'Coupons', icon: Tag },
  { to: '/owner/revenue', label: 'Revenue', icon: TrendingUp },
  { to: '/owner/settings', label: 'Settings', icon: Settings },
]

export function OwnerLayout() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [checked, setChecked] = useState(false)
  const [needsRegistration, setNeedsRegistration] = useState(false)
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.auth)
  const unreadCount = useSelector((state) => state.notifications.unreadCount)

  useEffect(() => {
    ownerService
      .getRestaurant()
      .then(({ data }) => {
        dispatch(setOwnerRestaurant(data.data))
        if (!data.data.is_active) setNeedsRegistration(true)
      })
      .catch(() => setNeedsRegistration(true))
      .finally(() => setChecked(true))
  }, [dispatch])

  useEffect(() => {
    if (!user?.id) return

    pushService
      .unreadCount()
      .then(({ data }) => dispatch(setUnreadCount(data.data.unread_count)))
      .catch(() => {})

    return subscribeToUserNotifications(user.id, {
      onNotification: (notification) => {
        dispatch(incrementUnread())
        toast(notification.title, { icon: '🔔' })
      },
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id])

  if (checked && needsRegistration) {
    return <Navigate to="/owner/register-restaurant" replace />
  }

  if (!checked) return null

  const handleLogout = async () => {
    try {
      await authService.logout()
    } finally {
      dispatch(logout())
    }
  }

  const sidebarContent = (
    <>
      <div className="flex h-16 items-center gap-2 px-5">
        <span className="font-display text-lg font-extrabold text-brand-500">RestaurantApp</span>
      </div>
      <nav className="flex-1 space-y-1 px-3">
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive ? 'bg-brand-50 text-brand-600' : 'text-neutral-600 hover:bg-neutral-100'
              }`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>
      <div className="p-3">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-neutral-600 hover:bg-neutral-100"
        >
          <LogOut size={18} />
          Log Out
        </button>
      </div>
    </>
  )

  return (
    <div className="flex min-h-screen bg-neutral-50">
      <aside className="hidden w-64 flex-col border-r border-neutral-200 bg-white lg:fixed lg:inset-y-0 lg:flex">
        {sidebarContent}
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <aside className="relative flex h-full w-64 flex-col bg-white">{sidebarContent}</aside>
        </div>
      )}

      <div className="flex flex-1 flex-col lg:pl-64">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-neutral-200 bg-white px-5">
          <button
            onClick={() => setMobileOpen((v) => !v)}
            className="flex size-9 items-center justify-center rounded-md text-neutral-500 hover:bg-neutral-100 lg:hidden"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <h1 className="text-base font-semibold text-neutral-900">Owner Dashboard</h1>
          <Link
            to="/owner/notifications"
            className="relative ml-auto flex size-9 items-center justify-center rounded-full text-neutral-500 hover:bg-neutral-100"
          >
            <Bell size={18} />
            {unreadCount > 0 && <span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-danger-500" />}
          </Link>
        </header>
        <main className="flex-1 p-5">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
