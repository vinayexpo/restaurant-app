import { useEffect, useState } from 'react'
import { deliveryService } from '../../services/deliveryService'
import { Pagination } from '../../components/Pagination'
import { SkeletonListRow, SkeletonStat } from '../../components/Skeleton'
import { EmptyState } from '../../components/EmptyState'
import { Wallet } from 'lucide-react'

export default function DeliveryEarnings() {
  const [summary, setSummary] = useState(null)
  const [earnings, setEarnings] = useState([])
  const [meta, setMeta] = useState(null)
  const [loading, setLoading] = useState(true)

  const loadEarnings = (page = 1) => {
    deliveryService.earnings({ page }).then(({ data }) => {
      setEarnings(data.data)
      setMeta(data.meta)
    })
  }

  useEffect(() => {
    Promise.all([deliveryService.earningsSummary(), deliveryService.earnings()])
      .then(([summaryRes, earningsRes]) => {
        setSummary(summaryRes.data.data)
        setEarnings(earningsRes.data.data)
        setMeta(earningsRes.data.meta)
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="space-y-3 p-4">
        <div className="grid grid-cols-3 gap-3">
          <SkeletonStat />
          <SkeletonStat />
          <SkeletonStat />
        </div>
        <SkeletonListRow />
      </div>
    )
  }

  return (
    <div className="p-4">
      <h1 className="mb-4 text-lg font-bold text-neutral-900">Earnings</h1>

      <div className="mb-6 grid grid-cols-3 gap-3">
        <SummaryCard label="Today" value={summary.today} />
        <SummaryCard label="This Week" value={summary.week} />
        <SummaryCard label="This Month" value={summary.month} />
      </div>

      {meta && (
        <div className="mb-4 flex justify-between rounded-lg bg-brand-50 px-4 py-3 text-sm">
          <span className="text-brand-700">Total Earned</span>
          <span className="font-bold text-brand-700">₹{meta.total_earned?.toFixed(0)}</span>
        </div>
      )}

      <h2 className="mb-2 text-sm font-bold text-neutral-900">Per-Order History</h2>
      {earnings.length === 0 ? (
        <EmptyState icon={Wallet} title="No earnings yet" description="Complete deliveries to start earning." />
      ) : (
        <div className="divide-y divide-neutral-100 rounded-lg border border-neutral-100 bg-white">
          {earnings.map((e) => (
            <div key={e.id} className="flex items-center justify-between px-4 py-3">
              <div>
                <p className="text-sm font-medium text-neutral-900">{e.order?.order_number}</p>
                <p className="text-xs text-neutral-400">{new Date(e.created_at).toLocaleDateString()}</p>
              </div>
              <p className="text-sm font-bold text-accent-600">₹{Number(e.amount_earned).toFixed(0)}</p>
            </div>
          ))}
        </div>
      )}

      <Pagination meta={meta} onPageChange={loadEarnings} />
    </div>
  )
}

function SummaryCard({ label, value }) {
  return (
    <div className="rounded-lg border border-neutral-100 bg-white p-3 text-center">
      <p className="text-xs text-neutral-400">{label}</p>
      <p className="mt-1 text-lg font-bold text-neutral-900">₹{value?.toFixed(0) ?? 0}</p>
    </div>
  )
}
