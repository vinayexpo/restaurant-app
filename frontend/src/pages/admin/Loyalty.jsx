import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { Gem } from 'lucide-react'
import { adminService } from '../../services/adminService'
import { Input } from '../../components/Input'
import { Button } from '../../components/Button'

export default function AdminLoyalty() {
  const [config, setConfig] = useState(null)
  const [tiers, setTiers] = useState([]);
  const [savingConfig, setSavingConfig] = useState(false)
  const [bonusForm, setBonusForm] = useState({ user_id: '', points: '', reason: '' })
  const [grantingBonus, setGrantingBonus] = useState(false)

  useEffect(() => {
    adminService.loyaltyConfig().then(({ data }) => setConfig(data.data))
    adminService.loyaltyTiers().then(({ data }) => setTiers(data.data))
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

  const updateTier = async (tier, field, value) => {
    setTiers((prev) => prev.map((t) => (t.id === tier.id ? { ...t, [field]: value } : t)))
  }

  const saveTier = async (tier) => {
    try {
      await adminService.updateLoyaltyTier(tier.id, {
        min_lifetime_points: tier.min_lifetime_points,
        points_multiplier: tier.points_multiplier,
      })
      toast.success(`${tier.name} tier updated.`)
    } catch {
      toast.error('Could not update tier.')
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

      <div className="rounded-xl border border-neutral-100 bg-white p-5">
        <h2 className="mb-3 text-sm font-bold text-neutral-900">Tiers</h2>
        <div className="space-y-3">
          {tiers.map((tier) => (
            <div key={tier.id} className="flex items-center gap-3 rounded-md border border-neutral-100 p-3">
              <span className="w-20 shrink-0 rounded-full px-2 py-1 text-center text-xs font-bold text-white" style={{ backgroundColor: tier.badge_color }}>
                {tier.name}
              </span>
              <input
                type="number"
                value={tier.min_lifetime_points}
                onChange={(e) => updateTier(tier, 'min_lifetime_points', e.target.value)}
                className="h-8 w-28 rounded-md border border-neutral-200 px-2 text-xs"
              />
              <span className="text-xs text-neutral-400">min pts</span>
              <input
                type="number"
                step="0.01"
                value={tier.points_multiplier}
                onChange={(e) => updateTier(tier, 'points_multiplier', e.target.value)}
                className="h-8 w-20 rounded-md border border-neutral-200 px-2 text-xs"
              />
              <span className="text-xs text-neutral-400">×multiplier</span>
              <Button size="sm" variant="secondary" className="ml-auto" onClick={() => saveTier(tier)}>
                Save
              </Button>
            </div>
          ))}
        </div>
      </div>

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
