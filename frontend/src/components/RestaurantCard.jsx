import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Heart, Clock, Bike } from 'lucide-react'
import { RatingChip } from './RatingChip'
import { cardHoverVariants } from '../lib/motion'

export function RestaurantCard({ restaurant, isFavourite = false, onToggleFavourite }) {
  const {
    slug,
    name,
    cover_image: coverImage,
    logo,
    cuisine_types: cuisineTypes = [],
    avg_rating: avgRating,
    avg_delivery_time: avgDeliveryTime,
    delivery_fee: deliveryFee,
    is_open: isOpen,
  } = restaurant

  return (
    <motion.div {...cardHoverVariants} className="group relative overflow-hidden rounded-lg bg-white shadow-card">
      <Link to={`/restaurants/${slug}`} className="block">
        <div className="relative">
          <div className="aspect-video w-full overflow-hidden bg-neutral-100">
            {coverImage ? (
              <img
                src={coverImage}
                alt={name}
                width={400}
                height={225}
                loading="lazy"
                className="size-full object-cover"
              />
            ) : (
              <div className="flex size-full items-center justify-center bg-brand-50 text-brand-300">
                <span className="font-display text-2xl font-bold">{name?.[0]}</span>
              </div>
            )}

            <span
              className={`absolute left-2.5 top-2.5 rounded-full px-2 py-0.5 text-xs font-semibold ${
                isOpen ? 'bg-accent-500 text-white' : 'bg-neutral-900/70 text-white'
              }`}
            >
              {isOpen ? 'Open' : 'Closed'}
            </span>
          </div>

          {logo && (
            <img
              src={logo}
              alt=""
              width={44}
              height={44}
              className="absolute -bottom-5 left-3 size-11 rounded-full border-2 border-white object-cover shadow-md"
            />
          )}
        </div>

        <div className="p-4 pt-6">
          <div className="flex items-start justify-between gap-2">
            <h3 className="line-clamp-1 text-base font-semibold text-neutral-900">{name}</h3>
            {avgRating != null && <RatingChip rating={avgRating} />}
          </div>

          <p className="mt-1 line-clamp-1 text-sm text-neutral-500">{cuisineTypes.join(', ')}</p>

          <div className="mt-2.5 flex items-center gap-3 text-xs text-neutral-500">
            <span className="inline-flex items-center gap-1">
              <Clock size={13} />
              {avgDeliveryTime} min
            </span>
            <span className="inline-flex items-center gap-1">
              <Bike size={13} />
              {Number(deliveryFee) === 0 ? 'Free delivery' : `₹${deliveryFee}`}
            </span>
          </div>
        </div>
      </Link>

      {onToggleFavourite && (
        <button
          onClick={(e) => {
            e.preventDefault()
            onToggleFavourite(restaurant)
          }}
          aria-label={isFavourite ? 'Remove from favourites' : 'Add to favourites'}
          className="absolute right-2.5 top-2.5 flex size-8 items-center justify-center rounded-full bg-white/90 text-neutral-500 shadow-sm backdrop-blur transition hover:text-danger-500"
        >
          <Heart size={16} fill={isFavourite ? 'currentColor' : 'none'} className={isFavourite ? 'text-danger-500' : ''} />
        </button>
      )}
    </motion.div>
  )
}
