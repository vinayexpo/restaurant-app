import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { MapPin, Plus, CreditCard, Banknote } from 'lucide-react'
import api from '../../lib/axios'
import { useCart } from '../../hooks/useCart'
import { useRazorpay } from '../../hooks/useRazorpay'
import { orderService } from '../../services/orderService'
import { Button } from '../../components/Button'
import { Input } from '../../components/Input'
import { Select } from '../../components/Select'
import { Modal } from '../../components/Modal'
import { LocationPicker } from '../../components/LocationPicker'
import { pageTransitionVariants } from '../../lib/motion'

export default function Checkout() {
  const navigate = useNavigate()
  const location = useLocation()
  const cart = useCart()
  const { openCheckout } = useRazorpay()
  const { user } = useSelector((state) => state.auth)
  const settings = useSelector((state) => state.ui.settings)

  const { couponCode, loyaltyPoints = 0 } = location.state ?? {}

  const [addresses, setAddresses] = useState([])
  const [selectedAddressId, setSelectedAddressId] = useState(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [newAddress, setNewAddress] = useState({
    label: 'Home',
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    pincode: '',
    latitude: null,
    longitude: null,
    is_default: false,
  })
  const [addressErrors, setAddressErrors] = useState({})
  const [savingAddress, setSavingAddress] = useState(false)
  const touchedAddressFieldsRef = useRef(new Set())

  const [paymentMethod, setPaymentMethod] = useState('razorpay')
  const [placingOrder, setPlacingOrder] = useState(false)
  const [specialInstructions, setSpecialInstructions] = useState('')

  useEffect(() => {
    cart.refresh()
    api.get('/addresses').then(({ data }) => {
      setAddresses(data.data)
      const defaultAddr = data.data.find((a) => a.is_default) ?? data.data[0]
      if (defaultAddr) setSelectedAddressId(defaultAddr.id)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const subtotal = cart.pricingPreview?.subtotal ?? 0
  const deliveryFee = cart.pricingPreview?.delivery_fee ?? 0
  const taxRatePct = settings?.tax_rate_pct ?? 5
  const total = Math.round((subtotal + deliveryFee) * (1 + taxRatePct / 100) * 100) / 100

  const handleAddAddress = async (e) => {
    e.preventDefault()
    setSavingAddress(true)
    setAddressErrors({})
    try {
      const { data } = await api.post('/addresses', newAddress)
      setAddresses((prev) => [...prev, data.data])
      setSelectedAddressId(data.data.id)
      setShowAddModal(false)
      setNewAddress({ label: 'Home', address_line1: '', address_line2: '', city: '', state: '', pincode: '', latitude: null, longitude: null, is_default: false })
      touchedAddressFieldsRef.current = new Set()
    } catch (error) {
      setAddressErrors(error.response?.data?.errors ?? {})
    } finally {
      setSavingAddress(false)
    }
  }

  const verifyPayload = (extra = {}) => ({
    address_id: selectedAddressId,
    coupon_code: couponCode ?? null,
    loyalty_points: loyaltyPoints,
    special_instructions: specialInstructions || null,
    ...extra,
  })

  const handlePlaceOrder = async () => {
    if (!selectedAddressId) {
      toast.error('Please select a delivery address.')
      return
    }

    setPlacingOrder(true)

    try {
      if (paymentMethod === 'cod') {
        const { data } = await orderService.paymentVerify(verifyPayload({ payment_method: 'cod' }))
        navigate(`/orders/${data.data.order_id}`)
        return
      }

      const { data: initData } = await orderService.paymentInitiate(total)

      openCheckout({
        rzpOrderId: initData.data.rzp_order_id,
        amountPaise: initData.data.amount_paise,
        currency: initData.data.currency,
        keyId: initData.data.key_id,
        prefill: { name: user?.name, email: user?.email, phone: user?.phone },
        onSuccess: async (rzpResponse) => {
          try {
            const { data } = await orderService.paymentVerify(
              verifyPayload({
                payment_method: 'razorpay',
                rzp_order_id: rzpResponse.razorpay_order_id,
                rzp_payment_id: rzpResponse.razorpay_payment_id,
                rzp_signature: rzpResponse.razorpay_signature,
              })
            )
            navigate(`/orders/${data.data.order_id}`)
          } catch {
            toast.error('Payment succeeded but order could not be placed. Contact support.')
          } finally {
            setPlacingOrder(false)
          }
        },
        onFailure: () => {
          toast.error('Payment cancelled or failed. Please try again.')
          setPlacingOrder(false)
        },
      })
      return
    } catch (error) {
      toast.error(error.response?.data?.message ?? 'Could not place order.')
    }
    setPlacingOrder(false)
  }

  if (!cart.cart) return null

  return (
    <motion.div {...pageTransitionVariants} className="mx-auto max-w-4xl px-4 py-6 lg:flex lg:gap-8">
      <div className="flex-1 space-y-6">
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-base font-bold text-neutral-900">Delivery Address</h2>
            <button
              onClick={() => {
                touchedAddressFieldsRef.current = new Set()
                setShowAddModal(true)
              }}
              className="flex items-center gap-1 text-sm font-semibold text-brand-600"
            >
              <Plus size={14} /> Add New
            </button>
          </div>
          <div className="space-y-2">
            {addresses.map((addr) => (
              <label
                key={addr.id}
                className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3.5 ${
                  selectedAddressId === addr.id ? 'border-brand-500 bg-brand-50/50' : 'border-neutral-200 bg-white'
                }`}
              >
                <input
                  type="radio"
                  checked={selectedAddressId === addr.id}
                  onChange={() => setSelectedAddressId(addr.id)}
                  className="mt-1 accent-brand-500"
                />
                <MapPin size={16} className="mt-0.5 shrink-0 text-neutral-400" />
                <div>
                  <p className="text-sm font-semibold text-neutral-900">
                    {addr.label} {addr.is_default && <span className="text-xs font-normal text-brand-600">(Default)</span>}
                  </p>
                  <p className="text-xs text-neutral-500">
                    {addr.address_line1}, {addr.city}, {addr.state} {addr.pincode}
                  </p>
                </div>
              </label>
            ))}
            {addresses.length === 0 && <p className="text-sm text-neutral-500">No saved addresses. Add one to continue.</p>}
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-base font-bold text-neutral-900">Payment Method</h2>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setPaymentMethod('razorpay')}
              className={`flex items-center gap-2 rounded-lg border p-3.5 text-sm font-medium ${
                paymentMethod === 'razorpay' ? 'border-brand-500 bg-brand-50/50 text-brand-600' : 'border-neutral-200 text-neutral-600'
              }`}
            >
              <CreditCard size={16} /> Card / UPI
            </button>
            <button
              onClick={() => setPaymentMethod('cod')}
              className={`flex items-center gap-2 rounded-lg border p-3.5 text-sm font-medium ${
                paymentMethod === 'cod' ? 'border-brand-500 bg-brand-50/50 text-brand-600' : 'border-neutral-200 text-neutral-600'
              }`}
            >
              <Banknote size={16} /> Cash on Delivery
            </button>
          </div>
        </section>

        <section>
          <Input
            label="Special Instructions (optional)"
            value={specialInstructions}
            onChange={(e) => setSpecialInstructions(e.target.value)}
            placeholder="E.g. ring the bell, no onions..."
          />
        </section>
      </div>

      <aside className="mt-6 w-full lg:mt-0 lg:w-72 lg:shrink-0">
        <div className="sticky top-20 rounded-lg border border-neutral-100 bg-white p-4">
          <h3 className="mb-3 text-sm font-bold text-neutral-900">Order Summary</h3>
          <div className="space-y-1.5 text-sm text-neutral-600">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>₹{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Delivery Fee</span>
              <span>₹{deliveryFee.toFixed(2)}</span>
            </div>
            <div className="flex justify-between border-t border-neutral-100 pt-2 text-base font-bold text-neutral-900">
              <span>Total</span>
              <span>₹{total.toFixed(2)}</span>
            </div>
          </div>
          <Button className="mt-4 w-full" size="lg" loading={placingOrder} onClick={handlePlaceOrder}>
            Place Order
          </Button>
        </div>
      </aside>

      <Modal open={showAddModal} onClose={() => setShowAddModal(false)} title="Add New Address">
        <form onSubmit={handleAddAddress} className="space-y-3">
          <LocationPicker
            onChange={(loc) =>
              setNewAddress((p) => {
                const touched = touchedAddressFieldsRef.current
                return {
                  ...p,
                  latitude: loc.latitude,
                  longitude: loc.longitude,
                  ...(loc.address_line1 !== undefined && {
                    address_line1: touched.has('address_line1') ? p.address_line1 : loc.address_line1 || p.address_line1,
                    city: touched.has('city') ? p.city : loc.city,
                    state: touched.has('state') ? p.state : loc.state,
                    pincode: touched.has('pincode') ? p.pincode : loc.pincode,
                  }),
                }
              })
            }
          />
          <Select label="Label" value={newAddress.label} onChange={(e) => setNewAddress((p) => ({ ...p, label: e.target.value }))}>
            <option value="Home">Home</option>
            <option value="Work">Work</option>
            <option value="Other">Other</option>
          </Select>
          <Input
            label="Address Line 1"
            value={newAddress.address_line1}
            onChange={(e) => {
              touchedAddressFieldsRef.current.add('address_line1')
              setNewAddress((p) => ({ ...p, address_line1: e.target.value }))
            }}
            error={addressErrors.address_line1?.[0]}
            required
          />
          <Input
            label="Address Line 2 (optional)"
            value={newAddress.address_line2}
            onChange={(e) => setNewAddress((p) => ({ ...p, address_line2: e.target.value }))}
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="City"
              value={newAddress.city}
              onChange={(e) => {
                touchedAddressFieldsRef.current.add('city')
                setNewAddress((p) => ({ ...p, city: e.target.value }))
              }}
              error={addressErrors.city?.[0]}
              required
            />
            <Input
              label="State"
              value={newAddress.state}
              onChange={(e) => {
                touchedAddressFieldsRef.current.add('state')
                setNewAddress((p) => ({ ...p, state: e.target.value }))
              }}
              error={addressErrors.state?.[0]}
              required
            />
          </div>
          <Input
            label="Pincode"
            value={newAddress.pincode}
            onChange={(e) => {
              touchedAddressFieldsRef.current.add('pincode')
              setNewAddress((p) => ({ ...p, pincode: e.target.value }))
            }}
            error={addressErrors.pincode?.[0]}
            required
          />
          <label className="flex items-center gap-2 text-sm text-neutral-700">
            <input
              type="checkbox"
              checked={newAddress.is_default}
              onChange={(e) => setNewAddress((p) => ({ ...p, is_default: e.target.checked }))}
              className="accent-brand-500"
            />
            Set as default address
          </label>
          <Button type="submit" loading={savingAddress} className="w-full">
            Save Address
          </Button>
        </form>
      </Modal>
    </motion.div>
  )
}
