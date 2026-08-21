import { useEffect, useMemo, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Star, Clock, Bike, Wallet, Search, Plus, Minus, ShoppingCart, Store } from 'lucide-react'
import { restaurantService } from '../../services/restaurantService'
import { VegBadge, NonVegBadge } from '../../components/VegBadge'
import { Modal } from '../../components/Modal'
import { Pagination } from '../../components/Pagination'
import { Button } from '../../components/Button'
import { SkeletonGrid } from '../../components/Skeleton'
import { useCart } from '../../hooks/useCart'
import { pageTransitionVariants, badgePulseVariants } from '../../lib/motion'

const TAG_STYLES = {
  bestseller: 'bg-warning-500/15 text-warning-600',
  new: 'bg-brand-500/15 text-brand-600',
  spicy: 'bg-danger-500/15 text-danger-600',
}

export default function RestaurantDetail() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const cart = useCart()

  const [restaurant, setRestaurant] = useState(null)
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState(null)
  const [menuSearch, setMenuSearch] = useState('')
  const [variantItem, setVariantItem] = useState(null)
  const [reviews, setReviews] = useState([])
  const [reviewsMeta, setReviewsMeta] = useState({ page: 1, last_page: 1 })
  const [reviewsLoading, setReviewsLoading] = useState(true)
  const [showReviews, setShowReviews] = useState(false)

  const loadReviews = (restaurantId, page = 1) => {
    setReviewsLoading(true)
    restaurantService
      .reviews(restaurantId, { page })
      .then(({ data }) => {
        setReviews(data.data)
        setReviewsMeta(data.meta)
      })
      .finally(() => setReviewsLoading(false))
  }

  useEffect(() => {
    setLoading(true)
    restaurantService
      .show(slug)
      .then(({ data }) => {
        setRestaurant(data.data)
        loadReviews(data.data.id)
        return restaurantService.menu(data.data.id)
      })
      .then(({ data }) => {
        setCategories(data.data)
        setActiveCategory(data.data[0]?.id ?? null)
      })
      .finally(() => setLoading(false))

    cart.refresh().catch(() => {})
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug])

  const filteredCategories = useMemo(() => {
    if (!menuSearch.trim()) return categories
    const q = menuSearch.toLowerCase()
    return categories
      .map((cat) => ({
        ...cat,
        menu_items: cat.menu_items.filter((item) => item.name.toLowerCase().includes(q)),
      }))
      .filter((cat) => cat.menu_items.length > 0)
  }, [categories, menuSearch])

  const scrollToCategory = (id) => {
    setActiveCategory(id)
    document.getElementById(`category-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const cartQuantityFor = (menuItemId) =>
    cart.items.filter((i) => i.menu_item_id === menuItemId).reduce((sum, i) => sum + i.quantity, 0)

  const handleAdd = async (item) => {
    if (item.variants?.length > 0) {
      setVariantItem(item)
      return
    }
    if (cart.restaurantId && cart.restaurantId !== restaurant.id && cart.items.length > 0) {
      if (!window.confirm('Your cart has items from another restaurant. Clear it and add this item?')) return
    }
    await cart.addItem({ menu_item_id: item.id, quantity: 1 })
  }

  const handleAddVariant = async (variantId) => {
    await cart.addItem({ menu_item_id: variantItem.id, variant_id: variantId, quantity: 1 })
    setVariantItem(null)
  }

  if (loading || !restaurant) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8">
        <SkeletonGrid count={6} />
      </div>
    )
  }

  return (
    <motion.div {...pageTransitionVariants}>
      <div className="relative">
        <div className="h-48 w-full overflow-hidden bg-neutral-200 sm:h-64">
          {restaurant.cover_image ? (
            <img src={restaurant.cover_image} alt="" className="size-full object-cover" />
          ) : (
            <div className="size-full bg-gradient-to-br from-brand-400 to-brand-600" />
          )}
        </div>
        {restaurant.logo && (
          <img
            src={restaurant.logo}
            alt=""
            className="absolute -bottom-8 left-6 z-30 size-20 rounded-xl border-4 border-white object-cover shadow-lg"
          />
        )}
      </div>

      <div className="sticky top-14 z-20 border-b border-neutral-100 bg-white/95 px-4 py-3 backdrop-blur md:top-16">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-5 gap-y-1.5 pl-24">
          <h1 className="font-display text-lg font-bold text-neutral-900">{restaurant.name}</h1>
          <button
            onClick={() => setShowReviews(true)}
            className="inline-flex items-center gap-1 text-sm text-neutral-600 underline decoration-dotted underline-offset-2 hover:text-neutral-900"
          >
            <Star size={14} fill="currentColor" className="text-accent-500" />
            {Number(restaurant.avg_rating).toFixed(1)}
          </button>
          <span className="inline-flex items-center gap-1 text-sm text-neutral-500">
            <Clock size={14} />
            {restaurant.avg_delivery_time} min
          </span>
          <span className="inline-flex items-center gap-1 text-sm text-neutral-500">
            <Bike size={14} />₹{restaurant.delivery_fee}
          </span>
          <span className="inline-flex items-center gap-1 text-sm text-neutral-500">
            <Wallet size={14} />
            Min ₹{restaurant.min_order_amount}
          </span>
          <span
            className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
              restaurant.is_open ? 'bg-accent-500/15 text-accent-600' : 'bg-neutral-200 text-neutral-600'
            }`}
          >
            {restaurant.is_open ? 'Open Now' : 'Closed'}
          </span>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-6 pt-10 sm:flex sm:gap-8">
        <aside className="mb-4 sm:mb-0 sm:w-48 sm:shrink-0">
          <div className="mb-4 relative sm:hidden">
            <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              value={menuSearch}
              onChange={(e) => setMenuSearch(e.target.value)}
              placeholder="Search menu..."
              className="h-10 w-full rounded-md border border-neutral-200 pl-9 pr-3 text-sm focus:border-brand-500 focus:outline-none"
            />
          </div>
          <div className="scrollbar-none flex gap-2 overflow-x-auto sm:sticky sm:top-32 sm:flex-col sm:gap-1">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => scrollToCategory(cat.id)}
                className={`shrink-0 rounded-md px-3 py-2 text-left text-sm font-medium transition ${
                  activeCategory === cat.id ? 'bg-brand-50 text-brand-600' : 'text-neutral-600 hover:bg-neutral-100'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </aside>

        <div className="flex-1 space-y-8">
          <div className="hidden relative sm:block">
            <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              value={menuSearch}
              onChange={(e) => setMenuSearch(e.target.value)}
              placeholder="Search menu..."
              className="h-10 w-full max-w-xs rounded-md border border-neutral-200 pl-9 pr-3 text-sm focus:border-brand-500 focus:outline-none"
            />
          </div>

          {filteredCategories.map((cat) => (
            <section key={cat.id} id={`category-${cat.id}`} className="scroll-mt-32">
              <h2 className="mb-3 text-lg font-bold text-neutral-900">{cat.name}</h2>
              <div className="space-y-3">
                {cat.menu_items.map((item) => {
                  const qty = cartQuantityFor(item.id)
                  return (
                    <div
                      key={item.id}
                      className="flex items-start justify-between gap-4 rounded-lg border border-neutral-100 bg-white p-4 shadow-card"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          {item.is_veg ? <VegBadge /> : <NonVegBadge />}
                          <h3 className="font-medium text-neutral-900">{item.name}</h3>
                        </div>
                        {item.tags?.length > 0 && (
                          <div className="mt-1 flex gap-1.5">
                            {item.tags.map((tag) => (
                              <span
                                key={tag}
                                className={`rounded px-1.5 py-0.5 text-[10px] font-bold uppercase ${TAG_STYLES[tag] ?? 'bg-neutral-100 text-neutral-600'}`}
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                        {item.description && (
                          <p className="mt-1 line-clamp-2 text-xs text-neutral-500">{item.description}</p>
                        )}
                        <div className="mt-2 flex items-center gap-2">
                          {item.discounted_price ? (
                            <>
                              <span className="text-sm font-semibold text-neutral-900">₹{item.discounted_price}</span>
                              <span className="text-xs text-neutral-400 line-through">₹{item.price}</span>
                            </>
                          ) : (
                            <span className="text-sm font-semibold text-neutral-900">₹{item.price}</span>
                          )}
                        </div>
                        {!item.is_available && (
                          <span className="mt-1 inline-block rounded bg-neutral-100 px-2 py-0.5 text-[11px] font-medium text-neutral-500">
                            Unavailable
                          </span>
                        )}
                      </div>

                      {item.image && (
                        <img src={item.image} alt="" className="size-20 shrink-0 rounded-md object-cover" />
                      )}

                      <div className="shrink-0">
                        {item.is_available &&
                          (qty > 0 && item.variants?.length === 0 ? (
                            <motion.div
                              {...badgePulseVariants}
                              className="flex items-center gap-2 rounded-md border border-brand-500 px-1"
                            >
                              <button
                                onClick={() => {
                                  const cartItem = cart.items.find((i) => i.menu_item_id === item.id)
                                  if (cartItem.quantity <= 1) cart.removeItem(cartItem.id)
                                  else cart.updateItem(cartItem.id, cartItem.quantity - 1)
                                }}
                                className="flex size-7 items-center justify-center text-brand-500"
                              >
                                <Minus size={14} />
                              </button>
                              <span className="w-4 text-center text-sm font-semibold">{qty}</span>
                              <button
                                onClick={() => {
                                  const cartItem = cart.items.find((i) => i.menu_item_id === item.id)
                                  cart.updateItem(cartItem.id, cartItem.quantity + 1)
                                }}
                                className="flex size-7 items-center justify-center text-brand-500"
                              >
                                <Plus size={14} />
                              </button>
                            </motion.div>
                          ) : (
                            <Button size="sm" variant="secondary" onClick={() => handleAdd(item)}>
                              <Plus size={14} /> Add
                            </Button>
                          ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            </section>
          ))}
        </div>
      </div>

      {cart.totalItems > 0 && (
        <button
          onClick={() => navigate('/cart')}
          className="fixed inset-x-4 bottom-4 z-30 flex items-center justify-between rounded-full bg-brand-500 px-5 py-3.5 text-white shadow-xl sm:hidden"
        >
          <span className="flex items-center gap-2 text-sm font-semibold">
            <ShoppingCart size={16} />
            {cart.totalItems} item{cart.totalItems > 1 ? 's' : ''}
          </span>
          <span className="text-sm font-bold">View Cart</span>
        </button>
      )}

      <Modal open={!!variantItem} onClose={() => setVariantItem(null)} title={variantItem?.name}>
        <div className="space-y-2">
          {variantItem?.variants?.map((variant) => (
            <button
              key={variant.id}
              onClick={() => handleAddVariant(variant.id)}
              className="flex w-full items-center justify-between rounded-md border border-neutral-200 px-4 py-3 text-left text-sm hover:border-brand-500 hover:bg-brand-50"
            >
              <span className="font-medium text-neutral-900">{variant.name}</span>
              <span className="font-semibold text-neutral-900">₹{variant.price}</span>
            </button>
          ))}
        </div>
      </Modal>

      <Modal open={showReviews} onClose={() => setShowReviews(false)} title="Reviews">
        {reviewsLoading ? null : reviews.length === 0 ? (
          <p className="text-sm text-neutral-500">No reviews yet.</p>
        ) : (
          <div className="max-h-[60vh] space-y-3 overflow-y-auto">
            {reviews.map((review) => (
              <div key={review.id} className="rounded-lg border border-neutral-100 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex size-8 items-center justify-center rounded-full bg-brand-50 text-xs font-bold text-brand-500">
                      {review.user?.name?.[0]}
                    </div>
                    <span className="text-sm font-medium text-neutral-900">{review.user?.name}</span>
                  </div>
                  <span className="flex items-center gap-1 text-sm text-neutral-600">
                    <Star size={13} fill="currentColor" className="text-accent-500" />
                    {review.rating}
                  </span>
                </div>
                {review.comment && <p className="mt-2 text-sm text-neutral-600">{review.comment}</p>}
                {review.owner_reply && (
                  <div className="mt-3 flex gap-2 rounded-md bg-neutral-50 p-3">
                    <Store size={14} className="mt-0.5 shrink-0 text-neutral-400" />
                    <div>
                      <p className="text-xs font-semibold text-neutral-700">Response from {restaurant.name}</p>
                      <p className="mt-0.5 text-xs text-neutral-600">{review.owner_reply}</p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
        <Pagination meta={reviewsMeta} onPageChange={(page) => loadReviews(restaurant.id, page)} />
      </Modal>
    </motion.div>
  )
}
