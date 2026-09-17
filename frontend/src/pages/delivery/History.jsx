import { useEffect, useState } from 'react'
import { ClipboardList } from 'lucide-react'
import { deliveryService } from '../../services/deliveryService'
import { Pagination } from '../../components/Pagination'
import { EmptyState } from '../../components/EmptyState'
import { SkeletonListRow } from '../../components/Skeleton'

export default function DeliveryHistory() {
  const [orders, setOrders] = useState([])
  const [meta, setMeta] = useState(null)
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({ status: 'delivered', search: '', date_from: '', date_to: '' })

  const load = (page = 1) => {
    setLoading(true)
    deliveryService.history({ page, ...filters })
      .then(({ data }) => {
        setOrders(data.data)
        setMeta(data.meta)
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [filters])

  if (loading) {
    return <div className="space-y-2 p-4"><SkeletonListRow /><SkeletonListRow /><SkeletonListRow /></div>
  }

  return (
    <div className="p-4">
      <h1 className="mb-4 text-lg font-bold text-neutral-900">Delivery History</h1>
      <div className="mb-4 grid gap-2 sm:grid-cols-2">
        <input value={filters.search} onChange={(e) => setFilters((current) => ({ ...current, search: e.target.value }))} placeholder="Search order or restaurant" className="h-9 rounded-md border border-neutral-200 px-3 text-sm" />
        <select value={filters.status} onChange={(e) => setFilters((current) => ({ ...current, status: e.target.value }))} className="h-9 rounded-md border border-neutral-200 px-3 text-sm"><option value="delivered">Delivered</option><option value="cancelled">Cancelled</option></select>
        <input type="date" aria-label="History from date" value={filters.date_from} onChange={(e) => setFilters((current) => ({ ...current, date_from: e.target.value }))} className="h-9 rounded-md border border-neutral-200 px-3 text-sm" />
        <input type="date" aria-label="History to date" value={filters.date_to} onChange={(e) => setFilters((current) => ({ ...current, date_to: e.target.value }))} className="h-9 rounded-md border border-neutral-200 px-3 text-sm" />
      </div>
      {orders.length === 0 ? (
        <EmptyState icon={ClipboardList} title="No completed deliveries" description="Completed orders will appear here." />
      ) : (
        <div className="divide-y divide-neutral-100 rounded-lg border border-neutral-100 bg-white">
          {orders.map((order) => (
            <div key={order.id} className="flex items-center justify-between px-4 py-3">
              <div>
                <p className="text-sm font-medium text-neutral-900">{order.order_number}</p>
                <p className="text-xs text-neutral-500">{order.restaurant?.name}</p>
                <p className="text-xs text-neutral-400">{new Date(order.delivered_at ?? order.created_at).toLocaleDateString()}</p>
              </div>
              <p className="text-sm font-bold text-accent-600">₹{Number(order.delivery_fee).toFixed(0)}</p>
            </div>
          ))}
        </div>
      )}
      <Pagination meta={meta} onPageChange={load} />
    </div>
  )
}
