import { useEffect, useState } from 'react'
import { superadminService } from '../../services/superadminService'
import { Input } from '../../components/Input'
import { Button } from '../../components/Button'
import { SkeletonStat } from '../../components/Skeleton'

export default function SuperadminFinancials() {
  const [dateFrom, setDateFrom] = useState(new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10))
  const [dateTo, setDateTo] = useState(new Date().toISOString().slice(0, 10))
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  const load = () => {
    setLoading(true)
    superadminService
      .financials({ date_from: dateFrom, date_to: dateTo })
      .then(({ data }) => setData(data.data))
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-end gap-3">
        <h1 className="mr-auto text-lg font-bold text-neutral-900">Financials (P&amp;L)</h1>
        <Input label="From" type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} containerClassName="w-40" />
        <Input label="To" type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} containerClassName="w-40" />
        <Button size="sm" variant="secondary" onClick={load}>
          Apply
        </Button>
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
            <StatCard label="Gross Order Value" value={data.gross_order_value} />
            <StatCard label="Platform Commission" value={data.platform_commission} />
            <StatCard label="Delivery Revenue" value={data.delivery_revenue} />
            <StatCard label="Refunds Issued" value={data.refunds_issued} negative />
            <StatCard label="Net Platform Revenue" value={data.net_platform_revenue} highlight />
          </div>

          <div className="rounded-lg border border-neutral-100 bg-white p-4">
            <h3 className="mb-3 text-sm font-bold text-neutral-900">Breakdown by Restaurant</h3>
            {data.by_restaurant.length === 0 ? (
              <p className="text-sm text-neutral-500">No delivered orders in this period.</p>
            ) : (
              <table className="w-full text-sm">
                <thead className="text-left text-xs text-neutral-500">
                  <tr>
                    <th className="pb-2">Restaurant</th>
                    <th className="pb-2">GMV</th>
                    <th className="pb-2">Rate</th>
                    <th className="pb-2">Commission</th>
                  </tr>
                </thead>
                <tbody>
                  {data.by_restaurant.map((r, i) => (
                    <tr key={i} className="border-t border-neutral-50">
                      <td className="py-2 text-neutral-900">{r.restaurant_name}</td>
                      <td className="py-2 text-neutral-600">₹{r.gmv.toFixed(2)}</td>
                      <td className="py-2 text-neutral-600">{r.commission_rate}%</td>
                      <td className="py-2 text-neutral-600">₹{r.commission_earned.toFixed(2)}</td>
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

function StatCard({ label, value, highlight, negative }) {
  return (
    <div className={`rounded-lg border p-4 ${highlight ? 'border-purple-200 bg-purple-50' : 'border-neutral-100 bg-white'}`}>
      <p className="text-xs font-medium text-neutral-400">{label}</p>
      <p className={`mt-1 text-xl font-bold ${highlight ? 'text-purple-700' : negative ? 'text-danger-500' : 'text-neutral-900'}`}>
        ₹{Number(value).toFixed(0)}
      </p>
    </div>
  )
}
