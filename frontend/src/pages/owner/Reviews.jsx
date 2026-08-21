import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { Star } from 'lucide-react'
import { ownerService } from '../../services/ownerService'
import { Button } from '../../components/Button'
import { Pagination } from '../../components/Pagination'
import { EmptyState } from '../../components/EmptyState'
import { SkeletonListRow } from '../../components/Skeleton'

export default function OwnerReviews() {
  const [reviews, setReviews] = useState([])
  const [meta, setMeta] = useState({ page: 1, last_page: 1 })
  const [loading, setLoading] = useState(true)
  const [ratingFilter, setRatingFilter] = useState('')
  const [replyDrafts, setReplyDrafts] = useState({})
  const [submittingId, setSubmittingId] = useState(null)

  const load = (page = 1) => {
    setLoading(true)
    ownerService
      .reviews({ page, ...(ratingFilter ? { rating: ratingFilter } : {}) })
      .then(({ data }) => {
        setReviews(data.data)
        setMeta(data.meta)
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => load(1), [ratingFilter])

  const submitReply = async (id) => {
    const reply = replyDrafts[id]
    if (!reply?.trim()) return
    setSubmittingId(id)
    try {
      await ownerService.replyReview(id, reply)
      toast.success('Reply posted.')
      load()
    } catch {
      toast.error('Could not post reply.')
    } finally {
      setSubmittingId(null)
    }
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-lg font-bold text-neutral-900">Reviews</h1>
        <select
          value={ratingFilter}
          onChange={(e) => setRatingFilter(e.target.value)}
          className="h-9 rounded-md border border-neutral-200 px-3 text-sm"
        >
          <option value="">All Ratings</option>
          {[5, 4, 3, 2, 1].map((n) => (
            <option key={n} value={n}>
              {n} Stars
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <SkeletonListRow key={i} />
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <EmptyState icon={Star} title="No reviews yet" description="Customer reviews will appear here." />
      ) : (
        <div className="space-y-3">
          {reviews.map((review) => (
            <div key={review.id} className="rounded-lg border border-neutral-100 bg-white p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-0.5 text-sm font-semibold text-warning-500">
                    <Star size={14} fill="currentColor" /> {review.rating}
                  </span>
                  <span className="text-sm text-neutral-600">{review.user?.name}</span>
                </div>
                <span className="text-xs text-neutral-400">{new Date(review.created_at).toLocaleDateString()}</span>
              </div>
              {review.comment && <p className="mt-2 text-sm text-neutral-700">{review.comment}</p>}

              {review.owner_reply ? (
                <div className="mt-3 rounded-md bg-neutral-50 p-3 text-sm">
                  <p className="mb-0.5 text-xs font-semibold text-neutral-500">Your reply</p>
                  <p className="text-neutral-700">{review.owner_reply}</p>
                </div>
              ) : (
                <div className="mt-3 flex gap-2">
                  <input
                    value={replyDrafts[review.id] ?? ''}
                    onChange={(e) => setReplyDrafts((p) => ({ ...p, [review.id]: e.target.value }))}
                    placeholder="Write a reply..."
                    className="h-9 flex-1 rounded-md border border-neutral-200 px-3 text-sm"
                  />
                  <Button size="sm" variant="secondary" loading={submittingId === review.id} onClick={() => submitReply(review.id)}>
                    Reply
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <Pagination meta={meta} onPageChange={load} />
    </div>
  )
}
