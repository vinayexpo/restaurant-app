import { useState } from 'react'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { Search, UserCog } from 'lucide-react'
import { adminService } from '../../services/adminService'
import { superadminService } from '../../services/superadminService'
import { setCredentials } from '../../features/auth/authSlice'
import { setImpersonating } from '../../features/superadmin/superadminSlice'
import { Button } from '../../components/Button'

const PANEL_HOME = {
  customer: '/',
  restaurant_owner: '/owner/dashboard',
  delivery_partner: '/delivery/dashboard',
  admin: '/admin/dashboard',
}

export default function SuperadminImpersonation() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [impersonatingId, setImpersonatingId] = useState(null)

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!search.trim()) return
    setLoading(true)
    try {
      const { data } = await adminService.users({ search: search.trim() })
      setResults(data.data)
    } finally {
      setLoading(false)
    }
  }

  const impersonate = async (user) => {
    if (!window.confirm(`Impersonate ${user.name} (${user.role})?`)) return
    setImpersonatingId(user.id)
    try {
      const { data } = await superadminService.impersonate(user.id)
      dispatch(setImpersonating({ name: data.data.user.name, role: data.data.user.role }))
      dispatch(setCredentials({ user: data.data.user, token: data.data.token }))
      toast.success(`Now impersonating ${user.name}.`)
      navigate(PANEL_HOME[data.data.user.role] ?? '/')
    } catch {
      toast.error('Could not start impersonation.')
    } finally {
      setImpersonatingId(null)
    }
  }

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="mb-4 flex items-center gap-2 text-lg font-bold text-neutral-900">
        <UserCog size={20} /> User Impersonation
      </h1>

      <form onSubmit={handleSearch} className="relative mb-5">
        <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or email..."
          className="h-11 w-full rounded-md border border-neutral-200 pl-10 pr-4 text-sm focus:border-brand-500 focus:outline-none"
        />
      </form>

      {loading ? (
        <p className="text-sm text-neutral-500">Searching...</p>
      ) : (
        <div className="space-y-2">
          {results.map((user) => (
            <div key={user.id} className="flex items-center justify-between rounded-lg border border-neutral-100 bg-white p-3.5">
              <div>
                <p className="text-sm font-semibold text-neutral-900">{user.name}</p>
                <p className="text-xs text-neutral-500">{user.email} — {user.role.replace('_', ' ')}</p>
              </div>
              <Button size="sm" variant="secondary" loading={impersonatingId === user.id} onClick={() => impersonate(user)}>
                Impersonate
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
