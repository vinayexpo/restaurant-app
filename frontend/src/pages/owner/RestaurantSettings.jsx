import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import toast from 'react-hot-toast'
import { Upload } from 'lucide-react'
import { ownerService } from '../../services/ownerService'
import { setOwnerRestaurant } from '../../features/owner/ownerSlice'
import { Input } from '../../components/Input'
import { Textarea } from '../../components/Textarea'
import { Button } from '../../components/Button'

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const CUISINES = ['Indian', 'Chinese', 'Pizza', 'Biryani', 'Burgers', 'Desserts', 'Italian', 'Mexican']

export default function RestaurantSettings() {
  const dispatch = useDispatch()
  const restaurant = useSelector((state) => state.owner.restaurant)

  const [form, setForm] = useState(null)
  const [customCuisine, setCustomCuisine] = useState('')
  const [logo, setLogo] = useState(null)
  const [coverImage, setCoverImage] = useState(null)
  const [saving, setSaving] = useState(false)
  const [hours, setHours] = useState(
    DAYS.map((_, i) => ({ day_of_week: i, opening_time: '09:00', closing_time: '22:00', is_closed: false }))
  )
  const [savingHours, setSavingHours] = useState(false)

  useEffect(() => {
    if (restaurant) {
      setForm({
        name: restaurant.name,
        description: restaurant.description ?? '',
        address: restaurant.address,
        city: restaurant.city,
        state: restaurant.state,
        pincode: restaurant.pincode,
        phone: restaurant.phone,
        email: restaurant.email,
        cuisine_types: restaurant.cuisine_types ?? [],
        fssai_number: restaurant.fssai_number ?? '',
        gst_number: restaurant.gst_number ?? '',
        min_order_amount: restaurant.min_order_amount,
        delivery_fee: restaurant.delivery_fee,
        avg_delivery_time: restaurant.avg_delivery_time,
        is_open: restaurant.is_open,
      })
    }
    ownerService.getHours().then(({ data }) => {
      if (data.data.length === 7) {
        setHours(data.data.map((h) => ({ ...h, opening_time: h.opening_time.slice(0, 5), closing_time: h.closing_time.slice(0, 5) })))
      }
    })
  }, [restaurant])

  if (!form) return null

  const change = (field) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setForm((p) => ({ ...p, [field]: value }))
  }

  const toggleCuisine = (cuisine) => {
    setForm((current) => ({
      ...current,
      cuisine_types: current.cuisine_types.includes(cuisine)
        ? current.cuisine_types.filter((item) => item !== cuisine)
        : [...current.cuisine_types, cuisine],
    }))
  }

  const addCuisine = () => {
    const cuisine = customCuisine.trim()
    if (!cuisine) return
    setForm((current) => ({
      ...current,
      cuisine_types: current.cuisine_types.includes(cuisine) ? current.cuisine_types : [...current.cuisine_types, cuisine],
    }))
    setCustomCuisine('')
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    const formData = new FormData()
    Object.entries(form).forEach(([key, value]) => {
      if (key === 'cuisine_types') {
        value.forEach((cuisine) => formData.append('cuisine_types[]', cuisine))
      } else {
        formData.append(key, key === 'is_open' ? (value ? '1' : '0') : value)
      }
    })
    if (logo) formData.append('logo', logo)
    if (coverImage) formData.append('cover_image', coverImage)
    try {
      const { data } = await ownerService.updateRestaurant(formData)
      dispatch(setOwnerRestaurant(data.data))
      setLogo(null)
      setCoverImage(null)
      toast.success('Settings saved.')
    } catch {
      toast.error('Could not save settings.')
    } finally {
      setSaving(false)
    }
  }

  const changeHour = (index, field, value) => {
    setHours((prev) => prev.map((h, i) => (i === index ? { ...h, [field]: value } : h)))
  }

  const saveHours = async () => {
    setSavingHours(true)
    try {
      await ownerService.updateHours(hours)
      toast.success('Operating hours updated.')
    } catch {
      toast.error('Could not save hours.')
    } finally {
      setSavingHours(false)
    }
  }

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <form onSubmit={handleSave} className="space-y-4 rounded-xl border border-neutral-100 bg-white p-5">
        <h2 className="text-sm font-bold text-neutral-900">Restaurant Info</h2>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="mb-1.5 text-xs font-semibold uppercase text-neutral-400">Logo</p>
            <label className="flex cursor-pointer flex-col items-center gap-2 rounded-md border border-dashed border-neutral-300 p-3 text-center text-xs text-neutral-500">
              {logo ? (
                <img src={URL.createObjectURL(logo)} alt="" className="size-16 rounded-full object-cover" />
              ) : restaurant?.logo ? (
                <img src={restaurant.logo} alt="" className="size-16 rounded-full object-cover" />
              ) : (
                <Upload size={20} className="text-neutral-400" />
              )}
              {logo ? logo.name : restaurant?.logo ? 'Change logo' : 'Upload logo'}
              <input type="file" accept="image/*" className="hidden" onChange={(e) => setLogo(e.target.files?.[0] ?? null)} />
            </label>
          </div>
          <div>
            <p className="mb-1.5 text-xs font-semibold uppercase text-neutral-400">Cover Photo</p>
            <label className="flex cursor-pointer flex-col items-center gap-2 rounded-md border border-dashed border-neutral-300 p-3 text-center text-xs text-neutral-500">
              {coverImage ? (
                <img src={URL.createObjectURL(coverImage)} alt="" className="h-16 w-full rounded-md object-cover" />
              ) : restaurant?.cover_image ? (
                <img src={restaurant.cover_image} alt="" className="h-16 w-full rounded-md object-cover" />
              ) : (
                <Upload size={20} className="text-neutral-400" />
              )}
              {coverImage ? coverImage.name : restaurant?.cover_image ? 'Change cover photo' : 'Upload cover photo'}
              <input type="file" accept="image/*" className="hidden" onChange={(e) => setCoverImage(e.target.files?.[0] ?? null)} />
            </label>
          </div>
        </div>

        <label className="flex items-center justify-between rounded-md bg-neutral-50 px-3.5 py-2.5">
          <span className="text-sm font-medium text-neutral-700">Restaurant Active</span>
          <input type="checkbox" checked={form.is_open} onChange={change('is_open')} className="accent-brand-500" />
        </label>

        <Input label="Name" value={form.name} onChange={change('name')} required />
        <Textarea label="Description" value={form.description} onChange={change('description')} rows={3} />
        <div>
          <p className="mb-1.5 text-sm font-medium text-neutral-700">Cuisine Types</p>
          <div className="flex flex-wrap gap-2">
            {Array.from(new Set([...CUISINES, ...form.cuisine_types])).map((cuisine) => (
              <button
                type="button"
                key={cuisine}
                onClick={() => toggleCuisine(cuisine)}
                className={`rounded-full border px-3 py-1.5 text-xs font-medium ${
                  form.cuisine_types.includes(cuisine) ? 'border-brand-500 bg-brand-50 text-brand-600' : 'border-neutral-200 text-neutral-600'
                }`}
              >
                {cuisine}
              </button>
            ))}
          </div>
          <div className="mt-2 flex gap-2">
            <input
              value={customCuisine}
              onChange={(e) => setCustomCuisine(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  addCuisine()
                }
              }}
              placeholder="Add another cuisine"
              className="h-9 flex-1 rounded-md border border-neutral-200 px-3 text-sm"
            />
            <Button type="button" size="sm" variant="secondary" onClick={addCuisine}>Add</Button>
          </div>
        </div>
        <Input label="Address" value={form.address} onChange={change('address')} required />
        <div className="grid grid-cols-2 gap-3">
          <Input label="City" value={form.city} onChange={change('city')} required />
          <Input label="State" value={form.state} onChange={change('state')} required />
        </div>
        <Input label="Pincode" value={form.pincode} onChange={change('pincode')} required />
        <div className="grid grid-cols-2 gap-3">
          <Input label="Phone" value={form.phone} onChange={change('phone')} required />
          <Input label="Email" type="email" value={form.email} onChange={change('email')} required />
        </div>
        <div className="grid grid-cols-3 gap-3">
          <Input label="Min Order (₹)" type="number" value={form.min_order_amount} onChange={change('min_order_amount')} />
          <Input label="Delivery Fee (₹)" type="number" value={form.delivery_fee} onChange={change('delivery_fee')} />
          <Input label="Delivery Time (min)" type="number" value={form.avg_delivery_time} onChange={change('avg_delivery_time')} />
        </div>
        <div className="rounded-md border border-warning-200 bg-warning-50 p-3">
          <p className="text-xs font-semibold text-warning-700">Compliance details</p>
          <p className="mt-1 text-xs text-warning-700">Changing the FSSAI or GST number submits the restaurant for reapproval.</p>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <Input label="FSSAI Number" value={form.fssai_number} onChange={change('fssai_number')} required />
            <Input label="GST Number" value={form.gst_number} onChange={change('gst_number')} />
          </div>
        </div>

        <Button type="submit" loading={saving} className="w-full">
          Save Changes
        </Button>
      </form>

      <div className="rounded-xl border border-neutral-100 bg-white p-5">
        <h2 className="mb-3 text-sm font-bold text-neutral-900">Weekly Hours</h2>
        <div className="space-y-2">
          {hours.map((h, i) => (
            <div key={h.day_of_week} className="flex items-center gap-2">
              <span className="w-20 shrink-0 text-xs font-medium text-neutral-600">{DAYS[h.day_of_week]}</span>
              <input
                type="time"
                value={h.opening_time}
                disabled={h.is_closed}
                onChange={(e) => changeHour(i, 'opening_time', e.target.value)}
                className="h-9 flex-1 rounded-md border border-neutral-200 px-2 text-xs disabled:opacity-40"
              />
              <input
                type="time"
                value={h.closing_time}
                disabled={h.is_closed}
                onChange={(e) => changeHour(i, 'closing_time', e.target.value)}
                className="h-9 flex-1 rounded-md border border-neutral-200 px-2 text-xs disabled:opacity-40"
              />
              <label className="flex shrink-0 items-center gap-1 text-xs text-neutral-500">
                <input type="checkbox" checked={h.is_closed} onChange={(e) => changeHour(i, 'is_closed', e.target.checked)} className="accent-danger-500" />
                Closed
              </label>
            </div>
          ))}
        </div>
        <Button size="sm" className="mt-4" loading={savingHours} onClick={saveHours}>
          Save Hours
        </Button>
      </div>
    </div>
  )
}
