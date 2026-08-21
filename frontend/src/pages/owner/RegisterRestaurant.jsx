import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { UtensilsCrossed, Clock3, CheckCircle2, XCircle, Upload } from 'lucide-react'
import { ownerService } from '../../services/ownerService'
import { Input } from '../../components/Input'
import { Textarea } from '../../components/Textarea'
import { Button } from '../../components/Button'
import { pageTransitionVariants } from '../../lib/motion'

const CUISINES = ['Indian', 'Chinese', 'Pizza', 'Biryani', 'Burgers', 'Desserts', 'Italian', 'Mexican']

export default function RegisterRestaurant() {
  const navigate = useNavigate()
  const [checking, setChecking] = useState(true)
  const [restaurant, setRestaurant] = useState(null)

  useEffect(() => {
    ownerService
      .getRestaurant()
      .then(({ data }) => setRestaurant(data.data))
      .catch(() => setRestaurant(null))
      .finally(() => setChecking(false))
  }, [])

  useEffect(() => {
    if (restaurant?.is_active) navigate('/owner/dashboard', { replace: true })
  }, [restaurant, navigate])

  if (checking) return null

  if (restaurant && !restaurant.is_active) {
    return <StatusScreen restaurant={restaurant} />
  }

  return <SubmissionForm onSubmitted={setRestaurant} />
}

function StatusScreen({ restaurant }) {
  const rejected = !!restaurant.rejection_reason

  return (
    <motion.div {...pageTransitionVariants} className="flex min-h-screen items-center justify-center bg-neutral-50 px-4">
      <div className="w-full max-w-sm rounded-xl bg-white p-8 text-center shadow-card">
        {rejected ? (
          <>
            <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-danger-500/10 text-danger-500">
              <XCircle size={28} />
            </div>
            <h1 className="text-lg font-bold text-neutral-900">Application Not Approved</h1>
            <p className="mt-2 text-sm text-neutral-500">{restaurant.rejection_reason}</p>
          </>
        ) : (
          <>
            <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-warning-500/10 text-warning-500">
              <Clock3 size={28} />
            </div>
            <h1 className="text-lg font-bold text-neutral-900">Pending Approval</h1>
            <p className="mt-2 text-sm text-neutral-500">
              We're reviewing "{restaurant.name}". You'll be notified by email once it's approved.
            </p>
          </>
        )}
      </div>
    </motion.div>
  )
}

function SubmissionForm({ onSubmitted }) {
  const [form, setForm] = useState({
    name: '',
    description: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    phone: '',
    email: '',
    opening_time: '09:00',
    closing_time: '22:00',
    min_order_amount: '',
    delivery_fee: '',
    avg_delivery_time: '30',
    fssai_number: '',
    gst_number: '',
  })
  const [cuisines, setCuisines] = useState([])
  const [logo, setLogo] = useState(null)
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  const change = (field) => (e) => setForm((p) => ({ ...p, [field]: e.target.value }))

  const toggleCuisine = (c) => {
    setCuisines((prev) => (prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrors({})

    if (cuisines.length === 0) {
      setErrors({ cuisine_types: 'Select at least one cuisine.' })
      return
    }

    setLoading(true)
    const formData = new FormData()
    Object.entries(form).forEach(([key, value]) => formData.append(key, value))
    cuisines.forEach((c) => formData.append('cuisine_types[]', c))
    if (logo) formData.append('logo', logo)

    try {
      const { data } = await ownerService.submitRestaurant(formData)
      onSubmitted(data.data)
      toast.success('Restaurant submitted for approval!')
    } catch (error) {
      setErrors(error.response?.data?.errors ?? {})
    } finally {
      setLoading(false)
    }
  }

  const err = (field) => {
    const e = errors[field]
    return Array.isArray(e) ? e[0] : e
  }

  return (
    <motion.div {...pageTransitionVariants} className="mx-auto max-w-xl px-4 py-10">
      <div className="mb-6 text-center">
        <UtensilsCrossed size={32} className="mx-auto text-brand-500" />
        <h1 className="mt-3 text-xl font-bold text-neutral-900">Register Your Restaurant</h1>
        <p className="mt-1 text-sm text-neutral-500">Tell us about your restaurant to start receiving orders.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 rounded-xl bg-white p-6 shadow-card">
        <label className="flex cursor-pointer items-center gap-3 rounded-md border border-dashed border-neutral-300 p-3 text-sm text-neutral-500">
          <Upload size={16} />
          {logo ? logo.name : 'Upload logo (optional)'}
          <input type="file" accept="image/*" className="hidden" onChange={(e) => setLogo(e.target.files?.[0] ?? null)} />
        </label>

        <Input label="Restaurant Name" value={form.name} onChange={change('name')} error={err('name')} required />
        <Textarea label="Description" value={form.description} onChange={change('description')} rows={3} />

        <div>
          <p className="mb-1.5 text-sm font-medium text-neutral-700">Cuisine Types</p>
          <div className="flex flex-wrap gap-2">
            {CUISINES.map((c) => (
              <button
                type="button"
                key={c}
                onClick={() => toggleCuisine(c)}
                className={`rounded-full border px-3 py-1.5 text-xs font-medium ${
                  cuisines.includes(c) ? 'border-brand-500 bg-brand-50 text-brand-600' : 'border-neutral-200 text-neutral-600'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
          {err('cuisine_types') && <p className="mt-1.5 text-xs text-danger-500">{err('cuisine_types')}</p>}
        </div>

        <Input label="Address" value={form.address} onChange={change('address')} error={err('address')} required />
        <div className="grid grid-cols-2 gap-3">
          <Input label="City" value={form.city} onChange={change('city')} error={err('city')} required />
          <Input label="State" value={form.state} onChange={change('state')} error={err('state')} required />
        </div>
        <Input label="Pincode" value={form.pincode} onChange={change('pincode')} error={err('pincode')} required />

        <div className="grid grid-cols-2 gap-3">
          <Input label="Phone" value={form.phone} onChange={change('phone')} error={err('phone')} required />
          <Input label="Email" type="email" value={form.email} onChange={change('email')} error={err('email')} required />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Input label="Opening Time" type="time" value={form.opening_time} onChange={change('opening_time')} required />
          <Input label="Closing Time" type="time" value={form.closing_time} onChange={change('closing_time')} required />
        </div>

        <div className="grid grid-cols-3 gap-3">
          <Input label="Min Order (₹)" type="number" value={form.min_order_amount} onChange={change('min_order_amount')} />
          <Input label="Delivery Fee (₹)" type="number" value={form.delivery_fee} onChange={change('delivery_fee')} />
          <Input label="Delivery Time (min)" type="number" value={form.avg_delivery_time} onChange={change('avg_delivery_time')} />
        </div>

        <Input label="FSSAI Number" value={form.fssai_number} onChange={change('fssai_number')} error={err('fssai_number')} required />
        <Input label="GST Number (optional)" value={form.gst_number} onChange={change('gst_number')} />

        <Button type="submit" loading={loading} className="w-full">
          Submit for Approval
        </Button>
      </form>
    </motion.div>
  )
}
