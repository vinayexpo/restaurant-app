import { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { User, MapPin, Heart, Bell, BellOff, Camera, Plus, Trash2, Gem, LogOut, Check } from 'lucide-react'
import { authService } from '../../services/authService'
import { usePushNotifications } from '../../hooks/usePushNotifications'
import api from '../../lib/axios'
import { setUser, logout } from '../../features/auth/authSlice'
import { Input } from '../../components/Input'
import { Button } from '../../components/Button'
import { Select } from '../../components/Select'
import { Modal } from '../../components/Modal'
import { EmptyState } from '../../components/EmptyState'
import { Pagination } from '../../components/Pagination'
import { LocationPicker } from '../../components/LocationPicker'
import { pageTransitionVariants } from '../../lib/motion'

const TABS = [
  { key: 'account', label: 'Account', icon: User },
  { key: 'addresses', label: 'Addresses', icon: MapPin },
  { key: 'favourites', label: 'Favourites', icon: Heart },
  { key: 'notifications', label: 'Notifications', icon: Bell },
]

export default function Profile() {
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.auth)
  const [tab, setTab] = useState('account')

  return (
    <motion.div {...pageTransitionVariants} className="mx-auto max-w-2xl px-4 py-6">
      <h1 className="mb-5 text-xl font-bold text-neutral-900">Profile</h1>

      <div className="mb-5 flex gap-1 overflow-x-auto border-b border-neutral-200">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex shrink-0 items-center gap-1.5 border-b-2 px-3 py-2.5 text-sm font-medium ${
              tab === key ? 'border-brand-500 text-brand-600' : 'border-transparent text-neutral-500'
            }`}
          >
            <Icon size={15} /> {label}
          </button>
        ))}
      </div>

      {tab === 'account' && <AccountTab user={user} onLogout={() => dispatch(logout())} setUser={(u) => dispatch(setUser(u))} />}
      {tab === 'addresses' && <AddressesTab />}
      {tab === 'favourites' && <FavouritesTab />}
      {tab === 'notifications' && <NotificationsTab />}
    </motion.div>
  )
}

function AccountTab({ user, onLogout, setUser }) {
  const fileInputRef = useRef(null)
  const [name, setName] = useState(user?.name ?? '')
  const [phone, setPhone] = useState(user?.phone ?? '')
  const [saving, setSaving] = useState(false)

  const [passwordForm, setPasswordForm] = useState({ current_password: '', new_password: '', new_password_confirmation: '' })
  const [passwordErrors, setPasswordErrors] = useState({})
  const [changingPassword, setChangingPassword] = useState(false)

  const handleSaveProfile = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const { data } = await authService.updateProfile({ name, phone })
      setUser(data.data)
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
      const { data } = await authService.updateProfile(formData)
      setUser(data.data)
      toast.success('Profile photo updated.')
    } catch {
      toast.error('Could not upload photo.')
    }
  }

  const handleChangePassword = async (e) => {
    e.preventDefault()
    setPasswordErrors({})
    setChangingPassword(true)
    try {
      await authService.changePassword({
        current_password: passwordForm.current_password,
        new_password: passwordForm.new_password,
        new_password_confirmation: passwordForm.new_password_confirmation,
      })
      toast.success('Password changed successfully.')
      setPasswordForm({ current_password: '', new_password: '', new_password_confirmation: '' })
    } catch (error) {
      setPasswordErrors(error.response?.data?.errors ?? { current_password: error.response?.data?.message })
    } finally {
      setChangingPassword(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 rounded-lg border border-neutral-100 bg-white p-4">
        <button onClick={() => fileInputRef.current?.click()} className="group relative">
          {user?.profile_image ? (
            <img src={user.profile_image} alt="" className="size-16 rounded-full object-cover" />
          ) : (
            <div className="flex size-16 items-center justify-center rounded-full bg-brand-50 text-xl font-bold text-brand-500">
              {user?.name?.[0]}
            </div>
          )}
          <span className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 text-white opacity-0 transition group-hover:opacity-100">
            <Camera size={16} />
          </span>
        </button>
        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
        <div>
          <p className="text-sm font-semibold text-neutral-900">{user?.name}</p>
          <p className="text-xs text-neutral-500">{user?.email}</p>
        </div>
      </div>

      <form onSubmit={handleSaveProfile} className="space-y-3 rounded-lg border border-neutral-100 bg-white p-4">
        <h3 className="text-sm font-bold text-neutral-900">Personal Info</h3>
        <Input label="Full Name" value={name} onChange={(e) => setName(e.target.value)} />
        <Input label="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
        <Button type="submit" loading={saving} size="sm">
          Save Changes
        </Button>
      </form>

      <form onSubmit={handleChangePassword} className="space-y-3 rounded-lg border border-neutral-100 bg-white p-4">
        <h3 className="text-sm font-bold text-neutral-900">Change Password</h3>
        <Input
          label="Current Password"
          type="password"
          value={passwordForm.current_password}
          onChange={(e) => setPasswordForm((p) => ({ ...p, current_password: e.target.value }))}
          error={passwordErrors.current_password?.[0] ?? passwordErrors.current_password}
        />
        <Input
          label="New Password"
          type="password"
          value={passwordForm.new_password}
          onChange={(e) => setPasswordForm((p) => ({ ...p, new_password: e.target.value }))}
          error={passwordErrors.new_password?.[0]}
        />
        <Input
          label="Confirm New Password"
          type="password"
          value={passwordForm.new_password_confirmation}
          onChange={(e) => setPasswordForm((p) => ({ ...p, new_password_confirmation: e.target.value }))}
        />
        <Button type="submit" loading={changingPassword} size="sm">
          Update Password
        </Button>
      </form>

      <PushNotificationCard />

      <Link to="/profile/loyalty" className="flex items-center justify-between rounded-lg border border-neutral-100 bg-white p-4 text-sm font-semibold text-neutral-900">
        <span className="flex items-center gap-2">
          <Gem size={16} className="text-brand-500" /> Loyalty Points
        </span>
        <span className="text-neutral-400">&rsaquo;</span>
      </Link>

      <button onClick={onLogout} className="flex w-full items-center justify-center gap-2 rounded-lg border border-danger-200 py-3 text-sm font-semibold text-danger-500">
        <LogOut size={15} /> Log Out
      </button>
    </div>
  )
}

function PushNotificationCard() {
  const { permission, loading, enable, disable, isSupported } = usePushNotifications()

  if (!isSupported) return null

  const enabled = permission === 'granted'

  return (
    <div className="flex items-center justify-between rounded-lg border border-neutral-100 bg-white p-4">
      <div className="flex items-center gap-3">
        {enabled ? <Bell size={18} className="text-brand-500" /> : <BellOff size={18} className="text-neutral-400" />}
        <div>
          <p className="text-sm font-semibold text-neutral-900">Push Notifications</p>
          <p className="text-xs text-neutral-500">
            {permission === 'denied'
              ? 'Blocked in browser settings.'
              : enabled
                ? 'Get notified about order updates.'
                : 'Turn on to get order updates instantly.'}
          </p>
        </div>
      </div>
      {permission !== 'denied' && (
        <Button size="sm" variant={enabled ? 'secondary' : 'primary'} loading={loading} onClick={enabled ? disable : enable}>
          {enabled ? 'Disable' : 'Enable'}
        </Button>
      )}
    </div>
  )
}

function AddressesTab() {
  const [addresses, setAddresses] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({
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
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const touchedFieldsRef = useRef(new Set())

  const load = () => api.get('/addresses').then(({ data }) => setAddresses(data.data))

  useEffect(() => {
    load().finally(() => setLoading(false))
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setErrors({})
    try {
      await api.post('/addresses', form)
      setShowModal(false)
      setForm({ label: 'Home', address_line1: '', address_line2: '', city: '', state: '', pincode: '', latitude: null, longitude: null, is_default: false })
      touchedFieldsRef.current = new Set()
      load()
    } catch (error) {
      setErrors(error.response?.data?.errors ?? {})
    } finally {
      setSaving(false)
    }
  }

  const setDefault = async (id) => {
    await api.patch(`/addresses/${id}/set-default`)
    load()
  }

  const remove = async (id) => {
    await api.delete(`/addresses/${id}`)
    load()
  }

  if (loading) return null

  return (
    <div>
      <div className="mb-3 flex justify-end">
        <Button
          size="sm"
          onClick={() => {
            touchedFieldsRef.current = new Set()
            setShowModal(true)
          }}
        >
          <Plus size={14} /> Add Address
        </Button>
      </div>

      {addresses.length === 0 ? (
        <EmptyState icon={MapPin} title="No saved addresses" description="Add an address for faster checkout." />
      ) : (
        <div className="space-y-2">
          {addresses.map((addr) => (
            <div key={addr.id} className="flex items-start justify-between rounded-lg border border-neutral-100 bg-white p-3.5">
              <div>
                <p className="text-sm font-semibold text-neutral-900">
                  {addr.label} {addr.is_default && <span className="text-xs font-normal text-brand-600">(Default)</span>}
                </p>
                <p className="text-xs text-neutral-500">
                  {addr.address_line1}, {addr.city}, {addr.state} {addr.pincode}
                </p>
              </div>
              <div className="flex shrink-0 gap-2">
                {!addr.is_default && (
                  <button onClick={() => setDefault(addr.id)} className="text-xs font-medium text-brand-600">
                    Set Default
                  </button>
                )}
                <button onClick={() => remove(addr.id)} className="text-neutral-400 hover:text-danger-500">
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Add Address">
        <form onSubmit={handleSubmit} className="space-y-3">
          <LocationPicker
            onChange={(loc) =>
              setForm((p) => {
                const touched = touchedFieldsRef.current
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
          <Select label="Label" value={form.label} onChange={(e) => setForm((p) => ({ ...p, label: e.target.value }))}>
            <option value="Home">Home</option>
            <option value="Work">Work</option>
            <option value="Other">Other</option>
          </Select>
          <Input
            label="Address Line 1"
            value={form.address_line1}
            onChange={(e) => {
              touchedFieldsRef.current.add('address_line1')
              setForm((p) => ({ ...p, address_line1: e.target.value }))
            }}
            error={errors.address_line1?.[0]}
            required
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="City"
              value={form.city}
              onChange={(e) => {
                touchedFieldsRef.current.add('city')
                setForm((p) => ({ ...p, city: e.target.value }))
              }}
              error={errors.city?.[0]}
              required
            />
            <Input
              label="State"
              value={form.state}
              onChange={(e) => {
                touchedFieldsRef.current.add('state')
                setForm((p) => ({ ...p, state: e.target.value }))
              }}
              error={errors.state?.[0]}
              required
            />
          </div>
          <Input
            label="Pincode"
            value={form.pincode}
            onChange={(e) => {
              touchedFieldsRef.current.add('pincode')
              setForm((p) => ({ ...p, pincode: e.target.value }))
            }}
            error={errors.pincode?.[0]}
            required
          />
          <Button type="submit" loading={saving} className="w-full">
            Save Address
          </Button>
        </form>
      </Modal>
    </div>
  )
}

function FavouritesTab() {
  const [favourites, setFavourites] = useState([])
  const [loading, setLoading] = useState(true)

  const load = () => api.get('/favourites').then(({ data }) => setFavourites(data.data))

  useEffect(() => {
    load().finally(() => setLoading(false))
  }, [])

  const remove = async (restaurantId) => {
    await api.delete(`/favourites/${restaurantId}`)
    setFavourites((prev) => prev.filter((f) => f.restaurant_id !== restaurantId))
  }

  if (loading) return null

  if (favourites.length === 0) {
    return <EmptyState icon={Heart} title="No favourites yet" description="Heart restaurants you love to find them here." />
  }

  return (
    <div className="space-y-2">
      {favourites.map((fav) => (
        <div key={fav.id} className="flex items-center justify-between rounded-lg border border-neutral-100 bg-white p-3.5">
          <Link to={`/restaurants/${fav.restaurant?.slug}`} className="text-sm font-medium text-neutral-900">
            {fav.restaurant?.name}
          </Link>
          <button onClick={() => remove(fav.restaurant_id)} className="text-danger-500">
            <Heart size={16} fill="currentColor" />
          </button>
        </div>
      ))}
    </div>
  )
}

function NotificationsTab() {
  const [notifications, setNotifications] = useState([])
  const [meta, setMeta] = useState({ page: 1, last_page: 1 })
  const [loading, setLoading] = useState(true)

  const load = (page = 1) =>
    api.get('/notifications', { params: { page } }).then(({ data }) => {
      setNotifications(data.data)
      setMeta(data.meta)
    })

  useEffect(() => {
    load().finally(() => setLoading(false))
  }, [])

  const markRead = async (id) => {
    await api.patch(`/notifications/${id}/read`)
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read_at: new Date().toISOString() } : n)))
  }

  const markAllRead = async () => {
    await api.patch('/notifications/read-all')
    setNotifications((prev) => prev.map((n) => ({ ...n, read_at: new Date().toISOString() })))
  }

  if (loading) return null

  if (notifications.length === 0) {
    return <EmptyState icon={Bell} title="No notifications" description="You're all caught up." />
  }

  return (
    <div>
      <div className="mb-3 flex justify-end">
        <button onClick={markAllRead} className="flex items-center gap-1 text-xs font-semibold text-brand-600">
          <Check size={13} /> Mark all as read
        </button>
      </div>
      <div className="space-y-2">
        {notifications.map((n) => (
          <button
            key={n.id}
            onClick={() => !n.read_at && markRead(n.id)}
            className={`w-full rounded-lg border p-3.5 text-left ${n.read_at ? 'border-neutral-100 bg-white' : 'border-brand-200 bg-brand-50/50'}`}
          >
            <p className="text-sm font-semibold text-neutral-900">{n.title}</p>
            <p className="text-xs text-neutral-500">{n.body}</p>
          </button>
        ))}
      </div>
      <Pagination meta={meta} onPageChange={load} />
    </div>
  )
}
