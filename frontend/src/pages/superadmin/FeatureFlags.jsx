import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { superadminService } from '../../services/superadminService'
import { SkeletonListRow } from '../../components/Skeleton'

const LABELS = {
  loyalty_enabled: 'Loyalty Points System',
  reviews_enabled: 'Customer Reviews',
  coupons_enabled: 'Coupon Redemption',
  delivery_partner_enabled: 'Delivery Partner Role',
  registration_enabled: 'New Customer Registrations',
  restaurant_registration_enabled: 'New Restaurant Applications',
  maintenance_mode: 'Maintenance Mode',
}

export default function SuperadminFeatureFlags() {
  const [flags, setFlags] = useState(null)
  const [updating, setUpdating] = useState(null)

  useEffect(() => {
    superadminService.featureFlags().then(({ data }) => setFlags(data.data))
  }, [])

  const toggle = async (key) => {
    setUpdating(key)
    const newValue = !flags[key]
    try {
      await superadminService.updateFeatureFlag(key, newValue)
      setFlags((prev) => ({ ...prev, [key]: newValue }))
      toast.success(`${LABELS[key]} ${newValue ? 'enabled' : 'disabled'}.`)
    } catch {
      toast.error('Could not update flag.')
    } finally {
      setUpdating(null)
    }
  }

  if (!flags) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <SkeletonListRow key={i} />
        ))}
      </div>
    )
  }

  return (
    <div>
      <h1 className="mb-4 text-lg font-bold text-neutral-900">Feature Flags</h1>
      <div className="space-y-2">
        {Object.keys(LABELS).map((key) => (
          <div key={key} className="flex items-center justify-between rounded-lg border border-neutral-100 bg-white p-4">
            <div>
              <p className="text-sm font-medium text-neutral-900">{LABELS[key]}</p>
              <p className="font-mono text-xs text-neutral-400">{key}</p>
            </div>
            <button
              onClick={() => toggle(key)}
              disabled={updating === key}
              className={`relative h-6 w-11 rounded-full transition ${flags[key] ? 'bg-brand-500' : 'bg-neutral-200'}`}
            >
              <span className={`absolute top-0.5 size-5 rounded-full bg-white shadow transition ${flags[key] ? 'left-5' : 'left-0.5'}`} />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
