import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { Plus, Trash2, KeyRound } from 'lucide-react'
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
  const [form, setForm] = useState({ name: '', email: '', password: '', password_confirmation: '' })
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const [passwordTarget, setPasswordTarget] = useState(null)
  const [newPassword, setNewPassword] = useState('')

  const load = (page = 1) =>
    superadminService
      .admins({ page })
      .then(({ data }) => {
        setAdmins(data.data)
        setMeta(data.meta)
      })
      .finally(() => setLoading(false))

  useEffect(() => {
    load()
  }, [])

  const handleCreate = async (e) => {
    e.preventDefault()
    setErrors({})
    setSaving(true)
    try {
      await superadminService.createAdmin(form)
      setShowModal(false)
      setForm({ name: '', email: '', password: '', password_confirmation: '' })
      toast.success('Admin account created.')
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

  const changePassword = async () => {
    try {
      await superadminService.updateAdmin(passwordTarget.id, {
        password: newPassword,
        password_confirmation: newPassword,
      })
      toast.success('Password updated.')
      setPasswordTarget(null)
      setNewPassword('')
    } catch {
      toast.error('Could not update password.')
    }
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
        <Button size="sm" onClick={() => setShowModal(true)}>
          <Plus size={14} /> Create Admin
        </Button>
      </div>

      {admins.length === 0 ? (
        <EmptyState title="No admin accounts yet" />
      ) : (
        <div className="space-y-2">
          {admins.map((a) => (
            <div key={a.id} className="flex items-center justify-between rounded-lg border border-neutral-100 bg-white p-3.5">
              <div>
                <p className="text-sm font-semibold text-neutral-900">{a.name}</p>
                <p className="text-xs text-neutral-500">{a.email}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setPasswordTarget(a)} className="text-neutral-400 hover:text-brand-500">
                  <KeyRound size={15} />
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

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Create Admin Account">
        <form onSubmit={handleCreate} className="space-y-3">
          <Input label="Name" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} error={err('name')} required />
          <Input label="Email" type="email" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} error={err('email')} required />
          <Input label="Password" type="password" value={form.password} onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))} error={err('password')} required />
          <Input label="Confirm Password" type="password" value={form.password_confirmation} onChange={(e) => setForm((p) => ({ ...p, password_confirmation: e.target.value }))} required />
          <Button type="submit" loading={saving} className="w-full">
            Create Admin
          </Button>
        </form>
      </Modal>

      <Modal open={!!passwordTarget} onClose={() => setPasswordTarget(null)} title={`Change Password — ${passwordTarget?.name}`}>
        <Input label="New Password" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
        <Button className="mt-3 w-full" onClick={changePassword}>
          Update Password
        </Button>
      </Modal>
    </div>
  )
}
