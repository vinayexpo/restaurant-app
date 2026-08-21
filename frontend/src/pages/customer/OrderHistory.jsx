import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { ClipboardList, RotateCcw, Star } from 'lucide-react'
import { orderService } from '../../services/orderService'
import { Badge } from '../../components/Badge'
import { Button } from '../../components/Button'
import { EmptyState } from '../../components/EmptyState'
import { SkeletonListRow } from '../../components/Skeleton'
import { pageTransitionVariants } from '../../lib/motion'

export default function OrderHistory() {
  const navigate = useNavigate()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [lastPage, setLastPage] = useState(1)
  const [reorderingId, setReorderingId] = useState(null)

  const load = (pageNum = 1) => {
    setLoading(true)
    orderService
      .list({ page: pageNum })
      .then(({ data }) => {
        setOrders(data.data)
        setPage(data.meta.page)
        setLastPage(data.meta.last_page)
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
  }, [])

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

          {lastPage > 1 && (
            <div className="mt-5 flex justify-center gap-2">
              <Button size="sm" variant="secondary" disabled={page <= 1} onClick={() => load(page - 1)}>
                Previous
              </Button>
              <span className="flex items-center px-3 text-sm text-neutral-500">
                Page {page} of {lastPage}
              </span>
              <Button size="sm" variant="secondary" disabled={page >= lastPage} onClick={() => load(page + 1)}>
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </motion.div>
  )
}
