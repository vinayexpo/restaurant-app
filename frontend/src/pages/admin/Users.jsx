import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { Pencil, Plus, Search, Users as UsersIcon } from 'lucide-react'
import { adminService } from '../../services/adminService'
import { Badge } from '../../components/Badge'
import { Button } from '../../components/Button'
import { Input } from '../../components/Input'
import { Modal } from '../../components/Modal'
import { SkeletonListRow } from '../../components/Skeleton'
import { EmptyState } from '../../components/EmptyState'
import { Pagination } from '../../components/Pagination'

export default function AdminUsers() {
  const [users, setUsers] = useState([])
  const [meta, setMeta] = useState({ page: 1, last_page: 1 })
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [role, setRole] = useState('')
  const [isActive, setIsActive] = useState('')
  const [showCreateOwner, setShowCreateOwner] = useState(false)
  const [createOwnerForm, setCreateOwnerForm] = useState({ name: '', email: '', phone: '', password: '', password_confirmation: '' })
  const [createOwnerErrors, setCreateOwnerErrors] = useState({})
  const [creatingOwner, setCreatingOwner] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [userForm, setUserForm] = useState({ name: '', email: '', phone: '' })
  const [userErrors, setUserErrors] = useState({})
  const [savingUser, setSavingUser] = useState(false)

  const load = (page = 1) => {
    setLoading(true)
    adminService
      .users({ page, search: search || undefined, role: role || undefined, is_active: isActive || undefined })
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
  }, [search, role, isActive])

  const toggleStatus = async (user) => {
    try {
      if (user.is_active) {
        if (!window.confirm(`Deactivate ${user.name}? They will no longer be able to sign in. You can reactivate their account later.`)) return
        await adminService.deactivateUser(user.id)
        toast.success('User deactivated.')
      } else {
        await adminService.activateUser(user.id)
        toast.success('User reactivated.')
      }
      load(meta.page)
    } catch {
      toast.error('Could not update user status.')
    }
  }

  const openEditUser = (user) => {
    setEditingUser(user)
    setUserForm({ name: user.name, email: user.email, phone: user.phone ?? '' })
    setUserErrors({})
  }

  const handleUpdateUser = async (e) => {
    e.preventDefault()
    setUserErrors({})
    setSavingUser(true)
    try {
      await adminService.updateUser(editingUser.id, userForm)
      setEditingUser(null)
      toast.success('User profile updated.')
      load(meta.page)
    } catch (error) {
      setUserErrors(error.response?.data?.errors ?? {})
    } finally {
      setSavingUser(false)
    }
  }

  const handleCreateOwner = async (e) => {
    e.preventDefault()
    setCreateOwnerErrors({})
    setCreatingOwner(true)

    try {
      await adminService.createRestaurantOwner(createOwnerForm)
      setShowCreateOwner(false)
      setCreateOwnerForm({ name: '', email: '', phone: '', password: '', password_confirmation: '' })
      toast.success('Restaurant owner account created.')
      load(1)
    } catch (error) {
      setCreateOwnerErrors(error.response?.data?.errors ?? {})
    } finally {
      setCreatingOwner(false)
    }
  }

  const ownerErr = (field) => {
    const value = createOwnerErrors[field]
    return Array.isArray(value) ? value[0] : value
  }

  const userErr = (field) => {
    const value = userErrors[field]
    return Array.isArray(value) ? value[0] : value
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-3">
        <h1 className="text-lg font-bold text-neutral-900">Users</h1>
        <Button size="sm" onClick={() => setShowCreateOwner(true)}>
          <Plus size={14} /> Create Owner
        </Button>
      </div>

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
        <select value={isActive} onChange={(e) => setIsActive(e.target.value)} className="h-9 rounded-md border border-neutral-200 px-3 text-sm">
          <option value="">All Statuses</option>
          <option value="1">Active</option>
          <option value="0">Inactive</option>
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
                    <button onClick={() => openEditUser(u)} aria-label={`Edit ${u.name}`} className="text-neutral-400 hover:text-brand-600">
                      <Pencil size={15} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Pagination meta={meta} onPageChange={load} />

      <Modal open={showCreateOwner} onClose={() => setShowCreateOwner(false)} title="Create Restaurant Owner">
        <form onSubmit={handleCreateOwner} className="space-y-3">
          <Input label="Full Name" value={createOwnerForm.name} onChange={(e) => setCreateOwnerForm((prev) => ({ ...prev, name: e.target.value }))} error={ownerErr('name')} required />
          <Input label="Email" type="email" value={createOwnerForm.email} onChange={(e) => setCreateOwnerForm((prev) => ({ ...prev, email: e.target.value }))} error={ownerErr('email')} required />
          <Input label="Phone" value={createOwnerForm.phone} onChange={(e) => setCreateOwnerForm((prev) => ({ ...prev, phone: e.target.value }))} error={ownerErr('phone')} />
          <Input
            label="Password"
            type="password"
            value={createOwnerForm.password}
            onChange={(e) => setCreateOwnerForm((prev) => ({ ...prev, password: e.target.value }))}
            error={ownerErr('password')}
            hint="At least 8 characters"
            required
          />
          <Input
            label="Confirm Password"
            type="password"
            value={createOwnerForm.password_confirmation}
            onChange={(e) => setCreateOwnerForm((prev) => ({ ...prev, password_confirmation: e.target.value }))}
            error={ownerErr('password_confirmation')}
            required
          />

          <Button type="submit" loading={creatingOwner} className="w-full">
            Create Owner
          </Button>
        </form>
      </Modal>

      <Modal open={!!editingUser} onClose={() => setEditingUser(null)} title="Edit User Profile">
        <form onSubmit={handleUpdateUser} className="space-y-3">
          <Input label="Full Name" value={userForm.name} onChange={(e) => setUserForm((prev) => ({ ...prev, name: e.target.value }))} error={userErr('name')} required />
          <Input label="Email" type="email" value={userForm.email} onChange={(e) => setUserForm((prev) => ({ ...prev, email: e.target.value }))} error={userErr('email')} required />
          <Input label="Phone" value={userForm.phone} onChange={(e) => setUserForm((prev) => ({ ...prev, phone: e.target.value }))} error={userErr('phone')} />
          <p className="text-xs text-neutral-500">Role and account permissions cannot be changed here.</p>
          <Button type="submit" loading={savingUser} className="w-full">
            Save Profile
          </Button>
        </form>
      </Modal>
    </div>
  )
}
