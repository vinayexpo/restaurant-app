import { useState } from 'react'
import { Outlet, NavLink } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import {
  LayoutDashboard,
  Users,
  UtensilsCrossed,
  ClipboardList,
  Bike,
  Tag,
  Gem,
  Bell,
  Settings,
  LogOut,
  Menu,
  X,
  ShieldCheck,
} from 'lucide-react'
import { logout } from '../features/auth/authSlice'
import { authService } from '../services/authService'

const NAV_ITEMS = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin/users', label: 'Users', icon: Users },
  { to: '/admin/restaurants', label: 'Restaurants', icon: UtensilsCrossed },
  { to: '/admin/orders', label: 'Orders', icon: ClipboardList },
  { to: '/admin/delivery-partners', label: 'Delivery Partners', icon: Bike },
  { to: '/admin/coupons', label: 'Coupons', icon: Tag },
  { to: '/admin/loyalty', label: 'Loyalty', icon: Gem },
  { to: '/admin/notifications', label: 'Notifications', icon: Bell },
  { to: '/admin/settings', label: 'Settings', icon: Settings },
]

export function AdminLayout() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const dispatch = useDispatch()

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
        <ShieldCheck size={20} className="text-brand-400" />
        <span className="font-display text-lg font-extrabold text-white">Admin</span>
      </div>
      <nav className="flex-1 space-y-1 px-3">
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive ? 'bg-white/10 text-white' : 'text-neutral-400 hover:bg-white/5 hover:text-neutral-200'
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
          className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-neutral-400 hover:bg-white/5 hover:text-neutral-200"
        >
          <LogOut size={18} />
          Log Out
        </button>
      </div>
    </>
  )

  return (
    <div className="flex min-h-screen bg-neutral-50">
      <aside className="hidden w-64 flex-col bg-neutral-900 lg:fixed lg:inset-y-0 lg:flex">{sidebarContent}</aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <aside className="relative flex h-full w-64 flex-col bg-neutral-900">{sidebarContent}</aside>
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
          <h1 className="text-base font-semibold text-neutral-900">Admin Panel</h1>
        </header>
        <main className="flex-1 p-5">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
