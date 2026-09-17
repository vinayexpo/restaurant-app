import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import toast from 'react-hot-toast'
import { Clock } from 'lucide-react'
import { ownerService } from '../../services/ownerService'
import { getEcho } from '../../lib/echo'
import { Badge } from '../../components/Badge'
import { Button } from '../../components/Button'
import { Modal } from '../../components/Modal'
import { Pagination } from '../../components/Pagination'
import { EmptyState } from '../../components/EmptyState'
import { SkeletonListRow } from '../../components/Skeleton'

const TABS = [
  { key: 'pending', label: 'Pending', next: 'confirmed', nextLabel: 'Confirm' },
  { key: 'confirmed', label: 'Confirmed', next: 'preparing', nextLabel: 'Start Preparing' },
  { key: 'preparing', label: 'Preparing', next: 'ready_for_pickup', nextLabel: 'Mark Ready' },
  { key: 'ready_for_pickup', label: 'Ready for Pickup', next: null },
  { key: 'picked_up', label: 'Picked Up', next: null },
  { key: 'on_the_way', label: 'On the Way', next: null },
  { key: 'delivered', label: 'Delivered', next: null },
  { key: 'cancelled', label: 'Cancelled', next: null },
]

function timeElapsed(dateStr) {
  const mins = Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000)
  if (mins < 60) return `${mins}m ago`
  return `${Math.floor(mins / 60)}h ${mins % 60}m ago`
}

