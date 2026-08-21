import { useEffect, useRef, useState } from 'react'
import { useDispatch } from 'react-redux'
import toast from 'react-hot-toast'
import { Camera, Star, LogOut } from 'lucide-react'
import { deliveryService } from '../../services/deliveryService'
import { authService } from '../../services/authService'
import { logout } from '../../features/auth/authSlice'
import { Input } from '../../components/Input'
import { Select } from '../../components/Select'
import { Button } from '../../components/Button'

export default function DeliveryProfile() {
  const dispatch = useDispatch()
  const fileInputRef = useRef(null)
  const [profile, setProfile] = useState(null)
  const [form, setForm] = useState(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    deliveryService.profile().then(({ data }) => {
      setProfile(data.data)
      setForm({
        name: data.data.user?.name ?? '',
        phone: data.data.user?.phone ?? '',
        vehicle_type: data.data.vehicle_type,
        vehicle_number: data.data.vehicle_number,
      })
    })
  }, [])

  if (!profile || !form) return null

  const change = (field) => (e) => setForm((p) => ({ ...p, [field]: e.target.value }))

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    const formData = new FormData()
    Object.entries(form).forEach(([key, value]) => formData.append(key, value))
    try {
      const { data } = await deliveryService.updateProfile(formData)
      setProfile(data.data)
      toast.success('Profile updated.')
    } catch {
      toast.error('Could not update profile.')
    } finally {
      setSaving(false)
    }
  }

  const handlePhotoChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const formData = new FormData()
    formData.append('profile_image', file)
    try {
      await authService.updateProfile(formData)
      toast.success('Photo updated.')
    } catch {
      toast.error('Could not upload photo.')
    }
  }

  return (
    <div className="p-4">
      <div className="mb-5 flex flex-col items-center">
        <button onClick={() => fileInputRef.current?.click()} className="group relative">
          {profile.user?.profile_image ? (
            <img src={profile.user.profile_image} alt="" className="size-20 rounded-full object-cover" />
          ) : (
            <div className="flex size-20 items-center justify-center rounded-full bg-brand-50 text-2xl font-bold text-brand-500">
              {profile.user?.name?.[0]}
            </div>
          )}
          <span className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 text-white opacity-0 transition group-hover:opacity-100">
            <Camera size={18} />
          </span>
        </button>
        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
        <p className="mt-2 flex items-center gap-1 text-sm font-medium text-neutral-900">
          <Star size={13} fill="currentColor" className="text-warning-500" />
          {Number(profile.avg_rating).toFixed(1)} rating
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-3 rounded-xl border border-neutral-100 bg-white p-4">
        <Input label="Full Name" value={form.name} onChange={change('name')} />
        <Input label="Phone" value={form.phone} onChange={change('phone')} />
        <Select label="Vehicle Type" value={form.vehicle_type} onChange={change('vehicle_type')}>
          <option value="bicycle">Bicycle</option>
          <option value="motorcycle">Motorcycle</option>
          <option value="scooter">Scooter</option>
        </Select>
        <Input label="Vehicle Number" value={form.vehicle_number} onChange={change('vehicle_number')} />
        <Button type="submit" loading={saving} className="w-full">
          Save Changes
        </Button>
      </form>

      <button
        onClick={() => dispatch(logout())}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg border border-danger-200 py-3 text-sm font-semibold text-danger-500"
      >
        <LogOut size={15} /> Log Out
      </button>
    </div>
  )
}
