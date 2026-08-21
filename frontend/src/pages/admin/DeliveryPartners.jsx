import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { Star, Bike } from 'lucide-react'
import { adminService } from '../../services/adminService'
import { Button } from '../../components/Button'
import { Pagination } from '../../components/Pagination'
import { EmptyState } from '../../components/EmptyState'
import { SkeletonListRow } from '../../components/Skeleton'

export default function AdminDeliveryPartners() {
  const [partners, setPartners] = useState([])
  const [meta, setMeta] = useState({ page: 1, last_page: 1 })
  const [loading, setLoading] = useState(true)

  const load = (page = 1) =>
    adminService
      .deliveryPartners({ page })
      .then(({ data }) => {
        setPartners(data.data)
        setMeta(data.meta)
      })
      .finally(() => setLoading(false))

  useEffect(() => {
    load()
  }, [])

  const verify = async (id) => {
    try {
      await adminService.verifyDeliveryPartner(id)
      toast.success('Partner verified.')
      load()
    } catch {
      toast.error('Could not verify partner.')
    }
  }

  const suspend = async (id) => {
    if (!window.confirm('Suspend this delivery partner?')) return
    await adminService.suspendDeliveryPartner(id)
    load()
  }

  if (loading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonListRow key={i} />
        ))}
      </div>
    )
  }

  return (
    <div>
      <h1 className="mb-4 text-lg font-bold text-neutral-900">Delivery Partners</h1>

      {partners.length === 0 ? (
        <EmptyState icon={Bike} title="No delivery partners yet" />
      ) : (
        <div className="overflow-x-auto rounded-lg border border-neutral-100 bg-white">
          <table className="w-full text-sm">
            <thead className="border-b border-neutral-100 text-left text-xs text-neutral-500">
              <tr>
                <th className="px-4 py-2.5">Name</th>
                <th className="px-4 py-2.5">Phone</th>
                <th className="px-4 py-2.5">Verified</th>
                <th className="px-4 py-2.5">Available</th>
                <th className="px-4 py-2.5">Deliveries</th>
                <th className="px-4 py-2.5">Rating</th>
                <th className="px-4 py-2.5"></th>
              </tr>
            </thead>
            <tbody>
              {partners.map((p) => (
                <tr key={p.id} className="border-b border-neutral-50 last:border-0">
                  <td className="px-4 py-3 font-medium text-neutral-900">{p.user?.name}</td>
                  <td className="px-4 py-3 text-neutral-600">{p.user?.phone}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${p.is_verified ? 'bg-accent-500/15 text-accent-600' : 'bg-neutral-200 text-neutral-600'}`}>
                      {p.is_verified ? 'Verified' : 'Pending'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-neutral-600">{p.is_available ? 'Yes' : 'No'}</td>
                  <td className="px-4 py-3 text-neutral-600">{p.total_deliveries}</td>
                  <td className="px-4 py-3">
                    <span className="flex items-center gap-1 text-neutral-600">
                      <Star size={12} fill="currentColor" className="text-warning-500" /> {Number(p.avg_rating).toFixed(1)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {p.is_verified ? (
                      <Button size="sm" variant="danger" onClick={() => suspend(p.id)}>
                        Suspend
                      </Button>
                    ) : (
                      <Button size="sm" onClick={() => verify(p.id)}>
                        Verify
                      </Button>
                    )}
                  </td>
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
