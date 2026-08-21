import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { Plus, Trash2, Pencil, ArrowUp, ArrowDown, ArrowLeft } from 'lucide-react'
import { ownerService } from '../../services/ownerService'
import { Input } from '../../components/Input'
import { Button } from '../../components/Button'
import { Modal } from '../../components/Modal'
import { EmptyState } from '../../components/EmptyState'

export default function CategoryManager() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [name, setName] = useState('')
  const [saving, setSaving] = useState(false)

  const load = () =>
    ownerService.categories().then(({ data }) => setCategories(data.data.sort((a, b) => a.sort_order - b.sort_order)))

  useEffect(() => {
    load().finally(() => setLoading(false))
  }, [])

  const openNew = () => {
    setEditing(null)
    setName('')
    setShowModal(true)
  }

  const openEdit = (cat) => {
    setEditing(cat)
    setName(cat.name)
    setShowModal(true)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      if (editing) {
        await ownerService.updateCategory(editing.id, { name })
      } else {
        await ownerService.createCategory({ name, sort_order: categories.length })
      }
      setShowModal(false)
      load()
    } catch {
      toast.error('Could not save category.')
    } finally {
      setSaving(false)
    }
  }

  const remove = async (id) => {
    if (!window.confirm('Delete this category? Menu items inside it will also be affected.')) return
    await ownerService.deleteCategory(id)
    load()
  }

  const move = async (index, direction) => {
    const swapIndex = index + direction
    if (swapIndex < 0 || swapIndex >= categories.length) return
    const reordered = [...categories]
    ;[reordered[index], reordered[swapIndex]] = [reordered[swapIndex], reordered[index]]
    setCategories(reordered)
    await Promise.all(reordered.map((cat, i) => ownerService.updateCategory(cat.id, { sort_order: i })))
    load()
  }

  if (loading) return null

  return (
    <div>
      <Link to="/owner/menu/items" className="mb-4 flex items-center gap-1 text-sm text-neutral-500 hover:text-neutral-700">
        <ArrowLeft size={14} /> Back to Menu
      </Link>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-lg font-bold text-neutral-900">Categories</h1>
        <Button size="sm" onClick={openNew}>
          <Plus size={14} /> Add Category
        </Button>
      </div>

      {categories.length === 0 ? (
        <EmptyState title="No categories yet" description="Add a category to start organizing your menu." />
      ) : (
        <div className="space-y-2">
          {categories.map((cat, i) => (
            <div key={cat.id} className="flex items-center justify-between rounded-lg border border-neutral-100 bg-white p-3.5">
              <span className="text-sm font-medium text-neutral-900">{cat.name}</span>
              <div className="flex items-center gap-1">
                <button onClick={() => move(i, -1)} disabled={i === 0} className="p-1.5 text-neutral-400 disabled:opacity-30">
                  <ArrowUp size={15} />
                </button>
                <button onClick={() => move(i, 1)} disabled={i === categories.length - 1} className="p-1.5 text-neutral-400 disabled:opacity-30">
                  <ArrowDown size={15} />
                </button>
                <button onClick={() => openEdit(cat)} className="p-1.5 text-neutral-400 hover:text-brand-500">
                  <Pencil size={15} />
                </button>
                <button onClick={() => remove(cat.id)} className="p-1.5 text-neutral-400 hover:text-danger-500">
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={showModal} onClose={() => setShowModal(false)} title={editing ? 'Edit Category' : 'Add Category'}>
        <form onSubmit={handleSave} className="space-y-3">
          <Input label="Category Name" value={name} onChange={(e) => setName(e.target.value)} required />
          <Button type="submit" loading={saving} className="w-full">
            Save
          </Button>
        </form>
      </Modal>
    </div>
  )
}
