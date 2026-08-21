import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { Plus, Settings2, Pencil, Trash2 } from 'lucide-react'
import { ownerService } from '../../services/ownerService'
import { VegBadge, NonVegBadge } from '../../components/VegBadge'
import { Button } from '../../components/Button'
import { EmptyState } from '../../components/EmptyState'
import { SkeletonListRow } from '../../components/Skeleton'

export default function MenuItems() {
  const navigate = useNavigate()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  const load = () =>
    ownerService.menuItems({ per_page: 100 }).then(({ data }) => setItems(data.data))

  useEffect(() => {
    load().finally(() => setLoading(false))
  }, [])

  const toggleAvailability = async (item) => {
    const formData = new FormData()
    formData.append('is_available', item.is_available ? '0' : '1')
    await ownerService.updateMenuItem(item.id, formData)
    setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, is_available: !i.is_available } : i)))
  }

  const remove = async (id) => {
    if (!window.confirm('Delete this menu item?')) return
    await ownerService.deleteMenuItem(id)
    toast.success('Item deleted.')
    load()
  }

  const grouped = items.reduce((acc, item) => {
    const catName = item.category?.name ?? 'Uncategorized'
    acc[catName] = acc[catName] ?? []
    acc[catName].push(item)
    return acc
  }, {})

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-lg font-bold text-neutral-900">Menu Items</h1>
        <div className="flex gap-2">
          <Link to="/owner/menu/categories">
            <Button size="sm" variant="secondary">
              <Settings2 size={14} /> Categories
            </Button>
          </Link>
          <Button size="sm" onClick={() => navigate('/owner/menu/items/new')}>
            <Plus size={14} /> Add Item
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonListRow key={i} />
          ))}
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          title="No menu items yet"
          description="Add your first item to start building your menu."
          action={
            <Button onClick={() => navigate('/owner/menu/items/new')}>
              <Plus size={14} /> Add Item
            </Button>
          }
        />
      ) : (
        Object.entries(grouped).map(([catName, catItems]) => (
          <div key={catName} className="mb-6">
            <h2 className="mb-2 text-sm font-bold text-neutral-700">{catName}</h2>
            <div className="space-y-2">
              {catItems.map((item) => (
                <div key={item.id} className="flex items-center gap-3 rounded-lg border border-neutral-100 bg-white p-3.5">
                  {item.is_veg ? <VegBadge /> : <NonVegBadge />}
                  <div className="flex-1">
                    <p className="text-sm font-medium text-neutral-900">{item.name}</p>
                    <p className="text-xs text-neutral-500">₹{item.price}</p>
                  </div>
                  <label className="flex items-center gap-1.5 text-xs text-neutral-500">
                    <input type="checkbox" checked={item.is_available} onChange={() => toggleAvailability(item)} className="accent-brand-500" />
                    Available
                  </label>
                  <button onClick={() => navigate(`/owner/menu/items/${item.id}/edit`)} className="p-1.5 text-neutral-400 hover:text-brand-500">
                    <Pencil size={15} />
                  </button>
                  <button onClick={() => remove(item.id)} className="p-1.5 text-neutral-400 hover:text-danger-500">
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  )
}
