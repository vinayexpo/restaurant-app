import { Outlet, Link, NavLink } from 'react-router-dom'
import { Bike, ClipboardList, Wallet, User, Bell } from 'lucide-react'

const TABS = [
  { to: '/delivery/dashboard', label: 'Home', icon: Bike },
  { to: '/delivery/orders', label: 'Orders', icon: ClipboardList },
  { to: '/delivery/earnings', label: 'Earnings', icon: Wallet },
  { to: '/delivery/profile', label: 'Profile', icon: User },
]

export function DeliveryLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-neutral-50">
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-neutral-200 bg-white px-4">
        <Link to="/delivery/dashboard" className="font-display text-lg font-extrabold text-brand-500">
          DeliverEase
        </Link>
        <button className="flex size-9 items-center justify-center rounded-full text-neutral-500 hover:bg-neutral-100">
          <Bell size={18} />
        </button>
      </header>

      <main className="flex-1 pb-20">
        <Outlet />
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-4 border-t border-neutral-200 bg-white">
        {TABS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
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
