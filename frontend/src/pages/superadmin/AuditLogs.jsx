import { useEffect, useState } from 'react'
import { superadminService } from '../../services/superadminService'
import { SkeletonListRow } from '../../components/Skeleton'
import { EmptyState } from '../../components/EmptyState'
import { History } from 'lucide-react'
import { Pagination } from '../../components/Pagination'

export default function SuperadminAuditLogs() {
  const [logs, setLogs] = useState([])
  const [meta, setMeta] = useState({ page: 1, last_page: 1 })
  const [loading, setLoading] = useState(true)
  const [action, setAction] = useState('')
  const [search, setSearch] = useState('')
  const [target, setTarget] = useState('')

  const load = (page = 1) => {
    setLoading(true)
    superadminService
      .auditLogs({ page, action: action || undefined, search: search || undefined, target: target || undefined })
      .then(({ data }) => {
        setLogs(data.data)
        setMeta(data.meta)
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    const timer = setTimeout(() => load(1), 300)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [action, search, target])

  return (
    <div>
      <h1 className="mb-4 text-lg font-bold text-neutral-900">Audit Logs</h1>

      <div className="mb-4 flex flex-wrap gap-2">
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search action, actor, or target..." className="h-9 min-w-52 flex-1 rounded-md border border-neutral-200 px-3 text-sm" />
        <input value={action} onChange={(e) => setAction(e.target.value)} placeholder="Filter by action..." className="h-9 rounded-md border border-neutral-200 px-3 text-sm" />
        <input value={target} onChange={(e) => setTarget(e.target.value)} placeholder="Target type or ID..." className="h-9 rounded-md border border-neutral-200 px-3 text-sm" />
      </div>

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <SkeletonListRow key={i} />
          ))}
        </div>
      ) : logs.length === 0 ? (
        <EmptyState icon={History} title="No audit logs found" />
      ) : (
        <div className="overflow-x-auto rounded-lg border border-neutral-100 bg-white">
          <table className="w-full text-sm">
            <thead className="border-b border-neutral-100 text-left text-xs text-neutral-500">
              <tr>
                <th className="px-4 py-2.5">Time</th>
                <th className="px-4 py-2.5">Actor</th>
                <th className="px-4 py-2.5">Action</th>
                <th className="px-4 py-2.5">Target</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} className="border-b border-neutral-50 last:border-0">
                  <td className="px-4 py-3 text-xs text-neutral-500">{new Date(log.created_at).toLocaleString()}</td>
                  <td className="px-4 py-3 text-neutral-900">{log.user?.name} <span className="text-xs text-neutral-400">({log.user_role})</span></td>
                  <td className="px-4 py-3 font-mono text-xs text-neutral-600">{log.action}</td>
                  <td className="px-4 py-3 text-xs text-neutral-500">{log.target_type?.split('\\').pop()} #{log.target_id}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Pagination meta={meta} onPageChange={load} />
    </div>
  )
}
