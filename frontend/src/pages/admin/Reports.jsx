import { useEffect, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts'
import { Download } from 'lucide-react'
import { adminService } from '../../services/adminService'
import { Button } from '../../components/Button'
import { Input } from '../../components/Input'
import { SkeletonStat } from '../../components/Skeleton'

export default function AdminReports() {
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  const load = () => {
    setLoading(true)
    adminService
      .revenueReport({ date_from: dateFrom || undefined, date_to: dateTo || undefined })
      .then(({ data }) => setData(data.data))
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  const exportCsv = () => {
    if (!data) return
    const rows = [['Date', 'Gross Order Volume', 'Total Amount', 'Order Count'], ...data.breakdown.map((b) => [b.date, b.gross_order_volume, b.total_amount, b.order_count])]
    const csv = rows.map((r) => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'revenue-report.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-end gap-3">
        <h1 className="mr-auto text-lg font-bold text-neutral-900">Revenue Reports</h1>
        <Input label="From" type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} containerClassName="w-40" />
        <Input label="To" type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} containerClassName="w-40" />
        <Button size="sm" variant="secondary" onClick={load}>
          Apply
        </Button>
        <Button size="sm" variant="secondary" onClick={exportCsv}>
          <Download size={14} /> Export CSV
        </Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <SkeletonStat key={i} />
          ))}
        </div>
      ) : (
        <>
          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <StatCard label="Gross Order Volume" value={`₹${Number(data.totals.gross_order_volume ?? 0).toFixed(0)}`} />
            <StatCard label="Total Amount Collected" value={`₹${Number(data.totals.total_amount ?? 0).toFixed(0)}`} />
            <StatCard label="Delivery Revenue" value={`₹${Number(data.totals.delivery_revenue ?? 0).toFixed(0)}`} />
          </div>

          <div className="rounded-lg border border-neutral-100 bg-white p-4">
            <h3 className="mb-4 text-sm font-bold text-neutral-900">Revenue by Day</h3>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={data.breakdown}>
                <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="total_amount" fill="#F97316" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </div>
  )
}

function StatCard({ label, value }) {
  return (
    <div className="rounded-lg border border-neutral-100 bg-white p-4">
      <p className="text-xs font-medium text-neutral-400">{label}</p>
      <p className="mt-1 text-xl font-bold text-neutral-900">{value}</p>
    </div>
  )
}
