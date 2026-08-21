import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { Input } from '../../components/Input'
import { Select } from '../../components/Select'
import { Button } from '../../components/Button'
import { authService } from '../../services/authService'
import { setCredentials } from '../../features/auth/authSlice'
import { pageTransitionVariants } from '../../lib/motion'

const PANEL_HOME = {
  customer: '/',
  delivery_partner: '/delivery/dashboard',
}

export default function Register() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    password_confirmation: '',
    role: 'customer',
    vehicle_type: 'motorcycle',
    vehicle_number: '',
    licence_number: '',
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }))
    setErrors((prev) => ({ ...prev, [field]: undefined }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrors({})
    setLoading(true)

    try {
      const payload = { ...form }
      if (payload.role !== 'delivery_partner') {
        delete payload.vehicle_type
        delete payload.vehicle_number
        delete payload.licence_number
      }

      const { data } = await authService.register(payload)
      dispatch(setCredentials(data.data))
      navigate(PANEL_HOME[data.data.user.role] ?? '/', { replace: true })
      toast.success('Account created!')
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
    <div className="flex min-h-screen items-center justify-center bg-neutral-50 px-4 py-12">
      <motion.div {...pageTransitionVariants} className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <Link to="/" className="font-display text-2xl font-extrabold text-brand-500">
            RestaurantApp
          </Link>
          <h1 className="mt-4 text-xl font-semibold text-neutral-900">Create your account</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 rounded-xl bg-white p-6 shadow-card">
          <Select label="I want to" value={form.role} onChange={handleChange('role')}>
            <option value="customer">Order food</option>
            <option value="delivery_partner">Deliver as a partner</option>
          </Select>

          <Input label="Full Name" value={form.name} onChange={handleChange('name')} error={err('name')} required />
          <Input
            label="Email"
            type="email"
            autoComplete="email"
            value={form.email}
            onChange={handleChange('email')}
            error={err('email')}
            required
          />
          <Input label="Phone" type="tel" value={form.phone} onChange={handleChange('phone')} error={err('phone')} />

          {form.role === 'delivery_partner' && (
            <>
              <Select label="Vehicle Type" value={form.vehicle_type} onChange={handleChange('vehicle_type')}>
                <option value="bicycle">Bicycle</option>
                <option value="motorcycle">Motorcycle</option>
                <option value="scooter">Scooter</option>
              </Select>
              <Input
                label="Vehicle Number"
                value={form.vehicle_number}
                onChange={handleChange('vehicle_number')}
                error={err('vehicle_number')}
                required
              />
              <Input
                label="Licence Number"
                value={form.licence_number}
                onChange={handleChange('licence_number')}
                error={err('licence_number')}
                required
              />
            </>
          )}

          <Input
            label="Password"
            type="password"
            autoComplete="new-password"
            value={form.password}
            onChange={handleChange('password')}
            error={err('password')}
            hint="At least 8 characters"
            required
          />
          <Input
            label="Confirm Password"
            type="password"
            autoComplete="new-password"
            value={form.password_confirmation}
            onChange={handleChange('password_confirmation')}
            required
          />

          <Button type="submit" loading={loading} className="w-full">
            Create Account
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-neutral-500">
          Already have an account?{' '}
          <Link to="/auth/login" className="font-semibold text-brand-600 hover:text-brand-700">
            Log in
          </Link>
        </p>
      </motion.div>
    </div>
  )
}
