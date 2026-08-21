import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { MailCheck } from 'lucide-react'
import { Input } from '../../components/Input'
import { Button } from '../../components/Button'
import { authService } from '../../services/authService'
import { pageTransitionVariants } from '../../lib/motion'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await authService.forgotPassword({ email })
      setSent(true)
    } catch (err) {
      setError(err.response?.data?.errors?.email?.[0] ?? err.response?.data?.message ?? 'Something went wrong.')
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
        </div>

        <div className="rounded-xl bg-white p-6 shadow-card">
          {sent ? (
            <div className="flex flex-col items-center gap-3 py-4 text-center">
              <div className="flex size-14 items-center justify-center rounded-full bg-accent-500/10 text-accent-600">
                <MailCheck size={26} />
              </div>
              <h2 className="text-lg font-semibold text-neutral-900">Check your inbox</h2>
              <p className="text-sm text-neutral-500">
                We've sent a password reset link to <strong>{email}</strong>.
              </p>
              <Link to="/auth/login" className="mt-2 text-sm font-semibold text-brand-600 hover:text-brand-700">
                Back to login
              </Link>
            </div>
          ) : (
            <>
              <h1 className="mb-1 text-lg font-semibold text-neutral-900">Reset your password</h1>
              <p className="mb-5 text-sm text-neutral-500">Enter your email and we'll send you a reset link.</p>
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  label="Email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  error={error}
                  required
                />
                <Button type="submit" loading={loading} className="w-full">
                  Send Reset Link
                </Button>
              </form>
            </>
          )}
        </div>

        <p className="mt-6 text-center text-sm text-neutral-500">
          <Link to="/auth/login" className="font-semibold text-brand-600 hover:text-brand-700">
            Back to login
          </Link>
        </p>
      </motion.div>
    </div>
  )
}
