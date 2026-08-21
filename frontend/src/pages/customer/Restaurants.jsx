import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Search, SlidersHorizontal, X } from 'lucide-react'
import { restaurantService } from '../../services/restaurantService'
import { RestaurantCard } from '../../components/RestaurantCard'
import { SkeletonCard } from '../../components/Skeleton'
import { EmptyState } from '../../components/EmptyState'
import { pageTransitionVariants } from '../../lib/motion'

const CUISINES = ['Indian', 'Chinese', 'Pizza', 'Biryani', 'Burgers', 'Desserts', 'Italian', 'Mexican']

export default function Restaurants() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  const [restaurants, setRestaurants] = useState([])
  const [page, setPage] = useState(1)
  const [lastPage, setLastPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)

  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)

  const cuisine = searchParams.get('cuisine_type') ?? ''
  const isVeg = searchParams.get('is_veg') === 'true'
  const minRating = searchParams.get('min_rating') ?? ''
  const sort = searchParams.get('sort') ?? ''

  const observerRef = useRef(null)
  const sentinelRef = useRef(null)

  const updateFilter = (key, value) => {
    const next = new URLSearchParams(searchParams)
    if (value) next.set(key, value)
    else next.delete(key)
    setSearchParams(next)
  }

  const fetchPage = useCallback(
    async (pageNum, replace = false) => {
      const params = { page: pageNum }
      if (cuisine) params.cuisine_type = cuisine
      if (isVeg) params.is_veg = true
      if (minRating) params.min_rating = minRating
      if (sort) params.sort = sort

      const { data } = await restaurantService.list(params)
      setRestaurants((prev) => (replace ? data.data : [...prev, ...data.data]))
      setLastPage(data.meta.last_page)
      setPage(data.meta.page)
    },
    [cuisine, isVeg, minRating, sort]
  )

  useEffect(() => {
    setLoading(true)
    fetchPage(1, true).finally(() => setLoading(false))
  }, [fetchPage])

  useEffect(() => {
    if (!sentinelRef.current) return
    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && page < lastPage && !loadingMore) {
          setLoadingMore(true)
          fetchPage(page + 1).finally(() => setLoadingMore(false))
        }
      },
      { rootMargin: '200px' }
    )
    observerRef.current.observe(sentinelRef.current)
    return () => observerRef.current?.disconnect()
  }, [page, lastPage, loadingMore, fetchPage])

  useEffect(() => {
    if (query.length < 2) {
      setSuggestions([])
      return
    }
    const timer = setTimeout(() => {
      restaurantService.autocomplete(query).then(({ data }) => setSuggestions(data.data))
    }, 300)
    return () => clearTimeout(timer)
  }, [query])

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    if (query.trim()) navigate(`/search?q=${encodeURIComponent(query.trim())}`)
  }

  return (
    <motion.div {...pageTransitionVariants} className="mx-auto max-w-6xl px-4 py-6">
      <div className="relative mb-4">
        <form onSubmit={handleSearchSubmit} className="relative">
          <Search size={17} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
            placeholder="Search restaurants or dishes..."
            className="h-11 w-full rounded-md border border-neutral-200 bg-white pl-10 pr-4 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
          />
        </form>
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute z-20 mt-1 w-full rounded-md border border-neutral-100 bg-white py-1 shadow-lg">
            {suggestions.map((s) => (
              <button
                key={s.id}
                onMouseDown={() => navigate(`/restaurants/${s.slug}`)}
                className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm hover:bg-neutral-50"
              >
                <span className="font-medium text-neutral-900">{s.name}</span>
                <span className="text-xs text-neutral-400">{(s.cuisine_types ?? []).join(', ')}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="sticky top-14 z-20 -mx-4 mb-6 flex items-center gap-2 overflow-x-auto border-b border-neutral-100 bg-neutral-50/95 px-4 py-3 backdrop-blur md:top-16">
        <SlidersHorizontal size={16} className="shrink-0 text-neutral-400" />

        <select
          value={cuisine}
          onChange={(e) => updateFilter('cuisine_type', e.target.value)}
          className="h-9 shrink-0 rounded-full border border-neutral-200 bg-white px-3 text-xs font-medium text-neutral-700"
        >
          <option value="">All Cuisines</option>
          {CUISINES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        <button
          onClick={() => updateFilter('is_veg', isVeg ? '' : 'true')}
          className={`h-9 shrink-0 rounded-full border px-3 text-xs font-medium ${
            isVeg ? 'border-accent-500 bg-accent-500/10 text-accent-600' : 'border-neutral-200 bg-white text-neutral-700'
          }`}
        >
          Veg Only
        </button>

        <select
          value={minRating}
          onChange={(e) => updateFilter('min_rating', e.target.value)}
          className="h-9 shrink-0 rounded-full border border-neutral-200 bg-white px-3 text-xs font-medium text-neutral-700"
        >
          <option value="">Any Rating</option>
          <option value="4">4.0+</option>
          <option value="4.5">4.5+</option>
        </select>

        <select
          value={sort}
          onChange={(e) => updateFilter('sort', e.target.value)}
          className="h-9 shrink-0 rounded-full border border-neutral-200 bg-white px-3 text-xs font-medium text-neutral-700"
        >
          <option value="">Relevance</option>
          <option value="rating">Rating</option>
          <option value="delivery_fee">Delivery Fee</option>
        </select>

        {(cuisine || isVeg || minRating || sort) && (
          <button
            onClick={() => setSearchParams({})}
            className="flex h-9 shrink-0 items-center gap-1 rounded-full px-3 text-xs font-medium text-danger-500"
          >
            <X size={13} /> Clear
          </button>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : restaurants.length === 0 ? (
        <EmptyState
          icon={Search}
          title="No restaurants found"
          description="Try adjusting your filters or search a different area."
        />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {restaurants.map((restaurant) => (
              <RestaurantCard key={restaurant.id} restaurant={restaurant} />
            ))}
          </div>
          <div ref={sentinelRef} className="h-10" />
          {loadingMore && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          )}
        </>
      )}
    </motion.div>
  )
}
