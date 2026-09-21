import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { Pencil, Plus, Trash2, Tag } from 'lucide-react'
import { ownerService } from '../../services/ownerService'
import { Input } from '../../components/Input'
import { Select } from '../../components/Select'
import { Textarea } from '../../components/Textarea'
import { Button } from '../../components/Button'
import { Modal } from '../../components/Modal'
import { Pagination } from '../../components/Pagination'
import { EmptyState } from '../../components/EmptyState'

const emptyForm = {
  code: '',
  title: '',
  description: '',
  type: 'percentage',
  value: '',
  min_order_amount: '0',
  max_discount: '',
  usage_limit: '',
  per_user_limit: '1',
  valid_from: '',
  valid_until: '',
}

export default function OwnerCoupons() {
  const [coupons, setCoupons] = useState([])
  const [meta, setMeta] = useState({ page: 1, last_page: 1 })
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingCoupon, setEditingCoupon] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const [filters, setFilters] = useState({ code: '', active: '', validity: '' })

  const load = (page = 1) =>
    ownerService.coupons({ page, ...filters }).then(({ data }) => {
      setCoupons(data.data)
      setMeta(data.meta)
    })

  useEffect(() => { load().finally(() => setLoading(false)) }, [filters])

  const change = (field) => (e) => setForm((p) => ({ ...p, [field]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrors({})
    setSaving(true)
    try {
      if (editingCoupon) {
        await ownerService.updateCoupon(editingCoupon.id, form)
      } else {
        await ownerService.createCoupon(form)
      }
      setShowModal(false)
      setForm(emptyForm)
      setEditingCoupon(null)
      toast.success(editingCoupon ? 'Coupon updated.' : 'Coupon created.')
      load()
    } catch (error) {
      setErrors(error.response?.data?.errors ?? {})
    } finally {
      setSaving(false)
    }
  }

  const openCreate = () => {
    setEditingCoupon(null)
    setForm(emptyForm)
    setErrors({})
    setShowModal(true)
  }

  const openEdit = (coupon) => {
    setEditingCoupon(coupon)
    setErrors({})
    setForm({
      code: coupon.code ?? '',
      title: coupon.title ?? '',
      description: coupon.description ?? '',
      type: coupon.type ?? 'percentage',
      value: coupon.value ?? '',
      min_order_amount: coupon.min_order_amount ?? '0',
      max_discount: coupon.max_discount ?? '',
      usage_limit: coupon.usage_limit ?? '',
      per_user_limit: coupon.per_user_limit ?? '1',
      valid_from: coupon.valid_from?.slice(0, 10) ?? '',
      valid_until: coupon.valid_until?.slice(0, 10) ?? '',
    })
    setShowModal(true)
  }

  const closeModal = () => {
    if (saving) return
    setShowModal(false)
    setEditingCoupon(null)
    setErrors({})
  }

  const toggleActive = async (coupon) => {
    await ownerService.updateCoupon(coupon.id, { is_active: !coupon.is_active })
    load()
  }

  const remove = async (id) => {
    if (!window.confirm('Delete this coupon?')) return
    await ownerService.deleteCoupon(id)
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
        <h1 className="text-lg font-bold text-neutral-900">Coupons</h1>
        <Button size="sm" onClick={openCreate}>
          <Plus size={14} /> Create Coupon
        </Button>
      </div>

      <div className="mb-4 grid gap-2 sm:grid-cols-3">
        <input value={filters.code} onChange={(e) => setFilters((current) => ({ ...current, code: e.target.value }))} placeholder="Search coupon code" className="h-9 rounded-md border border-neutral-200 px-3 text-sm" />
        <select value={filters.active} onChange={(e) => setFilters((current) => ({ ...current, active: e.target.value }))} className="h-9 rounded-md border border-neutral-200 px-3 text-sm"><option value="">Any activity</option><option value="1">Active</option><option value="0">Inactive</option></select>
        <select value={filters.validity} onChange={(e) => setFilters((current) => ({ ...current, validity: e.target.value }))} className="h-9 rounded-md border border-neutral-200 px-3 text-sm"><option value="">Any validity</option><option value="current">Currently valid</option><option value="upcoming">Upcoming</option><option value="expired">Expired</option></select>
      </div>

      {coupons.length === 0 ? (
        <EmptyState icon={Tag} title="No coupons yet" description="Create a coupon to offer discounts to customers." />
      ) : (
        <div className="overflow-x-auto rounded-lg border border-neutral-100 bg-white">
          <table className="w-full text-sm">
            <thead className="border-b border-neutral-100 text-left text-xs text-neutral-500">
              <tr>
                <th className="px-4 py-2.5">Code</th>
                <th className="px-4 py-2.5">Type</th>
                <th className="px-4 py-2.5">Value</th>
                <th className="px-4 py-2.5">Used</th>
                <th className="px-4 py-2.5">Expiry</th>
                <th className="px-4 py-2.5">Active</th>
                <th className="px-4 py-2.5"></th>
              </tr>
            </thead>
            <tbody>
              {coupons.map((c) => (
                <tr key={c.id} className="border-b border-neutral-50 last:border-0">
                  <td className="px-4 py-3 font-semibold text-neutral-900">{c.code}</td>
                  <td className="px-4 py-3 capitalize text-neutral-600">{c.type}</td>
                  <td className="px-4 py-3 text-neutral-600">{c.type === 'percentage' ? `${c.value}%` : `₹${c.value}`}</td>
                  <td className="px-4 py-3 text-neutral-600">{c.used_count}{c.usage_limit ? `/${c.usage_limit}` : ''}</td>
                  <td className="px-4 py-3 text-neutral-600">{new Date(c.valid_until).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <input type="checkbox" checked={c.is_active} onChange={() => toggleActive(c)} className="accent-brand-500" />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button type="button" onClick={() => openEdit(c)} className="text-neutral-400 hover:text-brand-600" aria-label={`Edit ${c.code}`}>
                        <Pencil size={15} />
                      </button>
                      <button type="button" onClick={() => remove(c.id)} className="text-neutral-400 hover:text-danger-500" aria-label={`Delete ${c.code}`}>
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Pagination meta={meta} onPageChange={load} />

      <Modal open={showModal} onClose={closeModal} title={editingCoupon ? 'Edit Coupon' : 'Create Coupon'}>
        <form onSubmit={handleSubmit} className="space-y-3">
          <Input label="Coupon Code" value={form.code} onChange={change('code')} error={err('code')} required />
          <Input label="Title" value={form.title} onChange={change('title')} error={err('title')} required />
          <Textarea label="Description" value={form.description} onChange={change('description')} error={err('description')} rows={2} />
          <div className="grid grid-cols-2 gap-3">
            <Select label="Type" value={form.type} onChange={change('type')}>
              <option value="percentage">Percentage</option>
              <option value="fixed">Fixed Amount</option>
            </Select>
            <Input label="Value" type="number" value={form.value} onChange={change('value')} error={err('value')} required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Min Order (₹)" type="number" value={form.min_order_amount} onChange={change('min_order_amount')} />
            <Input label="Max Discount (₹)" type="number" value={form.max_discount} onChange={change('max_discount')} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Usage Limit" type="number" value={form.usage_limit} onChange={change('usage_limit')} />
            <Input label="Per-User Limit" type="number" value={form.per_user_limit} onChange={change('per_user_limit')} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Valid From" type="date" value={form.valid_from} onChange={change('valid_from')} error={err('valid_from')} required />
            <Input label="Valid Until" type="date" value={form.valid_until} onChange={change('valid_until')} error={err('valid_until')} required />
          </div>
          <Button type="submit" loading={saving} className="w-full">
            {editingCoupon ? 'Save Changes' : 'Create Coupon'}
          </Button>
        </form>
      </Modal>
    </div>
  )
}
