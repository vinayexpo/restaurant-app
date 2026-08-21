import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { Plus, Trash2 } from 'lucide-react'
import { superadminService } from '../../services/superadminService'
import { adminService } from '../../services/adminService'
import { Input } from '../../components/Input'
import { Select } from '../../components/Select'
import { Button } from '../../components/Button'
import { Modal } from '../../components/Modal'
import { EmptyState } from '../../components/EmptyState'

export default function SuperadminCommissions() {
  const [commissions, setCommissions] = useState([])
  const [restaurants, setRestaurants] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ restaurant_id: '', rate_pct: '', effective_from: '', notes: '' })
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)

  const load = () => superadminService.commissions().then(({ data }) => setCommissions(data.data))

  useEffect(() => {
    load().finally(() => setLoading(false))
    adminService.restaurants({ status: 'approved' }).then(({ data }) => setRestaurants(data.data))
  }, [])

  const handleCreate = async (e) => {
    e.preventDefault()
    setErrors({})
    setSaving(true)
    try {
      await superadminService.createCommission(form)
      setShowModal(false)
      setForm({ restaurant_id: '', rate_pct: '', effective_from: '', notes: '' })
      toast.success('Commission override created.')
      load()
    } catch (error) {
      setErrors(error.response?.data?.errors ?? {})
    } finally {
      setSaving(false)
    }
  }

  const remove = async (id) => {
    if (!window.confirm('Remove this override? Restaurant will revert to the platform default rate.')) return
    await superadminService.deleteCommission(id)
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
        <h1 className="text-lg font-bold text-neutral-900">Commission Overrides</h1>
        <Button size="sm" onClick={() => setShowModal(true)}>
          <Plus size={14} /> Add Override
        </Button>
      </div>

      {commissions.length === 0 ? (
        <EmptyState title="No commission overrides" description="All restaurants use the platform default commission rate." />
      ) : (
        <div className="overflow-x-auto rounded-lg border border-neutral-100 bg-white">
          <table className="w-full text-sm">
            <thead className="border-b border-neutral-100 text-left text-xs text-neutral-500">
              <tr>
                <th className="px-4 py-2.5">Restaurant</th>
                <th className="px-4 py-2.5">Rate</th>
                <th className="px-4 py-2.5">Effective From</th>
                <th className="px-4 py-2.5"></th>
              </tr>
            </thead>
            <tbody>
              {commissions.map((c) => (
                <tr key={c.id} className="border-b border-neutral-50 last:border-0">
                  <td className="px-4 py-3 font-medium text-neutral-900">{c.restaurant?.name}</td>
                  <td className="px-4 py-3 text-neutral-600">{c.rate_pct}%</td>
                  <td className="px-4 py-3 text-neutral-600">{c.effective_from}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => remove(c.id)} className="text-neutral-400 hover:text-danger-500">
                      <Trash2 size={15} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Add Commission Override">
        <form onSubmit={handleCreate} className="space-y-3">
          <Select label="Restaurant" value={form.restaurant_id} onChange={(e) => setForm((p) => ({ ...p, restaurant_id: e.target.value }))} error={err('restaurant_id')} required>
            <option value="">Select restaurant</option>
            {restaurants.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </Select>
          <Input label="Rate (%)" type="number" step="0.01" value={form.rate_pct} onChange={(e) => setForm((p) => ({ ...p, rate_pct: e.target.value }))} error={err('rate_pct')} required />
          <Input label="Effective From" type="date" value={form.effective_from} onChange={(e) => setForm((p) => ({ ...p, effective_from: e.target.value }))} error={err('effective_from')} required />
          <Input label="Notes (optional)" value={form.notes} onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))} />
          <Button type="submit" loading={saving} className="w-full">
            Save Override
          </Button>
        </form>
      </Modal>
    </div>
  )
}
