import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { Input } from '../../components/Input'
import { Button } from '../../components/Button'
import { authService } from '../../services/authService'
import { setCredentials } from '../../features/auth/authSlice'
import { pageTransitionVariants } from '../../lib/motion'

const PANEL_HOME = {
  customer: '/',
  restaurant_owner: '/owner/dashboard',
  delivery_partner: '/delivery/dashboard',
  admin: '/admin/dashboard',
  superadmin: '/superadmin/dashboard',
}

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }))
    setErrors((prev) => ({ ...prev, [field]: undefined }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrors({})
    setLoading(true)

    try {
      const { data } = await authService.login(form)
      dispatch(setCredentials(data.data))
      const redirectTo = location.state?.from?.pathname ?? PANEL_HOME[data.data.user.role] ?? '/'
      navigate(redirectTo, { replace: true })
      toast.success('Welcome back!')
    } catch (error) {
      const apiErrors = error.response?.data?.errors
      if (apiErrors) {
        setErrors(apiErrors)
      } else {
        setErrors({ email: error.response?.data?.message ?? 'Invalid credentials.' })
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-50 px-4 py-12">
      <motion.div {...pageTransitionVariants} className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <Link to="/" className="font-display text-2xl font-extrabold text-brand-500">
            RestaurantApp
          </Link>
          <h1 className="mt-4 text-xl font-semibold text-neutral-900">Welcome back</h1>
          <p className="mt-1 text-sm text-neutral-500">Log in to continue ordering.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 rounded-xl bg-white p-6 shadow-card">
          <Input
            label="Email"
            type="email"
            autoComplete="email"
            value={form.email}
            onChange={handleChange('email')}
            error={errors.email?.[0] ?? errors.email}
            required
          />
          <Input
            label="Password"
            type="password"
            autoComplete="current-password"
            value={form.password}
            onChange={handleChange('password')}
            error={errors.password?.[0] ?? errors.password}
            required
          />

          <div className="flex justify-end">
            <Link to="/auth/forgot-password" className="text-sm font-medium text-brand-600 hover:text-brand-700">
              Forgot password?
            </Link>
          </div>

          <Button type="submit" loading={loading} className="w-full">
            Log In
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-neutral-500">
          New here?{' '}
          <Link to="/auth/register" className="font-semibold text-brand-600 hover:text-brand-700">
            Create an account
          </Link>
        </p>
      </motion.div>
    </div>
  )
}
