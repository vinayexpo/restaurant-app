import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { AnimatePresence, motion } from 'framer-motion'
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts'
import { ClipboardList, IndianRupee, Star, Clock } from 'lucide-react'
import { ownerService } from '../../services/ownerService'
import { SkeletonStat } from '../../components/Skeleton'
import { getEcho } from '../../lib/echo'

export default function OwnerDashboard() {
  const restaurant = useSelector((state) => state.owner.restaurant)
  const [pendingCount, setPendingCount] = useState(0)
  const [revenue, setRevenue] = useState(null)
  const [reviews, setReviews] = useState([])
  const [liveOrders, setLiveOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([ownerService.orders({ status: 'pending' }), ownerService.revenue({ period: 'daily' }), ownerService.reviews()])
      .then(([ordersRes, revenueRes, reviewsRes]) => {
        setPendingCount(ordersRes.data.meta.total)
        setRevenue(revenueRes.data.data)
        setReviews(reviewsRes.data.data.slice(0, 3))
      })
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (!restaurant?.id) return
    const echo = getEcho()
    const channel = echo.private(`restaurant.${restaurant.id}.orders`)
    channel.listen('.order.new', (payload) => {
      setLiveOrders((prev) => [payload, ...prev].slice(0, 5))
    })
    return () => echo.leave(`restaurant.${restaurant.id}.orders`)
  }, [restaurant?.id])

  const today = new Date().toISOString().slice(0, 10)
  const todayEntry = revenue?.breakdown?.find((b) => b.period === today)

  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonStat key={i} />
        ))}
      </div>
    )
  }

  const stats = [
    { label: "Today's Orders", value: todayEntry?.order_count ?? 0, icon: ClipboardList },
    { label: "Today's Revenue", value: `₹${Number(todayEntry?.revenue ?? 0).toFixed(0)}`, icon: IndianRupee },
    { label: 'Pending Orders', value: pendingCount, icon: Clock },
    { label: 'Avg Rating', value: Number(restaurant?.avg_rating ?? 0).toFixed(1), icon: Star },
  ]

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map(({ label, value, icon: Icon }) => (
          <div key={label} className="rounded-lg border border-neutral-100 bg-white p-4">
            <div className="mb-2 flex items-center gap-2 text-neutral-400">
              <Icon size={15} />
              <span className="text-xs font-medium">{label}</span>
            </div>
            <p className="text-2xl font-bold text-neutral-900">{value}</p>
          </div>
        ))}
      </div>

      {liveOrders.length > 0 && (
        <div className="rounded-lg border border-brand-200 bg-brand-50 p-4">
          <h3 className="mb-2 text-sm font-bold text-brand-700">Live Order Feed</h3>
          <AnimatePresence>
            {liveOrders.map((o) => (
              <motion.div
                key={o.order_id}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex items-center justify-between border-b border-brand-100 py-1.5 text-sm last:border-0"
              >
                <span className="font-medium text-neutral-900">{o.order_number}</span>
                <span className="text-xs text-brand-600">New order!</span>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      <div className="rounded-lg border border-neutral-100 bg-white p-4">
        <h3 className="mb-4 text-sm font-bold text-neutral-900">Revenue (last 30 days)</h3>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={revenue?.breakdown ?? []}>
            <XAxis dataKey="period" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip />
            <Bar dataKey="revenue" fill="#F97316" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="rounded-lg border border-neutral-100 bg-white p-4">
        <h3 className="mb-3 text-sm font-bold text-neutral-900">Recent Reviews</h3>
        {reviews.length === 0 ? (
          <p className="text-sm text-neutral-500">No reviews yet.</p>
        ) : (
          <div className="space-y-3">
            {reviews.map((r) => (
              <div key={r.id} className="border-b border-neutral-50 pb-3 last:border-0">
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-0.5 text-xs font-semibold text-warning-500">
                    <Star size={12} fill="currentColor" /> {r.rating}
                  </span>
                  <span className="text-xs text-neutral-400">{r.user?.name}</span>
                </div>
                {r.comment && <p className="mt-1 text-sm text-neutral-600">{r.comment}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
