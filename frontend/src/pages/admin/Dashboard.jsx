import { useEffect, useState } from 'react'
import { adminService } from '../../services/adminService'
import { SkeletonStat } from '../../components/Skeleton'
import { ClipboardList, IndianRupee, UtensilsCrossed, Bike, Clock } from 'lucide-react'

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)

  useEffect(() => {
    adminService.dashboard().then(({ data }) => setStats(data.data))
  }, [])

  if (!stats) {
    return (
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonStat key={i} />
        ))}
      </div>
    )
  }

  const cards = [
    { label: "Today's Orders", value: stats.orders_today, icon: ClipboardList },
    { label: "Today's Revenue", value: `₹${stats.revenue_today.toFixed(0)}`, icon: IndianRupee },
    { label: 'Active Restaurants', value: stats.active_restaurants, icon: UtensilsCrossed },
    { label: 'Pending Approvals', value: stats.pending_restaurant_approvals, icon: Clock },
    { label: 'Active Delivery Partners', value: stats.active_delivery_partners, icon: Bike },
    { label: 'Order Success Rate', value: `${stats.orders_success_rate}%`, icon: ClipboardList },
  ]

  return (
    <div>
      <h1 className="mb-4 text-lg font-bold text-neutral-900">Dashboard</h1>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        {cards.map(({ label, value, icon: Icon }) => (
          <div key={label} className="rounded-lg border border-neutral-100 bg-white p-4">
            <div className="mb-2 flex items-center gap-2 text-neutral-400">
              <Icon size={15} />
              <span className="text-xs font-medium">{label}</span>
            </div>
            <p className="text-2xl font-bold text-neutral-900">{value}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
