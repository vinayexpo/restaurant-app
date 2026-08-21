import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { AlertTriangle, Wallet, Package } from 'lucide-react'
import { deliveryService } from '../../services/deliveryService'
import { Button } from '../../components/Button'
import { SkeletonStat } from '../../components/Skeleton'

export default function DeliveryDashboard() {
  const navigate = useNavigate()
  const [profile, setProfile] = useState(null)
  const [summary, setSummary] = useState(null)
  const [activeOrder, setActiveOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [toggling, setToggling] = useState(false)

  const load = () => {
    Promise.all([deliveryService.profile(), deliveryService.earningsSummary(), deliveryService.availableOrders().catch(() => ({ data: { data: [] } }))])
      .then(([profileRes, summaryRes]) => {
        setProfile(profileRes.data.data)
        setSummary(summaryRes.data.data)
      })
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  const toggleAvailability = async () => {
    setToggling(true)
    try {
      const { data } = await deliveryService.toggleAvailability()
      setProfile(data.data)
    } catch (error) {
      toast.error(error.response?.data?.message ?? 'Could not update availability.')
    } finally {
      setToggling(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-4 p-4">
        <SkeletonStat />
        <SkeletonStat />
      </div>
    )
  }

  return (
    <div className="space-y-4 p-4">
      {!profile.is_verified && (
        <div className="flex items-center gap-2 rounded-lg border border-warning-300 bg-warning-500/10 p-4 text-sm text-warning-700">
          <AlertTriangle size={18} className="shrink-0" />
          Your account is pending verification by admin. You'll be able to accept orders once verified.
        </div>
      )}

      <div className="rounded-xl border border-neutral-100 bg-white p-5 text-center">
        <p className="mb-3 text-sm font-medium text-neutral-500">You are currently</p>
        <button
          onClick={toggleAvailability}
          disabled={!profile.is_verified || toggling}
          className={`mx-auto flex h-16 w-40 items-center justify-center rounded-full text-base font-bold transition disabled:opacity-40 ${
            profile.is_available ? 'bg-accent-500 text-white' : 'bg-neutral-200 text-neutral-600'
          }`}
        >
          {profile.is_available ? 'Available' : 'Offline'}
        </button>
      </div>

      {activeOrder && (
        <div className="rounded-xl border border-brand-200 bg-brand-50 p-4">
          <p className="mb-2 text-xs font-semibold uppercase text-brand-600">Active Delivery</p>
          <p className="text-sm font-semibold text-neutral-900">{activeOrder.order_number}</p>
          <Button size="sm" className="mt-3" onClick={() => navigate(`/delivery/orders/${activeOrder.id}`)}>
            View Delivery
          </Button>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-lg border border-neutral-100 bg-white p-4">
          <div className="mb-1 flex items-center gap-1.5 text-neutral-400">
            <Wallet size={14} />
            <span className="text-xs font-medium">Today's Earnings</span>
          </div>
          <p className="text-xl font-bold text-neutral-900">₹{summary?.today?.toFixed(0) ?? 0}</p>
        </div>
        <div className="rounded-lg border border-neutral-100 bg-white p-4">
          <div className="mb-1 flex items-center gap-1.5 text-neutral-400">
            <Package size={14} />
            <span className="text-xs font-medium">Total Deliveries</span>
          </div>
          <p className="text-xl font-bold text-neutral-900">{summary?.total_deliveries ?? 0}</p>
        </div>
      </div>

      {profile.is_available && (
        <Button className="w-full" onClick={() => navigate('/delivery/orders')}>
          View Available Orders
        </Button>
      )}
    </div>
  )
}
