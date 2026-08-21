import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { Search, Trash2, Users as UsersIcon } from 'lucide-react'
import { adminService } from '../../services/adminService'
import { Badge } from '../../components/Badge'
import { SkeletonListRow } from '../../components/Skeleton'
import { EmptyState } from '../../components/EmptyState'

export default function AdminUsers() {
  const [users, setUsers] = useState([])
  const [meta, setMeta] = useState({ page: 1, last_page: 1 })
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [role, setRole] = useState('')

  const load = (page = 1) => {
    setLoading(true)
    adminService
      .users({ page, search: search || undefined, role: role || undefined })
      .then(({ data }) => {
        setUsers(data.data)
        setMeta(data.meta)
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    const timer = setTimeout(() => load(1), 300)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, role])

  const toggleStatus = async (user) => {
    try {
      if (user.is_active) await adminService.deactivateUser(user.id)
      else await adminService.activateUser(user.id)
      load(meta.page)
    } catch {
      toast.error('Could not update user status.')
    }
  }

  const remove = async (id) => {
    if (!window.confirm('Delete this user?')) return
    await adminService.deleteUser(id)
    load(meta.page)
  }

  return (
    <div>
      <h1 className="mb-4 text-lg font-bold text-neutral-900">Users</h1>

      <div className="mb-4 flex gap-2">
        <div className="relative flex-1">
          <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email..."
            className="h-9 w-full rounded-md border border-neutral-200 pl-9 pr-3 text-sm"
          />
        </div>
        <select value={role} onChange={(e) => setRole(e.target.value)} className="h-9 rounded-md border border-neutral-200 px-3 text-sm">
          <option value="">All Roles</option>
          <option value="customer">Customer</option>
          <option value="restaurant_owner">Restaurant Owner</option>
          <option value="delivery_partner">Delivery Partner</option>
          <option value="admin">Admin</option>
        </select>
      </div>

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <SkeletonListRow key={i} />
          ))}
        </div>
      ) : users.length === 0 ? (
        <EmptyState icon={UsersIcon} title="No users found" description="Try adjusting your search or role filter." />
      ) : (
        <div className="overflow-x-auto rounded-lg border border-neutral-100 bg-white">
          <table className="w-full text-sm">
            <thead className="border-b border-neutral-100 text-left text-xs text-neutral-500">
              <tr>
                <th className="px-4 py-2.5">Name</th>
                <th className="px-4 py-2.5">Email</th>
                <th className="px-4 py-2.5">Role</th>
                <th className="px-4 py-2.5">Status</th>
                <th className="px-4 py-2.5"></th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-neutral-50 last:border-0">
                  <td className="px-4 py-3 font-medium text-neutral-900">{u.name}</td>
                  <td className="px-4 py-3 text-neutral-600">{u.email}</td>
                  <td className="px-4 py-3">
                    <Badge>{u.role.replace('_', ' ')}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggleStatus(u)}
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                        u.is_active ? 'bg-accent-500/15 text-accent-600' : 'bg-neutral-200 text-neutral-600'
                      }`}
                    >
                      {u.is_active ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => remove(u.id)} className="text-neutral-400 hover:text-danger-500">
                      <Trash2 size={15} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {meta.last_page > 1 && (
        <div className="mt-4 flex justify-center gap-2">
          <button disabled={meta.page <= 1} onClick={() => load(meta.page - 1)} className="rounded-md border border-neutral-200 px-3 py-1.5 text-sm disabled:opacity-40">
            Previous
          </button>
          <span className="flex items-center px-2 text-sm text-neutral-500">{meta.page} / {meta.last_page}</span>
          <button disabled={meta.page >= meta.last_page} onClick={() => load(meta.page + 1)} className="rounded-md border border-neutral-200 px-3 py-1.5 text-sm disabled:opacity-40">
            Next
          </button>
        </div>
      )}
    </div>
  )
}
