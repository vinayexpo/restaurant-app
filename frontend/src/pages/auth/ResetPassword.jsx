import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { Input } from '../../components/Input'
import { Button } from '../../components/Button'
import { authService } from '../../services/authService'
import { pageTransitionVariants } from '../../lib/motion'

export default function ResetPassword() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const token = searchParams.get('token') ?? ''
  const email = searchParams.get('email') ?? ''

  const [form, setForm] = useState({ password: '', password_confirmation: '' })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }))
    setErrors((prev) => ({ ...prev, [field]: undefined }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrors({})
    setLoading(true)

    try {
      await authService.resetPassword({ token, email, ...form })
      toast.success('Password reset successfully. Please log in.')
      navigate('/auth/login', { replace: true })
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
          <h1 className="mt-4 text-xl font-semibold text-neutral-900">Set a new password</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 rounded-xl bg-white p-6 shadow-card">
          <Input
            label="New Password"
            type="password"
            autoComplete="new-password"
            value={form.password}
            onChange={handleChange('password')}
            error={err('password')}
            hint="At least 8 characters"
            required
          />
          <Input
            label="Confirm New Password"
            type="password"
            autoComplete="new-password"
            value={form.password_confirmation}
            onChange={handleChange('password_confirmation')}
            required
          />

          <Button type="submit" loading={loading} className="w-full">
            Reset Password
          </Button>
        </form>
      </motion.div>
    </div>
  )
}
