import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { Plus, Trash2, Tag, Search } from 'lucide-react'
import { adminService } from '../../services/adminService'
import { Input } from '../../components/Input'
import { Select } from '../../components/Select'
import { Button } from '../../components/Button'
import { Modal } from '../../components/Modal'
import { Pagination } from '../../components/Pagination'
import { EmptyState } from '../../components/EmptyState'

const emptyForm = {
  code: '',
  title: '',
  type: 'percentage',
  value: '',
  min_order_amount: '0',
  max_discount: '',
  usage_limit: '',
  per_user_limit: '1',
  valid_from: '',
  valid_until: '',
}

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState([])
  const [meta, setMeta] = useState({ page: 1, last_page: 1 })
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState('')
  const [isActive, setIsActive] = useState('')

  const load = (page = 1) =>
    adminService.coupons({ page, search: search || undefined, is_active: isActive || undefined }).then(({ data }) => {
      setCoupons(data.data)
      setMeta(data.meta)
    })

  useEffect(() => {
    const timer = setTimeout(() => load(1).finally(() => setLoading(false)), search ? 300 : 0)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, isActive])

  const change = (field) => (e) => setForm((p) => ({ ...p, [field]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrors({})
    setSaving(true)
    try {
      await adminService.createCoupon(form)
      setShowModal(false)
      setForm(emptyForm)
      toast.success('Coupon created.')
      load()
    } catch (error) {
      setErrors(error.response?.data?.errors ?? {})
    } finally {
      setSaving(false)
    }
  }

  const remove = async (id) => {
    if (!window.confirm('Delete this coupon?')) return
    await adminService.deleteCoupon(id)
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
        <h1 className="text-lg font-bold text-neutral-900">Platform Coupons</h1>
        <Button size="sm" onClick={() => setShowModal(true)}>
          <Plus size={14} /> Create Coupon
        </Button>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        <div className="relative min-w-52 flex-1">
          <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search code or title..." className="h-9 w-full rounded-md border border-neutral-200 pl-9 pr-3 text-sm" />
        </div>
        <select value={isActive} onChange={(e) => setIsActive(e.target.value)} className="h-9 rounded-md border border-neutral-200 px-3 text-sm">
          <option value="">All Statuses</option>
          <option value="1">Active</option>
          <option value="0">Inactive</option>
        </select>
      </div>

      {coupons.length === 0 ? (
        <EmptyState icon={Tag} title="No platform-wide coupons yet" />
      ) : (
        <div className="overflow-x-auto rounded-lg border border-neutral-100 bg-white">
          <table className="w-full text-sm">
            <thead className="border-b border-neutral-100 text-left text-xs text-neutral-500">
              <tr>
                <th className="px-4 py-2.5">Code</th>
                <th className="px-4 py-2.5">Value</th>
                <th className="px-4 py-2.5">Used</th>
                <th className="px-4 py-2.5">Expiry</th>
                <th className="px-4 py-2.5"></th>
              </tr>
            </thead>
            <tbody>
              {coupons.map((c) => (
                <tr key={c.id} className="border-b border-neutral-50 last:border-0">
                  <td className="px-4 py-3 font-semibold text-neutral-900">{c.code}</td>
                  <td className="px-4 py-3 text-neutral-600">{c.type === 'percentage' ? `${c.value}%` : `₹${c.value}`}</td>
                  <td className="px-4 py-3 text-neutral-600">{c.used_count}{c.usage_limit ? `/${c.usage_limit}` : ''}</td>
                  <td className="px-4 py-3 text-neutral-600">{new Date(c.valid_until).toLocaleDateString()}</td>
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

      <Pagination meta={meta} onPageChange={load} />

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Create Platform Coupon">
        <form onSubmit={handleSubmit} className="space-y-3">
          <Input label="Coupon Code" value={form.code} onChange={change('code')} error={err('code')} required />
          <Input label="Title" value={form.title} onChange={change('title')} error={err('title')} required />
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
            Create Coupon
          </Button>
        </form>
      </Modal>
    </div>
  )
}
