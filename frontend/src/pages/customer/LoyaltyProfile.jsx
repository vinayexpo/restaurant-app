import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Gem, Trophy } from 'lucide-react'
import { loyaltyService } from '../../services/loyaltyService'
import { SkeletonListRow, SkeletonStat } from '../../components/Skeleton'
import { pageTransitionVariants } from '../../lib/motion'

export default function LoyaltyProfile() {
  const [summary, setSummary] = useState(null)
  const [transactions, setTransactions] = useState([])
  const [pagination, setPagination] = useState({ page: 1, last_page: 1 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([loyaltyService.summary(), loyaltyService.transactions({ page: 1 })])
      .then(([summaryRes, txRes]) => {
        setSummary(summaryRes.data.data)
        setTransactions(txRes.data.data)
        setPagination(txRes.data.meta)
      })
      .finally(() => setLoading(false))
  }, [])

  const loadPage = (page) => {
    loyaltyService.transactions({ page }).then(({ data }) => {
      setTransactions(data.data)
      setPagination(data.meta)
    })
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-lg space-y-3 px-4 py-6">
        <SkeletonStat />
        <SkeletonListRow />
        <SkeletonListRow />
      </div>
    )
  }

  const tier = summary?.tier
  const nextTier = summary?.next_tier
  const progressPct = nextTier
    ? Math.min(100, (summary.lifetime_earned / nextTier.min_lifetime_points) * 100)
    : 100

  return (
    <motion.div {...pageTransitionVariants} className="mx-auto max-w-lg px-4 py-6">
      <div
        className="rounded-xl p-6 text-white"
        style={{ background: `linear-gradient(135deg, ${tier?.badge_color ?? '#F97316'}, #7C2D12)` }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy size={22} />
            <span className="text-lg font-bold">{tier?.name} Tier</span>
          </div>
          <Gem size={22} />
        </div>
        <p className="mt-4 text-4xl font-extrabold">{summary?.balance}</p>
        <p className="text-sm text-white/80">points available</p>

        {nextTier && (
          <div className="mt-4">
            <div className="mb-1 flex justify-between text-xs text-white/80">
              <span>{summary.lifetime_earned} pts</span>
              <span>{nextTier.name} at {nextTier.min_lifetime_points} pts</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-white/20">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progressPct}%` }}
                transition={{ duration: 0.6 }}
                className="h-full rounded-full bg-white"
              />
            </div>
            <p className="mt-1 text-xs text-white/80">{summary.points_to_next_tier} points to {nextTier.name}</p>
          </div>
        )}
      </div>

      {summary?.next_expiry && (
        <p className="mt-3 text-center text-xs text-neutral-500">
          {summary.balance} points expire on {new Date(summary.next_expiry).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
        </p>
      )}

      <h2 className="mb-3 mt-6 text-sm font-bold text-neutral-900">Transaction History</h2>
      {transactions.length === 0 ? (
        <p className="text-sm text-neutral-500">No transactions yet.</p>
      ) : (
        <div className="divide-y divide-neutral-100 rounded-lg border border-neutral-100 bg-white">
          {transactions.map((tx) => (
            <div key={tx.id} className="flex items-center justify-between px-4 py-3">
              <div>
                <p className="text-sm text-neutral-900">{tx.description}</p>
                <p className="text-xs text-neutral-400">{new Date(tx.created_at).toLocaleDateString()}</p>
              </div>
              <div className="text-right">
                <p className={`text-sm font-semibold ${tx.points > 0 ? 'text-accent-600' : 'text-danger-500'}`}>
                  {tx.points > 0 ? '+' : ''}
                  {tx.points}
                </p>
                <p className="text-xs text-neutral-400">Bal: {tx.balance_after}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {pagination.last_page > 1 && (
        <div className="mt-4 flex justify-center gap-2">
          <button
            disabled={pagination.page <= 1}
            onClick={() => loadPage(pagination.page - 1)}
            className="rounded-md border border-neutral-200 px-3 py-1.5 text-sm disabled:opacity-40"
          >
            Previous
          </button>
          <span className="flex items-center px-2 text-sm text-neutral-500">
            {pagination.page} / {pagination.last_page}
          </span>
          <button
            disabled={pagination.page >= pagination.last_page}
            onClick={() => loadPage(pagination.page + 1)}
            className="rounded-md border border-neutral-200 px-3 py-1.5 text-sm disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}
    </motion.div>
  )
}
