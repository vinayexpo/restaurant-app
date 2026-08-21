import { useState } from 'react'
import { Outlet, NavLink } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import {
  LayoutDashboard,
  Users,
  Percent,
  TrendingUp,
  History,
  Flag,
  UserCog,
  Settings,
  LogOut,
  Menu,
  X,
  Sparkles,
  AlertTriangle,
} from 'lucide-react'
import { logout } from '../features/auth/authSlice'
import { setImpersonating } from '../features/superadmin/superadminSlice'
import { authService } from '../services/authService'
import api from '../lib/axios'

const NAV_ITEMS = [
  { to: '/superadmin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/superadmin/admins', label: 'Admins', icon: Users },
  { to: '/superadmin/commissions', label: 'Commissions', icon: Percent },
  { to: '/superadmin/financials', label: 'Financials', icon: TrendingUp },
  { to: '/superadmin/audit-logs', label: 'Audit Logs', icon: History },
  { to: '/superadmin/feature-flags', label: 'Feature Flags', icon: Flag },
  { to: '/superadmin/impersonation', label: 'Impersonate', icon: UserCog },
  { to: '/superadmin/settings', label: 'Settings', icon: Settings },
]

export function SuperadminLayout() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const dispatch = useDispatch()
  const impersonating = useSelector((state) => state.superadmin.impersonating)

  const handleLogout = async () => {
    try {
      await authService.logout()
    } finally {
      dispatch(logout())
    }
  }

  const exitImpersonation = async () => {
    await api.delete('/superadmin/impersonate')
    dispatch(setImpersonating(null))
    dispatch(logout())
  }

  const sidebarContent = (
    <>
      <div className="flex h-16 items-center gap-2 px-5">
        <Sparkles size={20} className="text-purple-400" />
        <span className="font-display text-lg font-extrabold text-white">Superadmin</span>
      </div>
      <nav className="flex-1 space-y-1 px-3">
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive ? 'bg-purple-500/20 text-white' : 'text-neutral-400 hover:bg-white/5 hover:text-neutral-200'
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
    <div className="flex min-h-screen flex-col bg-neutral-50">
      {impersonating && (
        <div className="flex h-11 items-center justify-center gap-3 bg-warning-500 px-4 text-sm font-medium text-neutral-900">
          <AlertTriangle size={16} />
          Impersonating {impersonating.name} ({impersonating.role})
          <button onClick={exitImpersonation} className="ml-2 font-semibold underline underline-offset-2">
            Exit Impersonation
          </button>
        </div>
      )}

      <div className="flex flex-1">
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
            <h1 className="text-base font-semibold text-neutral-900">Superadmin</h1>
          </header>
          <main className="flex-1 p-5">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  )
}
