import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { ArrowLeft, Plus, Trash2 } from 'lucide-react'
import { ownerService } from '../../services/ownerService'
import { Input } from '../../components/Input'
import { Textarea } from '../../components/Textarea'
import { Select } from '../../components/Select'
import { Button } from '../../components/Button'

export default function ItemForm() {
  const { id } = useParams()
  const isEdit = !!id
  const navigate = useNavigate()

  const [categories, setCategories] = useState([])
  const [form, setForm] = useState({
    category_id: '',
    name: '',
    description: '',
    price: '',
    discounted_price: '',
    is_veg: true,
    preparation_time: '15',
  })
  const [image, setImage] = useState(null)
  const [existingImage, setExistingImage] = useState(null)
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)

  const [variants, setVariants] = useState([])
  const [newVariant, setNewVariant] = useState({ name: '', price: '' })

  useEffect(() => {
    ownerService.categories().then(({ data }) => setCategories(data.data))

    if (isEdit) {
      ownerService.menuItems().then(({ data }) => {
        const item = data.data.find((i) => i.id === Number(id))
        if (item) {
          setForm({
            category_id: item.category_id,
            name: item.name,
            description: item.description ?? '',
            price: item.price,
            discounted_price: item.discounted_price ?? '',
            is_veg: item.is_veg,
            preparation_time: item.preparation_time,
          })
          setVariants(item.variants ?? [])
          setExistingImage(item.image ?? null)
        }
      })
    }
  }, [id, isEdit])

  const change = (field) => (e) => setForm((p) => ({ ...p, [field]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrors({})
    setSaving(true)

    const formData = new FormData()
    Object.entries(form).forEach(([key, value]) => {
      if (key === 'is_veg') formData.append(key, value ? '1' : '0')
      else if (value !== '') formData.append(key, value)
    })
    if (image) formData.append('image', image)

    try {
      if (isEdit) {
        await ownerService.updateMenuItem(id, formData)
        toast.success('Item updated.')
      } else {
        const { data } = await ownerService.createMenuItem(formData)
        toast.success('Item created.')
        navigate(`/owner/menu/items/${data.data.id}/edit`, { replace: true })
        return
      }
      navigate('/owner/menu/items')
    } catch (error) {
      setErrors(error.response?.data?.errors ?? {})
    } finally {
      setSaving(false)
    }
  }

  const addVariant = async () => {
    if (!newVariant.name || !newVariant.price) return
    const { data } = await ownerService.addVariant(id, newVariant)
    setVariants((prev) => [...prev, data.data])
    setNewVariant({ name: '', price: '' })
  }

  const removeVariant = async (variantId) => {
    await ownerService.deleteVariant(id, variantId)
    setVariants((prev) => prev.filter((v) => v.id !== variantId))
  }

  const err = (field) => {
    const e = errors[field]
    return Array.isArray(e) ? e[0] : e
  }

  return (
    <div className="mx-auto max-w-lg">
      <button onClick={() => navigate('/owner/menu/items')} className="mb-4 flex items-center gap-1 text-sm text-neutral-500 hover:text-neutral-700">
        <ArrowLeft size={14} /> Back to Menu
      </button>
      <h1 className="mb-4 text-lg font-bold text-neutral-900">{isEdit ? 'Edit Item' : 'Add Item'}</h1>

      <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-neutral-100 bg-white p-5">
        <label className="flex cursor-pointer items-center gap-3 rounded-md border border-dashed border-neutral-300 p-3 text-sm text-neutral-500">
          {image ? (
            <img src={URL.createObjectURL(image)} alt="" className="size-12 shrink-0 rounded-md object-cover" />
          ) : existingImage ? (
            <img src={existingImage} alt="" className="size-12 shrink-0 rounded-md object-cover" />
          ) : null}
          {image ? image.name : existingImage ? 'Change item photo' : 'Upload item photo'}
          <input type="file" accept="image/*" className="hidden" onChange={(e) => setImage(e.target.files?.[0] ?? null)} />
        </label>

        <Select label="Category" value={form.category_id} onChange={change('category_id')} required>
          <option value="">Select category</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </Select>

        <Input label="Item Name" value={form.name} onChange={change('name')} error={err('name')} required />
        <Textarea label="Description" value={form.description} onChange={change('description')} rows={3} />

        <div className="grid grid-cols-2 gap-3">
          <Input label="Price (₹)" type="number" value={form.price} onChange={change('price')} error={err('price')} required />
          <Input label="Discounted Price (₹)" type="number" value={form.discounted_price} onChange={change('discounted_price')} />
        </div>

        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-sm text-neutral-700">
            <input type="radio" checked={form.is_veg} onChange={() => setForm((p) => ({ ...p, is_veg: true }))} className="accent-accent-500" />
            Veg
          </label>
          <label className="flex items-center gap-2 text-sm text-neutral-700">
            <input type="radio" checked={!form.is_veg} onChange={() => setForm((p) => ({ ...p, is_veg: false }))} className="accent-danger-500" />
            Non-Veg
          </label>
        </div>

        <Input label="Preparation Time (min)" type="number" value={form.preparation_time} onChange={change('preparation_time')} />

        {isEdit && (
          <div className="border-t border-neutral-100 pt-4">
            <p className="mb-2 text-sm font-bold text-neutral-900">Variants</p>
            {variants.map((v) => (
              <div key={v.id} className="mb-2 flex items-center justify-between rounded-md border border-neutral-200 px-3 py-2 text-sm">
                <span>{v.name} — ₹{v.price}</span>
                <button type="button" onClick={() => removeVariant(v.id)} className="text-danger-500">
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
            <div className="flex gap-2">
              <input
                placeholder="Name (e.g. Large)"
                value={newVariant.name}
                onChange={(e) => setNewVariant((p) => ({ ...p, name: e.target.value }))}
                className="h-9 flex-1 rounded-md border border-neutral-200 px-2.5 text-sm"
              />
              <input
                placeholder="Price"
                type="number"
                value={newVariant.price}
                onChange={(e) => setNewVariant((p) => ({ ...p, price: e.target.value }))}
                className="h-9 w-24 rounded-md border border-neutral-200 px-2.5 text-sm"
              />
              <button type="button" onClick={addVariant} className="flex size-9 items-center justify-center rounded-md bg-brand-50 text-brand-600">
                <Plus size={15} />
              </button>
            </div>
          </div>
        )}

        <Button type="submit" loading={saving} className="w-full">
          {isEdit ? 'Save Changes' : 'Create Item'}
        </Button>
      </form>
    </div>
  )
}
