import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Search, MapPin, ArrowRight } from 'lucide-react'
import { restaurantService } from '../../services/restaurantService'
import { orderService } from '../../services/orderService'
import { RestaurantCard } from '../../components/RestaurantCard'
import { SkeletonCard } from '../../components/Skeleton'
import { pageTransitionVariants } from '../../lib/motion'

const CUISINES = ['Indian', 'Chinese', 'Pizza', 'Biryani', 'Burgers', 'Desserts', 'Italian', 'Mexican']

export default function Home() {
  const navigate = useNavigate()
  const { isAuthenticated } = useSelector((state) => state.auth)
  const [query, setQuery] = useState('')
  const [featured, setFeatured] = useState([])
  const [loadingFeatured, setLoadingFeatured] = useState(true)
  const [recent, setRecent] = useState([])

  useEffect(() => {
    restaurantService
      .featured()
      .then(({ data }) => setFeatured(data.data))
      .finally(() => setLoadingFeatured(false))

    if (isAuthenticated) {
      orderService.list({ per_page: 5 }).then(({ data }) => {
        const seen = new Set()
        const uniqueRestaurants = []
        for (const order of data.data) {
          if (order.restaurant && !seen.has(order.restaurant.id)) {
            seen.add(order.restaurant.id)
            uniqueRestaurants.push(order.restaurant)
          }
        }
        setRecent(uniqueRestaurants.slice(0, 3))
      })
    }
  }, [isAuthenticated])

  const handleSearch = (e) => {
    e.preventDefault()
    if (query.trim()) navigate(`/search?q=${encodeURIComponent(query.trim())}`)
  }

  return (
    <motion.div {...pageTransitionVariants}>
      <section className="bg-gradient-to-br from-brand-500 via-brand-600 to-brand-700 px-4 py-14 sm:py-20">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="font-display text-3xl font-extrabold text-white sm:text-5xl">
            Craving something delicious?
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-sm text-brand-50 sm:text-base">
            Order from your favourite local restaurants and get it delivered fast.
          </p>

          <form onSubmit={handleSearch} className="mx-auto mt-8 flex max-w-xl items-center gap-2 rounded-full bg-white p-1.5 shadow-xl">
            <MapPin size={18} className="ml-3 shrink-0 text-neutral-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search restaurants or dishes..."
              className="h-11 w-full border-0 bg-transparent text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-0"
            />
            <button
              type="submit"
              className="flex size-11 shrink-0 items-center justify-center rounded-full bg-brand-500 text-white transition hover:bg-brand-600"
            >
              <Search size={18} />
            </button>
          </form>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-8">
        <div className="scrollbar-none flex gap-3 overflow-x-auto pb-2">
          {CUISINES.map((cuisine) => (
            <button
              key={cuisine}
              onClick={() => navigate(`/restaurants?cuisine_type=${encodeURIComponent(cuisine)}`)}
              className="shrink-0 rounded-full border border-neutral-200 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition hover:border-brand-300 hover:bg-brand-50 hover:text-brand-600"
            >
              {cuisine}
            </button>
          ))}
        </div>
      </section>

      {recent.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 py-4">
          <h2 className="mb-4 text-xl font-bold text-neutral-900">Order Again</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {recent.map((restaurant) => (
              <RestaurantCard key={restaurant.id} restaurant={restaurant} />
            ))}
          </div>
        </section>
      )}

      <section className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-neutral-900">Featured Restaurants</h2>
          <button
            onClick={() => navigate('/restaurants')}
            className="flex items-center gap-1 text-sm font-semibold text-brand-600 hover:text-brand-700"
          >
            See all <ArrowRight size={14} />
          </button>
        </div>

        {loadingFeatured ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : featured.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((restaurant) => (
              <RestaurantCard key={restaurant.id} restaurant={restaurant} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-neutral-500">No featured restaurants right now — check back soon.</p>
        )}
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-12">
        <button
          onClick={() => navigate('/restaurants?sort=rating')}
          className="flex w-full items-center justify-between rounded-xl bg-accent-500/10 px-6 py-5 text-left transition hover:bg-accent-500/15"
        >
          <div>
            <p className="text-sm font-semibold text-accent-600">Top Rated Near You</p>
            <p className="text-xs text-neutral-500">Browse restaurants with the best reviews</p>
          </div>
          <ArrowRight size={18} className="text-accent-600" />
        </button>
      </section>
    </motion.div>
  )
}
