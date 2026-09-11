import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { Gem, Plus, Save, Trash2 } from 'lucide-react'
import { adminService } from '../../services/adminService'
import { Input } from '../../components/Input'
import { Button } from '../../components/Button'

export default function AdminLoyalty() {
  const [config, setConfig] = useState(null)
  const [tiers, setTiers] = useState([])
  const [savingConfig, setSavingConfig] = useState(false)
  const [newTier, setNewTier] = useState({ name: '', min_lifetime_points: '', points_multiplier: '1', badge_color: '#CD7F32' })
  const [creatingTier, setCreatingTier] = useState(false)
  const [savingTierId, setSavingTierId] = useState(null)
  const [deletingTierId, setDeletingTierId] = useState(null)
  const [bonusForm, setBonusForm] = useState({ user_id: '', points: '', reason: '' })
  const [grantingBonus, setGrantingBonus] = useState(false)

  const loadTiers = async () => {
    try {
      const { data } = await adminService.loyaltyTiers()
      setTiers(data.data)
    } catch {
      toast.error('Could not load loyalty tiers.')
    }
  }

  useEffect(() => {
    adminService.loyaltyConfig().then(({ data }) => setConfig(data.data))
    loadTiers()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (!config) return null

  const changeConfig = (key) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setConfig((p) => ({ ...p, [key]: value }))
  }

  const saveConfig = async () => {
    setSavingConfig(true)
    try {
      await adminService.updateLoyaltyConfig(config)
      toast.success('Loyalty config updated.')
    } catch {
      toast.error('Could not update config.')
    } finally {
      setSavingConfig(false)
    }
  }

  const updateTier = (tier, field, value) => {
    setTiers((prev) => prev.map((t) => (t.id === tier.id ? { ...t, [field]: value } : t)))
  }

  const saveTier = async (tier) => {
    setSavingTierId(tier.id)
    try {
      await adminService.updateLoyaltyTier(tier.id, {
        name: tier.name,
        min_lifetime_points: tier.min_lifetime_points,
        points_multiplier: tier.points_multiplier,
        badge_color: tier.badge_color,
      })
      toast.success(`${tier.name} tier updated.`)
    } catch {
      toast.error('Could not update tier.')
    } finally {
      setSavingTierId(null)
    }
  }

  const createTier = async (e) => {
    e.preventDefault()
    setCreatingTier(true)
    try {
      await adminService.createLoyaltyTier({
        ...newTier,
        min_lifetime_points: Number(newTier.min_lifetime_points),
        points_multiplier: Number(newTier.points_multiplier),
      })
      setNewTier({ name: '', min_lifetime_points: '', points_multiplier: '1', badge_color: '#CD7F32' })
      await loadTiers()
      toast.success('Tier created.')
    } catch (error) {
      toast.error(error.response?.data?.message ?? 'Could not create tier.')
    } finally {
      setCreatingTier(false)
    }
  }

  const deleteTier = async (tier) => {
    if (!window.confirm(`Delete the ${tier.name} tier? This cannot be undone.`)) return
    setDeletingTierId(tier.id)
    try {
      await adminService.deleteLoyaltyTier(tier.id)
      setTiers((prev) => prev.filter((item) => item.id !== tier.id))
      toast.success(`${tier.name} tier deleted.`)
    } catch (error) {
      toast.error(error.response?.data?.message ?? 'Could not delete tier.')
    } finally {
      setDeletingTierId(null)
    }
  }

  const submitBonus = async (e) => {
    e.preventDefault()
    setGrantingBonus(true)
    try {
      await adminService.grantLoyaltyBonus(bonusForm)
      toast.success('Bonus points granted.')
      setBonusForm({ user_id: '', points: '', reason: '' })
    } catch (error) {
      toast.error(error.response?.data?.message ?? 'Could not grant bonus.')
    } finally {
      setGrantingBonus(false)
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-lg font-bold text-neutral-900">Loyalty Program</h1>

      <div className="rounded-xl border border-neutral-100 bg-white p-5">
        <h2 className="mb-3 text-sm font-bold text-neutral-900">Program Configuration</h2>
        <div className="grid grid-cols-2 gap-3">
          <Input label="Earn Rate (₹ per point)" type="number" value={config.loyalty_earn_rate} onChange={changeConfig('loyalty_earn_rate')} />
          <Input label="Redeem Rate (₹ per point)" type="number" step="0.01" value={config.loyalty_redeem_rate} onChange={changeConfig('loyalty_redeem_rate')} />
          <Input label="Min Points to Redeem" type="number" value={config.loyalty_min_redeem} onChange={changeConfig('loyalty_min_redeem')} />
          <Input label="Max Redeem % of Order" type="number" value={config.loyalty_max_redeem_pct} onChange={changeConfig('loyalty_max_redeem_pct')} />
          <Input label="Points Expiry (months)" type="number" value={config.loyalty_expiry_months} onChange={changeConfig('loyalty_expiry_months')} />
        </div>
        <label className="mt-3 flex items-center gap-2 text-sm text-neutral-700">
          <input type="checkbox" checked={config.loyalty_enabled} onChange={changeConfig('loyalty_enabled')} className="accent-brand-500" />
          Loyalty program enabled
        </label>
        <Button size="sm" className="mt-4" loading={savingConfig} onClick={saveConfig}>
          Save Configuration
        </Button>
      </div>

      <section className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm">
        <div className="border-b border-neutral-100 bg-neutral-50 px-5 py-4">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-sm font-bold text-neutral-900">Loyalty Tiers</h2>
              <p className="text-xs text-neutral-500">Set customer progress thresholds and point rewards.</p>
            </div>
            <span className="w-fit rounded-full bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-700">{tiers.length} active</span>
          </div>
        </div>

        <form onSubmit={createTier} className="grid gap-3 border-b border-neutral-100 bg-brand-50/40 p-4 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_auto_auto] lg:items-end">
          <Input label="Tier name" value={newTier.name} onChange={(e) => setNewTier((prev) => ({ ...prev, name: e.target.value }))} placeholder="e.g. Gold" required />
          <Input label="Starts at points" type="number" min="0" value={newTier.min_lifetime_points} onChange={(e) => setNewTier((prev) => ({ ...prev, min_lifetime_points: e.target.value }))} required />
          <Input label="Points multiplier" type="number" min="0.1" step="0.1" value={newTier.points_multiplier} onChange={(e) => setNewTier((prev) => ({ ...prev, points_multiplier: e.target.value }))} required />
          <label className="block text-sm font-medium text-neutral-700">
            Badge colour
            <input type="color" value={newTier.badge_color} onChange={(e) => setNewTier((prev) => ({ ...prev, badge_color: e.target.value }))} className="mt-1 block h-10 w-full cursor-pointer rounded-md border border-neutral-200 bg-white p-1" />
          </label>
          <Button type="submit" size="sm" loading={creatingTier} className="h-10"><Plus size={15} /> Add Tier</Button>
        </form>

        <div className="grid gap-3 p-4 lg:grid-cols-2">
          {tiers.map((tier) => (
            <article key={tier.id} className="rounded-lg border border-neutral-200 bg-white p-4">
              <div className="mb-4 flex items-center gap-3">
                <span className="size-10 shrink-0 rounded-full border-4 border-white shadow-sm" style={{ backgroundColor: tier.badge_color }} />
                <div className="min-w-0 flex-1">
                  <input value={tier.name} onChange={(e) => updateTier(tier, 'name', e.target.value)} className="w-full border-0 bg-transparent p-0 text-sm font-bold text-neutral-900 focus:outline-none" aria-label="Tier name" />
                  <p className="text-xs text-neutral-500">Customer rewards tier</p>
                </div>
                <input type="color" value={tier.badge_color} onChange={(e) => updateTier(tier, 'badge_color', e.target.value)} className="size-8 cursor-pointer rounded border border-neutral-200 bg-white p-0.5" aria-label={`${tier.name} badge colour`} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <label className="text-xs font-medium text-neutral-600">Starts at points<input type="number" min="0" value={tier.min_lifetime_points} onChange={(e) => updateTier(tier, 'min_lifetime_points', e.target.value)} className="mt-1 h-9 w-full rounded-md border border-neutral-200 px-2 text-sm text-neutral-900" /></label>
                <label className="text-xs font-medium text-neutral-600">Points multiplier<input type="number" min="0.1" step="0.1" value={tier.points_multiplier} onChange={(e) => updateTier(tier, 'points_multiplier', e.target.value)} className="mt-1 h-9 w-full rounded-md border border-neutral-200 px-2 text-sm text-neutral-900" /></label>
              </div>
              <div className="mt-4 flex items-center justify-between border-t border-neutral-100 pt-3">
                <button type="button" onClick={() => deleteTier(tier)} disabled={deletingTierId === tier.id} className="inline-flex items-center gap-1.5 text-xs font-semibold text-danger-600 disabled:opacity-50"><Trash2 size={14} /> Delete</button>
                <Button size="sm" variant="secondary" loading={savingTierId === tier.id} onClick={() => saveTier(tier)}><Save size={14} /> Save changes</Button>
              </div>
            </article>
          ))}
          {tiers.length === 0 && <p className="col-span-full rounded-lg border border-dashed border-neutral-200 py-8 text-center text-sm text-neutral-500">No tiers yet. Add the first tier above.</p>}
        </div>
      </section>

      <div className="rounded-xl border border-neutral-100 bg-white p-5">
        <h2 className="mb-3 flex items-center gap-1.5 text-sm font-bold text-neutral-900">
          <Gem size={15} className="text-brand-500" /> Grant Bonus Points
        </h2>
        <form onSubmit={submitBonus} className="space-y-3">
          <Input label="User ID" type="number" value={bonusForm.user_id} onChange={(e) => setBonusForm((p) => ({ ...p, user_id: e.target.value }))} required />
          <Input label="Points" type="number" value={bonusForm.points} onChange={(e) => setBonusForm((p) => ({ ...p, points: e.target.value }))} required />
          <Input label="Reason" value={bonusForm.reason} onChange={(e) => setBonusForm((p) => ({ ...p, reason: e.target.value }))} required />
          <Button type="submit" size="sm" loading={grantingBonus}>
            Grant Bonus
          </Button>
        </form>
      </div>
    </div>
  )
}
