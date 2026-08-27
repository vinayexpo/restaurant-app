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

  const load = (page = 1) => {
    setLoading(true)
    deliveryService.history({ page })
      .then(({ data }) => {
        setOrders(data.data)
        setMeta(data.meta)
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
  }, [])

  if (loading) {
    return <div className="space-y-2 p-4"><SkeletonListRow /><SkeletonListRow /><SkeletonListRow /></div>
  }

  return (
    <div className="p-4">
      <h1 className="mb-4 text-lg font-bold text-neutral-900">Delivery History</h1>
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
