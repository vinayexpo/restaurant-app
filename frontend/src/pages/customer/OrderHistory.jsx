import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { ClipboardList, RotateCcw, Star } from 'lucide-react'
import { orderService } from '../../services/orderService'
import { Badge } from '../../components/Badge'
import { Button } from '../../components/Button'
import { EmptyState } from '../../components/EmptyState'
import { Pagination } from '../../components/Pagination'
import { SkeletonListRow } from '../../components/Skeleton'
import { pageTransitionVariants } from '../../lib/motion'

export default function OrderHistory() {
  const navigate = useNavigate()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [meta, setMeta] = useState({ page: 1, last_page: 1 })
  const [filters, setFilters] = useState({ status: '', date_from: '', date_to: '' })
  const [reorderingId, setReorderingId] = useState(null)

  const load = useCallback((pageNum = 1) => {
    setLoading(true)
    orderService
      .list({ page: pageNum, ...filters })
      .then(({ data }) => {
        setOrders(data.data)
        setMeta(data.meta)
      })
      .finally(() => setLoading(false))
  }, [filters])

  useEffect(() => {
    load(1)
  }, [load])

  const handleReorder = async (id) => {
    setReorderingId(id)
    try {
      const { data } = await orderService.reorder(id)
      if (data.data.conflict) {
        toast.error('Some items are no longer available — cart updated with what could be added.')
      } else {
        toast.success('Items added to cart!')
      }
      navigate('/cart')
    } catch {
      toast.error('Could not reorder. Please try again.')
    } finally {
      setReorderingId(null)
    }
  }

  return (
    <motion.div {...pageTransitionVariants} className="mx-auto max-w-2xl px-4 py-6">
      <h1 className="mb-5 text-xl font-bold text-neutral-900">Order History</h1>

      <div className="mb-5 grid gap-2 sm:grid-cols-3">
        <select
          value={filters.status}
          onChange={(e) => setFilters((current) => ({ ...current, status: e.target.value }))}
          className="h-10 rounded-md border border-neutral-200 bg-white px-3 text-sm text-neutral-700"
        >
          <option value="">All statuses</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="preparing">Preparing</option>
          <option value="ready_for_pickup">Ready for pickup</option>
          <option value="picked_up">Picked up</option>
          <option value="on_the_way">On the way</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <input type="date" aria-label="Orders from date" value={filters.date_from} onChange={(e) => setFilters((current) => ({ ...current, date_from: e.target.value }))} className="h-10 rounded-md border border-neutral-200 bg-white px-3 text-sm text-neutral-700" />
        <input type="date" aria-label="Orders to date" value={filters.date_to} onChange={(e) => setFilters((current) => ({ ...current, date_to: e.target.value }))} className="h-10 rounded-md border border-neutral-200 bg-white px-3 text-sm text-neutral-700" />
      </div>

      {loading ? (
        <div className="rounded-lg border border-neutral-100 bg-white px-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonListRow key={i} />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="No orders yet"
          description="Your order history will show up here once you place your first order."
          action={<Button onClick={() => navigate('/restaurants')}>Browse Restaurants</Button>}
        />
      ) : (
        <>
          <div className="space-y-3">
            {orders.map((order) => (
              <div key={order.id} className="rounded-lg border border-neutral-100 bg-white p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <Link to={`/orders/${order.id}`} className="text-sm font-semibold text-neutral-900 hover:text-brand-600">
                      {order.order_number}
                    </Link>
                    <p className="text-xs text-neutral-500">{order.restaurant?.name}</p>
                    <p className="mt-0.5 text-xs text-neutral-400">{new Date(order.created_at).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <Badge status={order.status} />
                    <p className="mt-1.5 text-sm font-bold text-neutral-900">₹{Number(order.total_amount).toFixed(2)}</p>
                  </div>
                </div>
                <div className="mt-3 flex gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    loading={reorderingId === order.id}
                    onClick={() => handleReorder(order.id)}
                  >
                    <RotateCcw size={13} /> Reorder
                  </Button>
                  {order.status === 'delivered' && !order.review_exists && (
                    <Button size="sm" variant="ghost" onClick={() => navigate(`/orders/${order.id}?review=1`)}>
                      <Star size={13} /> Write a Review
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <Pagination meta={meta} onPageChange={load} />
        </>
      )}
    </motion.div>
  )
}
