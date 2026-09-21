import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { Pencil, Star, Trash2 } from 'lucide-react'
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
  const [editingId, setEditingId] = useState(null)
  const [submittingId, setSubmittingId] = useState(null)
  const [filters, setFilters] = useState({ replied: '', search: '', date_from: '', date_to: '' })

  const load = (page = 1) => {
    setLoading(true)
    ownerService
      .reviews({ page, rating: ratingFilter, ...filters })
      .then(({ data }) => {
        setReviews(data.data)
        setMeta(data.meta)
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => load(1), [ratingFilter, filters])

  const submitReply = async (id) => {
    const reply = replyDrafts[id]
    if (!reply?.trim()) return
    setSubmittingId(id)
    try {
      await ownerService.replyReview(id, reply)
      setEditingId(null)
      toast.success('Reply saved.')
      load()
    } catch {
      toast.error('Could not post reply.')
    } finally {
      setSubmittingId(null)
    }
  }

  const editReply = (review) => {
    setReplyDrafts((drafts) => ({ ...drafts, [review.id]: review.owner_reply }))
    setEditingId(review.id)
  }

  const clearReply = async (id) => {
    if (!window.confirm('Delete this reply?')) return
    setSubmittingId(id)
    try {
      await ownerService.clearReviewReply(id)
      setReplyDrafts((drafts) => ({ ...drafts, [id]: '' }))
      setEditingId(null)
      toast.success('Reply deleted.')
      load()
    } catch {
      toast.error('Could not delete reply.')
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

      <div className="mb-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        <input value={filters.search} onChange={(e) => setFilters((current) => ({ ...current, search: e.target.value }))} placeholder="Search reviewer or comment" className="h-9 rounded-md border border-neutral-200 px-3 text-sm" />
        <select value={filters.replied} onChange={(e) => setFilters((current) => ({ ...current, replied: e.target.value }))} className="h-9 rounded-md border border-neutral-200 px-3 text-sm"><option value="">All replies</option><option value="1">Replied</option><option value="0">Awaiting reply</option></select>
        <input type="date" aria-label="Reviews from date" value={filters.date_from} onChange={(e) => setFilters((current) => ({ ...current, date_from: e.target.value }))} className="h-9 rounded-md border border-neutral-200 px-3 text-sm" />
        <input type="date" aria-label="Reviews to date" value={filters.date_to} onChange={(e) => setFilters((current) => ({ ...current, date_to: e.target.value }))} className="h-9 rounded-md border border-neutral-200 px-3 text-sm" />
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

              {review.owner_reply && editingId !== review.id ? (
                <div className="mt-3 rounded-md bg-neutral-50 p-3 text-sm">
                  <div className="mb-0.5 flex items-center justify-between">
                    <p className="text-xs font-semibold text-neutral-500">Your reply</p>
                    <div className="flex items-center gap-1">
                      <button type="button" onClick={() => editReply(review)} className="rounded p-1 text-neutral-400 hover:bg-white hover:text-brand-600" aria-label="Edit reply">
                        <Pencil size={14} />
                      </button>
                      <button type="button" onClick={() => clearReply(review.id)} disabled={submittingId === review.id} className="rounded p-1 text-neutral-400 hover:bg-white hover:text-danger-500 disabled:opacity-50" aria-label="Delete reply">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
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
                  {editingId === review.id && (
                    <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>
                      Cancel
                    </Button>
                  )}
                  <Button size="sm" variant="secondary" loading={submittingId === review.id} onClick={() => submitReply(review.id)}>
                    {editingId === review.id ? 'Save' : 'Reply'}
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
