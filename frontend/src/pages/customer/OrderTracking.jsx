import { useEffect, useState } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { CheckCircle2, Circle, Star, Bike, Phone } from 'lucide-react'
import { orderService } from '../../services/orderService'
import api from '../../lib/axios'
import { Badge } from '../../components/Badge'
import { Button } from '../../components/Button'
import { Modal } from '../../components/Modal'
import { LiveMap } from '../../components/LiveMap'
import { getEcho } from '../../lib/echo'
import { pageTransitionVariants } from '../../lib/motion'

const LIVE_TRACKING_STATUSES = ['picked_up', 'on_the_way']

const STATUS_STEPS = [
  { key: 'pending', label: 'Order Placed' },
  { key: 'confirmed', label: 'Confirmed' },
  { key: 'preparing', label: 'Preparing' },
  { key: 'ready_for_pickup', label: 'Ready for Pickup' },
  { key: 'picked_up', label: 'Picked Up' },
  { key: 'on_the_way', label: 'On the Way' },
  { key: 'delivered', label: 'Delivered' },
]

export default function OrderTracking() {
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showRateModal, setShowRateModal] = useState(false)
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [rated, setRated] = useState(false)

  const [showReviewModal, setShowReviewModal] = useState(searchParams.get('review') === '1')
  const [reviewRating, setReviewRating] = useState(5)
  const [reviewComment, setReviewComment] = useState('')
  const [riderPosition, setRiderPosition] = useState(null)

  const load = () => orderService.show(id).then(({ data }) => setOrder(data.data))

  useEffect(() => {
    load().finally(() => setLoading(false))

    const echo = getEcho()
    const channel = echo.private(`orders.${id}`)
    channel.listen('.order.status.changed', () => {
      load()
      toast.success('Order status updated!')
    })
    channel.listen('.delivery.location.updated', (e) => {
      setRiderPosition([e.latitude, e.longitude])
    })

    return () => {
      echo.leave(`orders.${id}`)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  useEffect(() => {
    const partnerLoc = order?.delivery_partner?.delivery_partner
    if (partnerLoc?.current_latitude && partnerLoc?.current_longitude) {
      setRiderPosition((prev) => prev ?? [Number(partnerLoc.current_latitude), Number(partnerLoc.current_longitude)])
    }
  }, [order?.delivery_partner])

  const submitRating = async () => {
    try {
      await orderService.rateDelivery(id, { rating, comment })
      setRated(true)
      setShowRateModal(false)
      toast.success('Thanks for rating your delivery!')
    } catch (error) {
      toast.error(error.response?.data?.message ?? 'Could not submit rating.')
    }
  }

  const submitReview = async () => {
    try {
      await api.post('/reviews', { order_id: Number(id), rating: reviewRating, comment: reviewComment })
      setShowReviewModal(false)
      setOrder((prev) => ({ ...prev, review: { rating: reviewRating, comment: reviewComment } }))
      toast.success('Thanks for your review!')
    } catch (error) {
      toast.error(error.response?.data?.message ?? 'Could not submit review.')
    }
  }

  if (loading || !order) return null

  const isCancelled = order.status === 'cancelled'
  const currentIndex = STATUS_STEPS.findIndex((s) => s.key === order.status)

  return (
    <motion.div {...pageTransitionVariants} className="mx-auto max-w-lg px-4 py-6">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-neutral-900">{order.order_number}</h1>
          <p className="text-sm text-neutral-500">{order.restaurant?.name}</p>
        </div>
        <Badge status={order.status} />
      </div>

      {isCancelled ? (
        <div className="rounded-lg border border-danger-200 bg-danger-500/5 p-4 text-sm text-danger-600">
          This order was cancelled. {order.cancel_reason}
        </div>
      ) : (
        <div className="relative rounded-lg border border-neutral-100 bg-white p-5">
          {STATUS_STEPS.map((step, i) => {
            const done = i <= currentIndex
            const history = order.status_history?.find((h) => h.status === step.key)
            return (
              <div key={step.key} className="relative flex gap-3 pb-7 last:pb-0">
                {i < STATUS_STEPS.length - 1 && (
                  <span className="absolute left-[9px] top-5 h-full w-0.5 bg-neutral-100">
                    <motion.span
                      initial={{ height: 0 }}
                      animate={{ height: done && i < currentIndex ? '100%' : 0 }}
                      transition={{ duration: 0.4 }}
                      className="block w-full bg-accent-500"
                    />
                  </span>
                )}
                {done ? (
                  <CheckCircle2 size={20} className="shrink-0 text-accent-500" />
                ) : (
                  <Circle size={20} className="shrink-0 text-neutral-300" />
                )}
                <div>
                  <p className={`text-sm font-medium ${done ? 'text-neutral-900' : 'text-neutral-400'}`}>{step.label}</p>
                  {history && (
                    <p className="text-xs text-neutral-400">{new Date(history.created_at).toLocaleString()}</p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {order.delivery_partner && LIVE_TRACKING_STATUSES.includes(order.status) && (
        <div className="mt-4">
          <LiveMap
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
                label: 'Delivery address',
                position: [Number(order.delivery_address.latitude), Number(order.delivery_address.longitude)],
              },
              riderPosition && {
                id: 'rider',
                type: 'rider',
                label: order.delivery_partner.name,
                position: riderPosition,
              },
            ].filter(Boolean)}
          />
        </div>
      )}

      {order.delivery_partner && (
        <div className="mt-4 flex items-center justify-between rounded-lg border border-neutral-100 bg-white p-4">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-full bg-brand-50 text-brand-500">
              <Bike size={18} />
            </div>
            <div>
              <p className="text-sm font-semibold text-neutral-900">{order.delivery_partner.name}</p>
              <p className="flex items-center gap-1 text-xs text-neutral-500">
                {order.delivery_partner.delivery_partner?.vehicle_type && (
                  <span className="capitalize">{order.delivery_partner.delivery_partner.vehicle_type}</span>
                )}
                {order.delivery_partner.delivery_partner?.avg_rating > 0 && (
                  <span className="flex items-center gap-0.5">
                    <Star size={11} fill="currentColor" className="text-warning-500" />
                    {Number(order.delivery_partner.delivery_partner.avg_rating).toFixed(1)}
                  </span>
                )}
              </p>
            </div>
          </div>
          {order.delivery_partner.phone && (
            <a
              href={`tel:${order.delivery_partner.phone}`}
              className="flex size-9 items-center justify-center rounded-full bg-accent-500/10 text-accent-600"
            >
              <Phone size={16} />
            </a>
          )}
        </div>
      )}

      {order.status === 'delivered' && (
        <div className="mt-4 flex gap-2">
          {!rated && order.delivery_partner && (
            <Button variant="secondary" className="flex-1" onClick={() => setShowRateModal(true)}>
              Rate Delivery
            </Button>
          )}
          {!order.review && (
            <Button variant="secondary" className="flex-1" onClick={() => setShowReviewModal(true)}>
              Write a Review
            </Button>
          )}
        </div>
      )}

      <Modal open={showRateModal} onClose={() => setShowRateModal(false)} title="Rate Your Delivery">
        <div className="mb-4 flex justify-center gap-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <button key={n} onClick={() => setRating(n)}>
              <Star size={28} fill={n <= rating ? '#F59E0B' : 'none'} className={n <= rating ? 'text-warning-500' : 'text-neutral-300'} />
            </button>
          ))}
        </div>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Leave a comment (optional)"
          rows={3}
          className="w-full rounded-md border border-neutral-200 p-3 text-sm focus:border-brand-500 focus:outline-none"
        />
        <Button className="mt-3 w-full" onClick={submitRating}>
          Submit Rating
        </Button>
      </Modal>

      <Modal open={showReviewModal} onClose={() => setShowReviewModal(false)} title="Write a Review">
        <div className="mb-4 flex justify-center gap-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <button key={n} onClick={() => setReviewRating(n)}>
              <Star
                size={28}
                fill={n <= reviewRating ? '#F59E0B' : 'none'}
                className={n <= reviewRating ? 'text-warning-500' : 'text-neutral-300'}
              />
            </button>
          ))}
        </div>
        <textarea
          value={reviewComment}
          onChange={(e) => setReviewComment(e.target.value)}
          placeholder="How was your food and experience?"
          rows={4}
          className="w-full rounded-md border border-neutral-200 p-3 text-sm focus:border-brand-500 focus:outline-none"
        />
        <Button className="mt-3 w-full" onClick={submitReview}>
          Submit Review
        </Button>
      </Modal>
    </motion.div>
  )
}
