import { useEffect, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts'
import { ownerService } from '../../services/ownerService'
import { SkeletonStat } from '../../components/Skeleton'

const PERIODS = [
  { key: 'daily', label: 'Daily' },
  { key: 'weekly', label: 'Weekly' },
  { key: 'monthly', label: 'Monthly' },
]

export default function OwnerRevenue() {
  const [period, setPeriod] = useState('daily')
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    ownerService
      .revenue({ period })
      .then(({ data }) => setData(data.data))
      .finally(() => setLoading(false))
  }, [period])

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-lg font-bold text-neutral-900">Revenue</h1>
        <div className="flex gap-1 rounded-md border border-neutral-200 p-1">
          {PERIODS.map((p) => (
            <button
              key={p.key}
              onClick={() => setPeriod(p.key)}
              className={`rounded px-3 py-1.5 text-xs font-medium ${
                period === p.key ? 'bg-brand-500 text-white' : 'text-neutral-600'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonStat key={i} />
          ))}
        </div>
      ) : (
        <>
          <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatCard label="Total Revenue" value={`₹${data.total_revenue.toFixed(0)}`} />
            <StatCard label="Commission Rate" value={`${data.commission_pct}%`} />
            <StatCard label="Commission Deducted" value={`₹${data.commission_deducted.toFixed(0)}`} />
            <StatCard label="Net Revenue" value={`₹${data.net_revenue.toFixed(0)}`} highlight />
          </div>

          <div className="mb-6 rounded-lg border border-neutral-100 bg-white p-4">
            <h3 className="mb-4 text-sm font-bold text-neutral-900">Revenue Breakdown</h3>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={data.breakdown}>
                <XAxis dataKey="period" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="revenue" fill="#F97316" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="rounded-lg border border-neutral-100 bg-white p-4">
            <h3 className="mb-3 text-sm font-bold text-neutral-900">Top Selling Items</h3>
            {data.top_items.length === 0 ? (
              <p className="text-sm text-neutral-500">No sales data yet.</p>
            ) : (
              <table className="w-full text-sm">
                <thead className="text-left text-xs text-neutral-500">
                  <tr>
                    <th className="pb-2">Item</th>
                    <th className="pb-2">Qty Sold</th>
                    <th className="pb-2">Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {data.top_items.map((item, i) => (
                    <tr key={i} className="border-t border-neutral-50">
                      <td className="py-2 text-neutral-900">{item.menu_item_name}</td>
                      <td className="py-2 text-neutral-600">{item.total_quantity}</td>
                      <td className="py-2 text-neutral-600">₹{Number(item.total_revenue).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}
    </div>
  )
}

function StatCard({ label, value, highlight }) {
  return (
    <div className={`rounded-lg border p-4 ${highlight ? 'border-accent-200 bg-accent-500/5' : 'border-neutral-100 bg-white'}`}>
      <p className="text-xs font-medium text-neutral-400">{label}</p>
      <p className={`mt-1 text-xl font-bold ${highlight ? 'text-accent-600' : 'text-neutral-900'}`}>{value}</p>
    </div>
  )
}