export default function OwnerOrders() {
  const restaurant = useSelector((state) => state.owner.restaurant)
  const [activeTab, setActiveTab] = useState('pending')
  const [orders, setOrders] = useState([])
  const [statusCounts, setStatusCounts] = useState({})
  const [meta, setMeta] = useState({ page: 1, last_page: 1 })
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [advancingId, setAdvancingId] = useState(null)
  const [refundingId, setRefundingId] = useState(null)
  const [filters, setFilters] = useState({ search: '', customer: '', payment_method: '', date_from: '', date_to: '' })

  const load = (page = 1) => {
    setLoading(true)
    ownerService
      .orders({ status: activeTab, page, ...filters })
      .then(({ data }) => {
        setOrders(data.data)
        setMeta(data.meta)
      })
      .finally(() => setLoading(false))

    ownerService.orderStatusCounts().then(({ data }) => setStatusCounts(data.data)).catch(() => {})
  }

  useEffect(() => load(1), [activeTab, filters])

  useEffect(() => {
    if (!restaurant?.id) return
    const echo = getEcho()
    const channel = echo.private(`restaurant.${restaurant.id}.orders`)
    channel.listen('.order.status.changed', () => {
      load()
      toast('Order update received.', { icon: '🔔' })
    })
    channel.listen('.order.new', () => {
      load()
      toast.success('New order received!')
    })
    return () => echo.leave(`restaurant.${restaurant.id}.orders`)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [restaurant?.id, activeTab])

  const advance = async (order, nextStatus) => {
    setAdvancingId(order.id)
    try {
      await ownerService.updateOrderStatus(order.id, { status: nextStatus })
      toast.success('Order status updated.')
      load()
    } catch (error) {
      toast.error(error.response?.data?.message ?? 'Could not update order.')
    } finally {
      setAdvancingId(null)
    }
  }

  const reject = (order) => {
    if (window.confirm(`Reject order ${order.order_number}? The customer will be notified.`)) {
      advance(order, 'cancelled')
    }
  }

  const refund = async (order) => {
    if (!window.confirm(`Refund ₹${Number(order.total_amount).toFixed(2)} to the customer? This cannot be undone.`)) return

    setRefundingId(order.id)
    try {
      await ownerService.refundOrder(order.id)
      toast.success('Payment refunded successfully.')
      load()
    } catch (error) {
      toast.error(error.response?.data?.message ?? 'Could not issue refund.')
    } finally {
      setRefundingId(null)
    }
  }

  const currentTab = TABS.find((t) => t.key === activeTab)

  return (
    <div>
      <div className="mb-5 flex gap-1 overflow-x-auto border-b border-neutral-200">
          {TABS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`shrink-0 border-b-2 px-3 py-2.5 text-sm font-medium ${
              activeTab === key ? 'border-brand-500 text-brand-600' : 'border-transparent text-neutral-500'
            }`}
          >
            <span>{label}</span>
            <span className={`ml-1.5 rounded-full px-1.5 py-0.5 text-xs ${activeTab === key ? 'bg-brand-100 text-brand-700' : 'bg-neutral-100 text-neutral-500'}`}>
              {statusCounts[key] ?? 0}
            </span>
          </button>
        ))}
      </div>

      <div className="mb-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
        <input value={filters.search} onChange={(e) => setFilters((current) => ({ ...current, search: e.target.value }))} placeholder="Order number" className="h-9 rounded-md border border-neutral-200 px-3 text-sm" />
        <input value={filters.customer} onChange={(e) => setFilters((current) => ({ ...current, customer: e.target.value }))} placeholder="Customer name" className="h-9 rounded-md border border-neutral-200 px-3 text-sm" />
        <select value={filters.payment_method} onChange={(e) => setFilters((current) => ({ ...current, payment_method: e.target.value }))} className="h-9 rounded-md border border-neutral-200 px-3 text-sm">
          <option value="">All payments</option><option value="cod">Cash on delivery</option><option value="razorpay">Online payment</option>
        </select>
        <input type="date" aria-label="Orders from date" value={filters.date_from} onChange={(e) => setFilters((current) => ({ ...current, date_from: e.target.value }))} className="h-9 rounded-md border border-neutral-200 px-3 text-sm" />
        <input type="date" aria-label="Orders to date" value={filters.date_to} onChange={(e) => setFilters((current) => ({ ...current, date_to: e.target.value }))} className="h-9 rounded-md border border-neutral-200 px-3 text-sm" />
      </div>

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <SkeletonListRow key={i} />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <EmptyState icon={Clock} title="No orders here" description={`No ${currentTab.label.toLowerCase()} orders right now.`} />
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <div key={order.id} className="rounded-lg border border-neutral-100 bg-white p-4">
              <div className="flex items-start justify-between">
                <button onClick={() => setSelectedOrder(order)} className="text-left">
                  <p className="text-sm font-semibold text-neutral-900">{order.order_number}</p>
                  <p className="text-xs text-neutral-500">{order.user?.name}</p>
                  <p className="mt-1 flex items-center gap-1 text-xs text-neutral-400">
                    <Clock size={11} /> {timeElapsed(order.created_at)}
                  </p>
                </button>
                <div className="text-right">
                  <Badge status={order.status} />
                  <p className="mt-1.5 text-sm font-bold text-neutral-900">₹{Number(order.total_amount).toFixed(2)}</p>
                </div>
              </div>
              <p className="mt-2 text-xs text-neutral-500">
                {order.items?.map((i) => `${i.quantity}× ${i.menu_item_name}`).join(', ')}
              </p>
              {currentTab?.next && (
                <div className="mt-3 flex gap-2">
                  <Button
                    size="sm"
                    loading={advancingId === order.id}
                    onClick={() => advance(order, currentTab.next)}
                  >
                    {currentTab.nextLabel}
                  </Button>
                  {currentTab.key === 'pending' && (
                    <Button size="sm" variant="danger" loading={advancingId === order.id} onClick={() => reject(order)}>
                      Reject
                    </Button>
                  )}
                </div>
              )}
              {currentTab?.key === 'cancelled' && order.payment_method === 'razorpay' && order.payment_status === 'paid' && (
                <Button size="sm" variant="danger" className="mt-3" loading={refundingId === order.id} onClick={() => refund(order)}>
                  Refund ₹{Number(order.total_amount).toFixed(2)}
                </Button>
              )}
            </div>
          ))}
        </div>
      )}

      <Pagination meta={meta} onPageChange={load} />

      <Modal open={!!selectedOrder} onClose={() => setSelectedOrder(null)} title={selectedOrder?.order_number}>
        {selectedOrder && (
          <div className="space-y-3 text-sm">
            <div>
              <p className="font-semibold text-neutral-900">Items</p>
              {selectedOrder.items?.map((item) => (
                <div key={item.id} className="flex justify-between text-neutral-600">
                  <span>
                    {item.quantity}× {item.menu_item_name}
                    {item.variant_name && ` (${item.variant_name})`}
                  </span>
                  <span>₹{Number(item.total_price).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className="space-y-1.5 border-t border-neutral-100 pt-3 text-neutral-600">
              <div className="flex justify-between">
                <span>Food subtotal</span>
                <span>₹{Number(selectedOrder.subtotal).toFixed(2)}</span>
              </div>
              {Number(selectedOrder.discount_amount) > 0 && (
                <div className="flex justify-between text-accent-600">
                  <span>Coupon discount{selectedOrder.coupon_code ? ` (${selectedOrder.coupon_code})` : ''}</span>
                  <span>-₹{Number(selectedOrder.discount_amount).toFixed(2)}</span>
                </div>
              )}
              {Number(selectedOrder.loyalty_discount_amount) > 0 && (
                <div className="flex justify-between text-accent-600">
                  <span>Loyalty discount ({selectedOrder.loyalty_points_redeemed} pts)</span>
                  <span>-₹{Number(selectedOrder.loyalty_discount_amount).toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Delivery fee</span>
                <span>₹{Number(selectedOrder.delivery_fee).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax</span>
                <span>₹{Number(selectedOrder.tax_amount).toFixed(2)}</span>
              </div>
              <div className="flex justify-between border-t border-neutral-200 pt-2 text-base font-bold text-neutral-900">
                <span>Customer total</span>
                <span>₹{Number(selectedOrder.total_amount).toFixed(2)}</span>
              </div>
            </div>
            <div className="border-t border-neutral-100 pt-2">
              <p className="font-semibold text-neutral-900">Payment</p>
              <p className="text-neutral-600 capitalize">{selectedOrder.payment_method} — {selectedOrder.payment_status}</p>
            </div>
            {selectedOrder.special_instructions && (
              <div className="border-t border-neutral-100 pt-2">
                <p className="font-semibold text-neutral-900">Notes</p>
                <p className="text-neutral-600">{selectedOrder.special_instructions}</p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}
