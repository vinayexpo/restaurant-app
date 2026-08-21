import { useEffect, useState } from 'react'
import { adminService } from '../../services/adminService'
import { Badge } from '../../components/Badge'
import { Modal } from '../../components/Modal'
import { Pagination } from '../../components/Pagination'
import { SkeletonListRow } from '../../components/Skeleton'
import { EmptyState } from '../../components/EmptyState'
import { ClipboardList } from 'lucide-react'

export default function AdminOrders() {
  const [orders, setOrders] = useState([])
  const [meta, setMeta] = useState({ page: 1, last_page: 1 })
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('')
  const [selected, setSelected] = useState(null)

  const load = (page = 1) => {
    setLoading(true)
    adminService
      .orders({ page, status: status || undefined, payment_method: paymentMethod || undefined })
      .then(({ data }) => {
        setOrders(data.data)
        setMeta(data.meta)
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => load(1), [status, paymentMethod])

  return (
    <div>
      <h1 className="mb-4 text-lg font-bold text-neutral-900">All Orders</h1>

      <div className="mb-4 flex gap-2">
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="h-9 rounded-md border border-neutral-200 px-3 text-sm">
          <option value="">All Statuses</option>
          {['pending', 'confirmed', 'preparing', 'ready_for_pickup', 'picked_up', 'on_the_way', 'delivered', 'cancelled'].map((s) => (
            <option key={s} value={s}>
              {s.replace(/_/g, ' ')}
            </option>
          ))}
        </select>
        <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} className="h-9 rounded-md border border-neutral-200 px-3 text-sm">
          <option value="">All Payment Methods</option>
          <option value="cod">COD</option>
          <option value="razorpay">Razorpay</option>
        </select>
      </div>

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <SkeletonListRow key={i} />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <EmptyState icon={ClipboardList} title="No orders found" />
      ) : (
        <div className="overflow-x-auto rounded-lg border border-neutral-100 bg-white">
          <table className="w-full text-sm">
            <thead className="border-b border-neutral-100 text-left text-xs text-neutral-500">
              <tr>
                <th className="px-4 py-2.5">Order #</th>
                <th className="px-4 py-2.5">Restaurant</th>
                <th className="px-4 py-2.5">Customer</th>
                <th className="px-4 py-2.5">Status</th>
                <th className="px-4 py-2.5">Payment</th>
                <th className="px-4 py-2.5">Total</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id} onClick={() => setSelected(o)} className="cursor-pointer border-b border-neutral-50 last:border-0 hover:bg-neutral-50">
                  <td className="px-4 py-3 font-medium text-neutral-900">{o.order_number}</td>
                  <td className="px-4 py-3 text-neutral-600">{o.restaurant?.name}</td>
                  <td className="px-4 py-3 text-neutral-600">{o.user?.name}</td>
                  <td className="px-4 py-3">
                    <Badge status={o.status} />
                  </td>
                  <td className="px-4 py-3 capitalize text-neutral-600">{o.payment_method}</td>
                  <td className="px-4 py-3 font-semibold text-neutral-900">₹{Number(o.total_amount).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Pagination meta={meta} onPageChange={load} />

      <Modal open={!!selected} onClose={() => setSelected(null)} title={selected?.order_number}>
        {selected && (
          <div className="space-y-2 text-sm">
            <p><span className="text-neutral-500">Restaurant:</span> {selected.restaurant?.name}</p>
            <p><span className="text-neutral-500">Customer:</span> {selected.user?.name} ({selected.user?.email})</p>
            <p><span className="text-neutral-500">Status:</span> <Badge status={selected.status} /></p>
            <p><span className="text-neutral-500">Payment:</span> {selected.payment_method} — {selected.payment_status}</p>
            <p><span className="text-neutral-500">Total:</span> ₹{Number(selected.total_amount).toFixed(2)}</p>
          </div>
        )}
      </Modal>
    </div>
  )
}
