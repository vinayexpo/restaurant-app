import { useCallback, useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { motion } from 'framer-motion'
import { Bell, BellOff, Check } from 'lucide-react'
import toast from 'react-hot-toast'
import { Pagination } from '../../components/Pagination'
import { EmptyState } from '../../components/EmptyState'
import { SkeletonListRow } from '../../components/Skeleton'
import { clearUnread } from '../../features/customer/notificationsSlice'
import { pushService } from '../../services/pushService'
import { usePushNotifications } from '../../hooks/usePushNotifications'
import { Button } from '../../components/Button'
import { pageTransitionVariants } from '../../lib/motion'

function PushNotificationControl() {
  const { loading, enable, disable, isSupported, subscribed } = usePushNotifications()
  const [error, setError] = useState('')

  const toggle = async () => {
    setError('')
    try {
      if (subscribed) {
        await disable()
        toast.success('Push notifications disabled.')
      } else {
        const enabled = await enable()
        if (enabled) toast.success('Push notifications enabled.')
        else setError('Browser permission is required to receive push notifications.')
      }
    } catch (pushError) {
      setError(pushError.message ?? 'Could not update push notification settings.')
    }
  }

  return (
    <>
      <div className="mb-4 flex items-center justify-between rounded-lg border border-neutral-100 bg-white p-3.5">
        <div className="flex items-center gap-2">
          {subscribed ? <Bell size={16} className="text-brand-500" /> : <BellOff size={16} className="text-neutral-400" />}
          <div>
            <p className="text-sm font-semibold text-neutral-900">Push notifications</p>
            <p className="text-xs text-neutral-500">
              {!isSupported ? 'Not supported in this browser.' : subscribed ? 'Enabled on this device.' : 'Receive new order alerts even when the app is closed.'}
            </p>
          </div>
        </div>
        {isSupported && <Button size="sm" variant="secondary" loading={loading} onClick={toggle}>{subscribed ? 'Disable' : 'Enable'}</Button>}
      </div>
      {error && <p className="-mt-2 mb-3 text-xs text-danger-600">{error}</p>}
    </>
  )
}

export function NotificationsPanel({ title = 'Notifications', showPushControl = false }) {
  const dispatch = useDispatch()
  const [notifications, setNotifications] = useState([])
  const [meta, setMeta] = useState({ page: 1, last_page: 1 })
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({ read_status: '', date_from: '', date_to: '' })

  const load = useCallback((page = 1) =>
    pushService.list({ page, ...filters }).then(({ data }) => {
      setNotifications(data.data)
      setMeta(data.meta)
    }), [filters])

  useEffect(() => {
    load(1)
      .catch(() => toast.error('Could not load notifications.'))
      .finally(() => setLoading(false))
    dispatch(clearUnread())
  }, [dispatch, load])

  const markRead = async (id) => {
    await pushService.markRead(id)
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read_at: new Date().toISOString() } : n)))
  }

  const markAllRead = async () => {
    await pushService.markAllRead()
    setNotifications((prev) => prev.map((n) => ({ ...n, read_at: new Date().toISOString() })))
  }

  return (
    <motion.div {...pageTransitionVariants} className="mx-auto max-w-lg px-4 py-6">
      <div className="mb-5 flex items-center justify-between">
        <h1 className="text-lg font-bold text-neutral-900">{title}</h1>
        {notifications.length > 0 && (
          <button onClick={markAllRead} className="flex items-center gap-1 text-xs font-semibold text-brand-600">
            <Check size={13} /> Mark all as read
          </button>
        )}
      </div>

      {showPushControl && <PushNotificationControl />}

      <div className="mb-4 grid gap-2 sm:grid-cols-3">
        <select value={filters.read_status} onChange={(e) => setFilters((current) => ({ ...current, read_status: e.target.value }))} className="h-10 rounded-md border border-neutral-200 bg-white px-3 text-sm text-neutral-700">
          <option value="">All notifications</option>
          <option value="unread">Unread</option>
          <option value="read">Read</option>
        </select>
        <input type="date" aria-label="Notifications from date" value={filters.date_from} onChange={(e) => setFilters((current) => ({ ...current, date_from: e.target.value }))} className="h-10 rounded-md border border-neutral-200 bg-white px-3 text-sm text-neutral-700" />
        <input type="date" aria-label="Notifications to date" value={filters.date_to} onChange={(e) => setFilters((current) => ({ ...current, date_to: e.target.value }))} className="h-10 rounded-md border border-neutral-200 bg-white px-3 text-sm text-neutral-700" />
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

export default function Notifications() {
  return <NotificationsPanel />
}
