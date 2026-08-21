import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { UtensilsCrossed, Star } from 'lucide-react'
import { adminService } from '../../services/adminService'
import { Button } from '../../components/Button'
import { Modal } from '../../components/Modal'
import { Pagination } from '../../components/Pagination'
import { EmptyState } from '../../components/EmptyState'
import { SkeletonListRow } from '../../components/Skeleton'

const TABS = [
  { key: 'pending', label: 'Pending Approval' },
  { key: 'approved', label: 'Approved' },
  { key: 'suspended', label: 'Suspended' },
]

export default function AdminRestaurants() {
  const [tab, setTab] = useState('pending')
  const [restaurants, setRestaurants] = useState([])
  const [meta, setMeta] = useState({ page: 1, last_page: 1 })
  const [loading, setLoading] = useState(true)
  const [rejectTarget, setRejectTarget] = useState(null)
  const [rejectReason, setRejectReason] = useState('')

  const load = (page = 1) => {
    setLoading(true)
    adminService
      .restaurants({ status: tab, page })
      .then(({ data }) => {
        setRestaurants(data.data)
        setMeta(data.meta)
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => load(1), [tab])

  const approve = async (id) => {
    try {
      await adminService.approveRestaurant(id)
      toast.success('Restaurant approved.')
      load()
    } catch {
      toast.error('Could not approve restaurant.')
    }
  }

  const submitReject = async () => {
    if (!rejectReason.trim()) return
    try {
      await adminService.rejectRestaurant(rejectTarget.id, rejectReason)
      toast.success('Restaurant rejected.')
      setRejectTarget(null)
      setRejectReason('')
      load()
    } catch {
      toast.error('Could not reject restaurant.')
    }
  }

  const suspend = async (id) => {
    if (!window.confirm('Suspend this restaurant?')) return
    await adminService.suspendRestaurant(id)
    load()
  }

  const toggleFeatured = async (id) => {
    await adminService.toggleFeatured(id)
    load()
  }

  return (
    <div>
      <h1 className="mb-4 text-lg font-bold text-neutral-900">Restaurants</h1>

      <div className="mb-4 flex gap-1 border-b border-neutral-200">
        {TABS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`border-b-2 px-3 py-2.5 text-sm font-medium ${tab === key ? 'border-brand-500 text-brand-600' : 'border-transparent text-neutral-500'}`}
          >
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <SkeletonListRow key={i} />
          ))}
        </div>
      ) : restaurants.length === 0 ? (
        <EmptyState icon={UtensilsCrossed} title="No restaurants here" />
      ) : (
        <div className="space-y-3">
          {restaurants.map((r) => (
            <div key={r.id} className="rounded-lg border border-neutral-100 bg-white p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-semibold text-neutral-900">{r.name}</p>
                  <p className="text-xs text-neutral-500">{r.user?.name} — {r.user?.email}</p>
                  <p className="text-xs text-neutral-400">{r.address}, {r.city}</p>
                </div>
                {tab === 'approved' && (
                  <button
                    onClick={() => toggleFeatured(r.id)}
                    className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${
                      r.is_featured ? 'bg-warning-500/15 text-warning-600' : 'bg-neutral-100 text-neutral-500'
                    }`}
                  >
                    <Star size={11} fill={r.is_featured ? 'currentColor' : 'none'} /> Featured
                  </button>
                )}
              </div>

              {tab === 'pending' && (
                <div className="mt-3 flex gap-2">
                  <Button size="sm" onClick={() => approve(r.id)}>
                    Approve
                  </Button>
                  <Button size="sm" variant="danger" onClick={() => setRejectTarget(r)}>
                    Reject
                  </Button>
                </div>
              )}
              {tab === 'approved' && (
                <div className="mt-3">
                  <Button size="sm" variant="danger" onClick={() => suspend(r.id)}>
                    Suspend
                  </Button>
                </div>
              )}
              {tab === 'suspended' && (
                <div className="mt-3">
                  <Button size="sm" onClick={() => approve(r.id)}>
                    Reinstate
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <Pagination meta={meta} onPageChange={load} />

      <Modal open={!!rejectTarget} onClose={() => setRejectTarget(null)} title={`Reject ${rejectTarget?.name}`}>
        <textarea
          value={rejectReason}
          onChange={(e) => setRejectReason(e.target.value)}
          placeholder="Reason for rejection (required)"
          rows={4}
          className="w-full rounded-md border border-neutral-200 p-3 text-sm focus:border-brand-500 focus:outline-none"
        />
        <Button className="mt-3 w-full" variant="danger" onClick={submitReject}>
          Confirm Rejection
        </Button>
      </Modal>
    </div>
  )
}
