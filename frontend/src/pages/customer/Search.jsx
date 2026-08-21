import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Search as SearchIcon } from 'lucide-react'
import { restaurantService } from '../../services/restaurantService'
import { RestaurantCard } from '../../components/RestaurantCard'
import { SkeletonGrid } from '../../components/Skeleton'
import { EmptyState } from '../../components/EmptyState'
import { pageTransitionVariants } from '../../lib/motion'

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams()
  const q = searchParams.get('q') ?? ''
  const [query, setQuery] = useState(q)
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!q) return
    setLoading(true)
    restaurantService
      .search(q)
      .then(({ data }) => setResults(data.data))
      .finally(() => setLoading(false))
  }, [q])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (query.trim()) setSearchParams({ q: query.trim() })
  }

  return (
    <motion.div {...pageTransitionVariants} className="mx-auto max-w-6xl px-4 py-6">
      <form onSubmit={handleSubmit} className="relative mb-6">
        <SearchIcon size={17} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search restaurants or cuisines..."
          className="h-12 w-full rounded-full border border-neutral-200 bg-white pl-10 pr-4 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
        />
      </form>

      {loading ? (
        <SkeletonGrid count={6} />
      ) : !q ? (
        <p className="text-center text-sm text-neutral-500">Search for restaurants, cuisines, or dishes.</p>
      ) : results.length === 0 ? (
        <EmptyState icon={SearchIcon} title={`No results for "${q}"`} description="Try a different search term." />
      ) : (
        <>
          <p className="mb-4 text-sm text-neutral-500">
            {results.length} result{results.length !== 1 ? 's' : ''} for "{q}"
          </p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {results.map((restaurant) => (
              <RestaurantCard key={restaurant.id} restaurant={restaurant} />
            ))}
          </div>
        </>
      )}
    </motion.div>
  )
}
