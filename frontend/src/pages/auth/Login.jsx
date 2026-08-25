import { useEffect, useState } from 'react'
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
  const [superadminForm, setSuperadminForm] = useState({ name: '', email: '', password: '', password_confirmation: '' })
  const [errors, setErrors] = useState({})
  const [superadminErrors, setSuperadminErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [checkingBootstrap, setCheckingBootstrap] = useState(true)
  const [showBootstrapForm, setShowBootstrapForm] = useState(false)
  const [creatingSuperadmin, setCreatingSuperadmin] = useState(false)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    authService
      .superadminBootstrapStatus()
      .then(({ data }) => setShowBootstrapForm(!data.data.has_superadmin))
      .finally(() => setCheckingBootstrap(false))
  }, [])

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }))
    setErrors((prev) => ({ ...prev, [field]: undefined }))
  }

  const handleSuperadminChange = (field) => (e) => {
    setSuperadminForm((prev) => ({ ...prev, [field]: e.target.value }))
    setSuperadminErrors((prev) => ({ ...prev, [field]: undefined }))
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

  const handleCreateSuperadmin = async (e) => {
    e.preventDefault()
    setSuperadminErrors({})
    setCreatingSuperadmin(true)

    try {
      const { data } = await authService.createFirstSuperadmin(superadminForm)
      dispatch(setCredentials(data.data))
      setShowBootstrapForm(false)
      navigate('/superadmin/dashboard', { replace: true })
      toast.success('Superadmin account created!')
    } catch (error) {
      const apiErrors = error.response?.data?.errors

      if (apiErrors) {
        setSuperadminErrors(apiErrors)
      } else {
        toast.error(error.response?.data?.message ?? 'Could not create superadmin account.')
      }

      if (error.response?.status === 403) {
        setShowBootstrapForm(false)
      }
    } finally {
      setCreatingSuperadmin(false)
    }
  }

  const err = (field) => {
    const value = errors[field]
    return Array.isArray(value) ? value[0] : value
  }

  const superadminErr = (field) => {
    const value = superadminErrors[field]
    return Array.isArray(value) ? value[0] : value
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
            error={err('email')}
            required
          />
          <Input
            label="Password"
            type="password"
            autoComplete="current-password"
            value={form.password}
            onChange={handleChange('password')}
            error={err('password')}
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

        {!checkingBootstrap && showBootstrapForm && (
          <div className="mt-6 rounded-xl border border-brand-100 bg-white p-6 shadow-card">
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-neutral-900">Create Superadmin</h2>
              <p className="mt-1 text-sm text-neutral-500">No superadmin exists yet. This form is only available until the first superadmin account is created.</p>
            </div>

            <form onSubmit={handleCreateSuperadmin} className="space-y-4">
              <Input label="Full Name" value={superadminForm.name} onChange={handleSuperadminChange('name')} error={superadminErr('name')} required />
              <Input
                label="Email"
                type="email"
                autoComplete="email"
                value={superadminForm.email}
                onChange={handleSuperadminChange('email')}
                error={superadminErr('email')}
                required
              />
              <Input
                label="Password"
                type="password"
                autoComplete="new-password"
                value={superadminForm.password}
                onChange={handleSuperadminChange('password')}
                error={superadminErr('password')}
                hint="At least 8 characters"
                required
              />
              <Input
                label="Confirm Password"
                type="password"
                autoComplete="new-password"
                value={superadminForm.password_confirmation}
                onChange={handleSuperadminChange('password_confirmation')}
                error={superadminErr('password_confirmation')}
                required
              />

              <Button type="submit" loading={creatingSuperadmin} className="w-full">
                Create Superadmin
              </Button>
            </form>
          </div>
        )}
      </motion.div>
    </div>
  )
}
