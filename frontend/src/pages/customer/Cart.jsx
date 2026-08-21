import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { motion, AnimatePresence } from 'framer-motion'
import { Minus, Plus, Trash2, ShoppingBag, Tag, Gem, X } from 'lucide-react'
import { useCart } from '../../hooks/useCart'
import { cartService } from '../../services/cartService'
import { loyaltyService } from '../../services/loyaltyService'
import { Button } from '../../components/Button'
import { EmptyState } from '../../components/EmptyState'
import { pageTransitionVariants, cartItemVariants } from '../../lib/motion'

export default function Cart() {
  const navigate = useNavigate()
  const cart = useCart()
  const settings = useSelector((state) => state.ui.settings)

  const [loading, setLoading] = useState(true)
  const [couponCode, setCouponCode] = useState('')
  const [couponResult, setCouponResult] = useState(null)
  const [couponError, setCouponError] = useState('')
  const [applyingCoupon, setApplyingCoupon] = useState(false)

  const [loyaltyBalance, setLoyaltyBalance] = useState(0)
  const [useLoyalty, setUseLoyalty] = useState(false)
  const [loyaltyPreview, setLoyaltyPreview] = useState(null)
  const [redeemPoints, setRedeemPoints] = useState(0)

  useEffect(() => {
    cart.refresh().finally(() => setLoading(false))
    if (settings?.loyalty_enabled) {
      loyaltyService.summary().then(({ data }) => setLoyaltyBalance(data.data.balance))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const applyCoupon = async () => {
    if (!couponCode.trim()) return
    setApplyingCoupon(true)
    setCouponError('')
    try {
      const { data } = await cartService.validateCoupon(couponCode.trim())
      setCouponResult(data.data)
      setUseLoyalty(false)
      setLoyaltyPreview(null)
    } catch (error) {
      setCouponError(error.response?.data?.message ?? 'Invalid coupon.')
      setCouponResult(null)
    } finally {
      setApplyingCoupon(false)
    }
  }

  const toggleLoyalty = async () => {
    if (useLoyalty) {
      setUseLoyalty(false)
      setLoyaltyPreview(null)
      return
    }
    const points = Math.min(loyaltyBalance, 500)
    try {
      const { data } = await loyaltyService.redeem(points)
      setLoyaltyPreview(data.data)
      setRedeemPoints(data.data.points_redeemed)
      setUseLoyalty(true)
      setCouponResult(null)
      setCouponCode('')
    } catch (error) {
      alert(error.response?.data?.message ?? 'Unable to redeem points.')
    }
  }

  if (loading) return null

  if (!cart.cart || cart.items.length === 0) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16">
        <EmptyState
          icon={ShoppingBag}
          title="Your cart is empty"
          description="Add some delicious food to get started."
          action={<Button onClick={() => navigate('/restaurants')}>Browse Restaurants</Button>}
        />
      </div>
    )
  }

  const subtotal = cart.pricingPreview?.subtotal ?? 0
  const deliveryFee = cart.pricingPreview?.delivery_fee ?? 0
  const discount = couponResult?.discount_amount ?? 0
  const loyaltyDiscount = loyaltyPreview?.discount_amount ?? 0
  const taxRatePct = settings?.tax_rate_pct ?? 5
  const taxableAmount = Math.max(0, subtotal - discount - loyaltyDiscount)
  const taxAmount = Math.round(taxableAmount * taxRatePct) / 100
  const total = Math.round((taxableAmount + deliveryFee + taxAmount) * 100) / 100
  const belowMinOrder = subtotal < (cart.cart.restaurant?.min_order_amount ?? 0)

  return (
    <motion.div {...pageTransitionVariants} className="mx-auto max-w-2xl px-4 py-6">
      <h1 className="mb-1 text-xl font-bold text-neutral-900">Your Cart</h1>
      <p className="mb-5 text-sm text-neutral-500">{cart.cart.restaurant?.name}</p>

      <div className="divide-y divide-neutral-100 rounded-lg border border-neutral-100 bg-white">
        <AnimatePresence>
          {cart.items.map((item) => (
            <motion.div key={item.id} {...cartItemVariants} className="flex items-center gap-3 p-4">
              <div className="flex-1">
                <p className="text-sm font-medium text-neutral-900">
                  {item.menu_item?.name}
                  {item.variant?.name && <span className="text-neutral-400"> ({item.variant.name})</span>}
                </p>
                <p className="text-xs text-neutral-500">₹{item.unit_price} each</p>
              </div>
              <div className="flex items-center gap-2 rounded-md border border-neutral-200 px-1">
                <button
                  onClick={() =>
                    item.quantity <= 1 ? cart.removeItem(item.id) : cart.updateItem(item.id, item.quantity - 1)
                  }
                  className="flex size-7 items-center justify-center text-neutral-600"
                >
                  <Minus size={14} />
                </button>
                <span className="w-4 text-center text-sm font-semibold">{item.quantity}</span>
                <button
                  onClick={() => cart.updateItem(item.id, item.quantity + 1)}
                  className="flex size-7 items-center justify-center text-neutral-600"
                >
                  <Plus size={14} />
                </button>
              </div>
              <button onClick={() => cart.removeItem(item.id)} className="text-neutral-400 hover:text-danger-500">
                <Trash2 size={16} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="mt-4 rounded-lg border border-neutral-100 bg-white p-4">
        {couponResult ? (
          <div className="flex items-center justify-between rounded-md bg-accent-500/10 px-3 py-2 text-sm">
            <span className="flex items-center gap-1.5 font-medium text-accent-600">
              <Tag size={14} /> {couponResult.code} applied — save ₹{couponResult.discount_amount}
            </span>
            <button
              onClick={() => {
                setCouponResult(null)
                setCouponCode('')
              }}
            >
              <X size={15} className="text-neutral-400" />
            </button>
          </div>
        ) : (
          <div className="flex gap-2">
            <input
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
              placeholder="Enter coupon code"
              className="h-10 flex-1 rounded-md border border-neutral-200 px-3 text-sm uppercase focus:border-brand-500 focus:outline-none"
            />
            <Button size="sm" variant="secondary" loading={applyingCoupon} onClick={applyCoupon}>
              Apply
            </Button>
          </div>
        )}
        {couponError && <p className="mt-1.5 text-xs text-danger-500">{couponError}</p>}

        {settings?.loyalty_enabled && loyaltyBalance > 0 && (
          <label className="mt-3 flex items-center justify-between border-t border-neutral-100 pt-3">
            <span className="flex items-center gap-1.5 text-sm text-neutral-700">
              <Gem size={15} className="text-brand-500" />
              Use loyalty points ({loyaltyBalance} available)
            </span>
            <input type="checkbox" checked={useLoyalty} onChange={toggleLoyalty} className="size-4 accent-brand-500" />
          </label>
        )}
      </div>

      <div className="mt-4 space-y-1.5 rounded-lg border border-neutral-100 bg-white p-4 text-sm">
        <div className="flex justify-between text-neutral-600">
          <span>Subtotal</span>
          <span>₹{subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-neutral-600">
          <span>Delivery Fee</span>
          <span>₹{deliveryFee.toFixed(2)}</span>
        </div>
        {discount > 0 && (
          <div className="flex justify-between text-accent-600">
            <span>Coupon Discount</span>
            <span>-₹{discount.toFixed(2)}</span>
          </div>
        )}
        {loyaltyDiscount > 0 && (
          <div className="flex justify-between text-accent-600">
            <span>Loyalty Points ({redeemPoints})</span>
            <span>-₹{loyaltyDiscount.toFixed(2)}</span>
          </div>
        )}
        <div className="flex justify-between text-neutral-600">
          <span>Tax</span>
          <span>₹{taxAmount.toFixed(2)}</span>
        </div>
        <div className="flex justify-between border-t border-neutral-100 pt-2 text-base font-bold text-neutral-900">
          <span>Total</span>
          <span>₹{total.toFixed(2)}</span>
        </div>
      </div>

      {belowMinOrder && (
        <p className="mt-3 text-center text-xs text-danger-500">
          Minimum order amount is ₹{cart.cart.restaurant?.min_order_amount}
        </p>
      )}

      <Button
        className="mt-4 w-full"
        size="lg"
        disabled={belowMinOrder}
        onClick={() =>
          navigate('/checkout', {
            state: { couponCode: couponResult?.code, loyaltyPoints: useLoyalty ? redeemPoints : 0 },
          })
        }
      >
        Proceed to Checkout
      </Button>
    </motion.div>
  )
}
