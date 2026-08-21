import { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { motion } from 'framer-motion'
import { Bell, Check } from 'lucide-react'
import api from '../../lib/axios'
import { Pagination } from '../../components/Pagination'
import { EmptyState } from '../../components/EmptyState'
import { SkeletonListRow } from '../../components/Skeleton'
import { clearUnread } from '../../features/customer/notificationsSlice'
import { pageTransitionVariants } from '../../lib/motion'

export default function Notifications() {
  const dispatch = useDispatch()
  const [notifications, setNotifications] = useState([])
  const [meta, setMeta] = useState({ page: 1, last_page: 1 })
  const [loading, setLoading] = useState(true)

  const load = (page = 1) =>
    api.get('/notifications', { params: { page } }).then(({ data }) => {
      setNotifications(data.data)
      setMeta(data.meta)
    })

  useEffect(() => {
    load().finally(() => setLoading(false))
    dispatch(clearUnread())
  }, [dispatch])

  const markRead = async (id) => {
    await api.patch(`/notifications/${id}/read`)
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read_at: new Date().toISOString() } : n)))
  }

  const markAllRead = async () => {
    await api.patch('/notifications/read-all')
    setNotifications((prev) => prev.map((n) => ({ ...n, read_at: new Date().toISOString() })))
  }

  return (
    <motion.div {...pageTransitionVariants} className="mx-auto max-w-lg px-4 py-6">
      <div className="mb-5 flex items-center justify-between">
        <h1 className="text-lg font-bold text-neutral-900">Notifications</h1>
        {notifications.length > 0 && (
          <button onClick={markAllRead} className="flex items-center gap-1 text-xs font-semibold text-brand-600">
            <Check size={13} /> Mark all as read
          </button>
        )}
      </div>

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <SkeletonListRow key={i} />
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <EmptyState icon={Bell} title="No notifications" description="You're all caught up." />
      ) : (
        <>
          <div className="space-y-2">
            {notifications.map((n) => (
              <button
                key={n.id}
                onClick={() => !n.read_at && markRead(n.id)}
                className={`w-full rounded-lg border p-3.5 text-left ${n.read_at ? 'border-neutral-100 bg-white' : 'border-brand-200 bg-brand-50/50'}`}
              >
                <p className="text-sm font-semibold text-neutral-900">{n.title}</p>
                <p className="text-xs text-neutral-500">{n.body}</p>
              </button>
            ))}
          </div>
          <Pagination meta={meta} onPageChange={load} />
        </>
      )}
    </motion.div>
  )
}
