import { useEffect, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts'
import { superadminService } from '../../services/superadminService'
import { adminService } from '../../services/adminService'
import { SkeletonStat } from '../../components/Skeleton'

export default function SuperadminDashboard() {
  const [financials, setFinancials] = useState(null)
  const [stats, setStats] = useState(null)

  useEffect(() => {
    const dateFrom = new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10)
    superadminService.financials({ date_from: dateFrom }).then(({ data }) => setFinancials(data.data))
    adminService.dashboard().then(({ data }) => setStats(data.data))
  }, [])

  if (!financials || !stats) {
    return (
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonStat key={i} />
        ))}
      </div>
    )
  }

  const cards = [
    { label: 'Gross Order Value', value: `₹${financials.gross_order_value.toFixed(0)}` },
    { label: 'Platform Commission', value: `₹${financials.platform_commission.toFixed(0)}` },
    { label: 'Delivery Revenue', value: `₹${financials.delivery_revenue.toFixed(0)}` },
    { label: 'Net Platform Revenue', value: `₹${financials.net_platform_revenue.toFixed(0)}`, highlight: true },
    { label: 'Active Restaurants', value: stats.active_restaurants },
    { label: 'Active Delivery Partners', value: stats.active_delivery_partners },
  ]

  return (
    <div>
      <h1 className="mb-4 text-lg font-bold text-neutral-900">Platform Overview</h1>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        {cards.map(({ label, value, highlight }) => (
          <div key={label} className={`rounded-lg border p-4 ${highlight ? 'border-purple-200 bg-purple-50' : 'border-neutral-100 bg-white'}`}>
            <p className="text-xs font-medium text-neutral-400">{label}</p>
            <p className={`mt-1 text-2xl font-bold ${highlight ? 'text-purple-700' : 'text-neutral-900'}`}>{value}</p>
          </div>
        ))}
      </div>

      {financials.by_restaurant?.length > 0 && (
        <div className="mt-6 rounded-lg border border-neutral-100 bg-white p-4">
          <h3 className="mb-4 text-sm font-bold text-neutral-900">GMV by Restaurant</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={financials.by_restaurant}>
              <XAxis dataKey="restaurant_name" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="gmv" fill="#a855f7" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
