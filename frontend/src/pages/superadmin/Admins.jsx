import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { Pencil, Plus, Trash2, Search } from 'lucide-react'
import { superadminService } from '../../services/superadminService'
import { Input } from '../../components/Input'
import { Button } from '../../components/Button'
import { Modal } from '../../components/Modal'
import { Pagination } from '../../components/Pagination'
import { EmptyState } from '../../components/EmptyState'

export default function SuperadminAdmins() {
  const [admins, setAdmins] = useState([])
  const [meta, setMeta] = useState({ page: 1, last_page: 1 })
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingAdmin, setEditingAdmin] = useState(null)
  const [form, setForm] = useState({ name: '', email: '', password: '', password_confirmation: '' })
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState('')
  const [isActive, setIsActive] = useState('')

  const load = (page = 1) =>
    superadminService
      .admins({ page, search: search || undefined, is_active: isActive || undefined })
      .then(({ data }) => {
        setAdmins(data.data)
        setMeta(data.meta)
      })
      .finally(() => setLoading(false))

  useEffect(() => {
    const timer = setTimeout(() => load(1), search ? 300 : 0)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, isActive])

  const openCreate = () => {
    setEditingAdmin(null)
    setForm({ name: '', email: '', password: '', password_confirmation: '', is_active: true })
    setErrors({})
    setShowModal(true)
  }

  const openEdit = (admin) => {
    setEditingAdmin(admin)
    setForm({ name: admin.name, email: admin.email, password: '', password_confirmation: '', is_active: admin.is_active })
    setErrors({})
    setShowModal(true)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setErrors({})
    setSaving(true)
    try {
      const payload = { ...form }
      if (!payload.password) {
        delete payload.password
        delete payload.password_confirmation
      }
      if (editingAdmin) await superadminService.updateAdmin(editingAdmin.id, payload)
      else await superadminService.createAdmin(payload)
      setShowModal(false)
      setForm({ name: '', email: '', password: '', password_confirmation: '' })
      toast.success(editingAdmin ? 'Admin account updated.' : 'Admin account created.')
      load()
    } catch (error) {
      setErrors(error.response?.data?.errors ?? {})
    } finally {
      setSaving(false)
    }
  }

  const remove = async (id) => {
    if (!window.confirm('Delete this admin account?')) return
    await superadminService.deleteAdmin(id)
    load()
  }

  const err = (field) => {
    const e = errors[field]
    return Array.isArray(e) ? e[0] : e
  }

  if (loading) return null

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-lg font-bold text-neutral-900">Admin Accounts</h1>
        <Button size="sm" onClick={openCreate}>
          <Plus size={14} /> Create Admin
        </Button>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        <div className="relative min-w-52 flex-1">
          <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search name or email..." className="h-9 w-full rounded-md border border-neutral-200 pl-9 pr-3 text-sm" />
        </div>
        <select value={isActive} onChange={(e) => setIsActive(e.target.value)} className="h-9 rounded-md border border-neutral-200 px-3 text-sm">
          <option value="">All Statuses</option>
          <option value="1">Active</option>
          <option value="0">Inactive</option>
        </select>
      </div>

      {admins.length === 0 ? (
        <EmptyState title="No admin accounts yet" />
      ) : (
        <div className="space-y-2">
          {admins.map((a) => (
            <div key={a.id} className="flex items-center justify-between rounded-lg border border-neutral-100 bg-white p-3.5">
              <div>
                <p className="text-sm font-semibold text-neutral-900">{a.name}</p>
                <p className="text-xs text-neutral-500">{a.email} · {a.is_active ? 'Active' : 'Inactive'}</p>
              </div>
               <div className="flex gap-2">
                 <button aria-label={`Edit ${a.name}`} onClick={() => openEdit(a)} className="text-neutral-400 hover:text-brand-500">
                   <Pencil size={15} />
                </button>
                <button onClick={() => remove(a.id)} className="text-neutral-400 hover:text-danger-500">
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Pagination meta={meta} onPageChange={load} />

      <Modal open={showModal} onClose={() => setShowModal(false)} title={editingAdmin ? 'Edit Admin Account' : 'Create Admin Account'}>
        <form onSubmit={handleSave} className="space-y-3">
          <Input label="Name" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} error={err('name')} required />
          <Input label="Email" type="email" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} error={err('email')} required />
          <Input label={editingAdmin ? 'New Password (optional)' : 'Password'} type="password" value={form.password} onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))} error={err('password')} required={!editingAdmin} />
          <Input label="Confirm Password" type="password" value={form.password_confirmation} onChange={(e) => setForm((p) => ({ ...p, password_confirmation: e.target.value }))} required={!editingAdmin || Boolean(form.password)} />
          {editingAdmin && (
            <label className="flex items-center gap-2 text-sm font-medium text-neutral-700">
              <input type="checkbox" checked={Boolean(form.is_active)} onChange={(e) => setForm((p) => ({ ...p, is_active: e.target.checked }))} />
              Account is active
            </label>
          )}
          <Button type="submit" loading={saving} className="w-full">
            {editingAdmin ? 'Save Changes' : 'Create Admin'}
          </Button>
        </form>
      </Modal>
    </div>
  )
}
