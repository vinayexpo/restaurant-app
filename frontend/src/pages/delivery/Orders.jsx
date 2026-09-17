import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { Bike, MapPin } from 'lucide-react'
import { deliveryService } from '../../services/deliveryService'
import { Button } from '../../components/Button'
import { EmptyState } from '../../components/EmptyState'
import { SkeletonListRow } from '../../components/Skeleton'
import { Pagination } from '../../components/Pagination'

export default function DeliveryOrders() {
  const navigate = useNavigate()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [acceptingId, setAcceptingId] = useState(null)
  const [meta, setMeta] = useState(null)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  const load = (requestedPage = page) => {
    deliveryService
      .availableOrders({ page: requestedPage, search })
      .then(({ data }) => {
        setOrders(data.data)
        setMeta(data.meta)
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load(page)
    const interval = setInterval(load, 30000)
    return () => clearInterval(interval)
  }, [page, search])

  const updateSearch = (value) => {
    setPage(1)
    setSearch(value)
  }

  const accept = async (id) => {
    setAcceptingId(id)
    try {
      await deliveryService.acceptOrder(id)
      toast.success('Order accepted!')
      navigate(`/delivery/orders/${id}`)
    } catch (error) {
      toast.error(error.response?.data?.message ?? 'Order no longer available.')
      load()
    } finally {
      setAcceptingId(null)
    }
  }

  return (
    <div className="p-4">
      <h1 className="mb-4 text-lg font-bold text-neutral-900">Available Orders</h1>
      <input value={search} onChange={(e) => updateSearch(e.target.value)} placeholder="Search order, restaurant, or city" className="mb-4 h-9 w-full rounded-md border border-neutral-200 px-3 text-sm" />

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <SkeletonListRow key={i} />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <EmptyState icon={Bike} title="No orders nearby" description="Available orders will appear here. Checking every 30s." />
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <div key={order.id} className="rounded-lg border border-neutral-100 bg-white p-4">
              <p className="text-sm font-semibold text-neutral-900">{order.restaurant?.name}</p>
              <p className="flex items-center gap-1 text-xs text-neutral-500">
                <MapPin size={12} /> {order.restaurant?.address}, {order.restaurant?.city}
              </p>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-sm font-bold text-accent-600">₹{Number(order.delivery_fee).toFixed(0)} payout</span>
                <Button size="sm" loading={acceptingId === order.id} onClick={() => accept(order.id)}>
                  Accept
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
      <Pagination meta={meta} onPageChange={setPage} />
    </div>
  )
}
