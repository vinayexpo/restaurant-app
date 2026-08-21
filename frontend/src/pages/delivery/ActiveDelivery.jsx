import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { Phone, MapPin } from 'lucide-react'
import { deliveryService } from '../../services/deliveryService'
import { Button } from '../../components/Button'
import { LiveMap } from '../../components/LiveMap'

const STEPS = [
  { key: 'ready_for_pickup', label: 'Picking Up', next: 'picked_up', nextLabel: 'Confirm Pickup' },
  { key: 'picked_up', label: 'Picked Up', next: 'on_the_way', nextLabel: 'Start Delivering' },
  { key: 'on_the_way', label: 'Delivering', next: 'delivered', nextLabel: 'Mark Delivered' },
  { key: 'delivered', label: 'Delivered', next: null },
]

export default function ActiveDelivery() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [order, setOrder] = useState(null)
  const [advancing, setAdvancing] = useState(false)
  const [myPosition, setMyPosition] = useState(null)

  const load = () => deliveryService.order(id).then(({ data }) => setOrder(data.data))

  useEffect(() => {
    load()
  }, [id])

  useEffect(() => {
    if (!navigator.geolocation) return
    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        setMyPosition([pos.coords.latitude, pos.coords.longitude])
        deliveryService.updateLocation(pos.coords.latitude, pos.coords.longitude).catch(() => {})
      },
      () => {},
      { enableHighAccuracy: true }
    )
    return () => navigator.geolocation.clearWatch(watchId)
  }, [])

  const advance = async () => {
    const step = STEPS.find((s) => s.key === order.status)
    if (!step?.next) return
    setAdvancing(true)
    try {
      await deliveryService.updateOrderStatus(id, step.next)
      if (step.next === 'delivered') {
        toast.success('Delivery completed!')
        navigate('/delivery/dashboard')
        return
      }
      load()
    } catch (error) {
      toast.error(error.response?.data?.message ?? 'Could not update status.')
    } finally {
      setAdvancing(false)
    }
  }

  if (!order) return null

  const currentStep = STEPS.find((s) => s.key === order.status)
  const currentIndex = STEPS.findIndex((s) => s.key === order.status)

  return (
    <div className="p-4">
      <div className="mb-5 flex justify-between">
        {STEPS.map((step, i) => (
          <div key={step.key} className="flex flex-1 flex-col items-center">
            <div
              className={`flex size-8 items-center justify-center rounded-full text-xs font-bold ${
                i <= currentIndex ? 'bg-accent-500 text-white' : 'bg-neutral-200 text-neutral-500'
              }`}
            >
              {i + 1}
            </div>
            <span className={`mt-1 text-center text-[11px] ${i <= currentIndex ? 'text-neutral-900' : 'text-neutral-400'}`}>
              {step.label}
            </span>
          </div>
        ))}
      </div>

      <div className="mb-4">
        <LiveMap
          height={200}
          markers={[
            order.restaurant?.latitude && {
              id: 'restaurant',
              type: 'restaurant',
              label: order.restaurant.name,
              position: [Number(order.restaurant.latitude), Number(order.restaurant.longitude)],
            },
            order.delivery_address?.latitude && {
              id: 'customer',
              type: 'customer',
              label: 'Deliver here',
              position: [Number(order.delivery_address.latitude), Number(order.delivery_address.longitude)],
            },
            myPosition && { id: 'me', type: 'rider', label: 'You', position: myPosition },
          ].filter(Boolean)}
        />
      </div>

      <div className="space-y-3">
        <div className="rounded-lg border border-neutral-100 bg-white p-4">
          <p className="mb-1 text-xs font-semibold uppercase text-neutral-400">Pickup From</p>
          <p className="text-sm font-medium text-neutral-900">{order.restaurant?.name}</p>
          <p className="flex items-center gap-1 text-xs text-neutral-500">
            <MapPin size={12} /> {order.restaurant?.address}
          </p>
        </div>

        <div className="rounded-lg border border-neutral-100 bg-white p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="mb-1 text-xs font-semibold uppercase text-neutral-400">Deliver To</p>
              <p className="text-sm font-medium text-neutral-900">{order.user?.name}</p>
              <p className="flex items-center gap-1 text-xs text-neutral-500">
                <MapPin size={12} /> {order.delivery_address?.address_line1}, {order.delivery_address?.city}
              </p>
            </div>
            {order.user?.phone && (
              <a href={`tel:${order.user.phone}`} className="flex size-9 items-center justify-center rounded-full bg-accent-500/10 text-accent-600">
                <Phone size={16} />
              </a>
            )}
          </div>
        </div>
      </div>

      {currentStep?.next && (
        <Button className="mt-5 w-full" size="lg" loading={advancing} onClick={advance}>
          {currentStep.nextLabel}
        </Button>
      )}
    </div>
  )
}
