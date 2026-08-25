import { useEffect, useState } from 'react'
import { deliveryService } from '../../services/deliveryService'
import { Pagination } from '../../components/Pagination'
import { SkeletonListRow, SkeletonStat } from '../../components/Skeleton'
import { EmptyState } from '../../components/EmptyState'
import { Wallet } from 'lucide-react'

export default function DeliveryEarnings() {
  const [summary, setSummary] = useState(null)
  const [earnings, setEarnings] = useState([])
  const [meta, setMeta] = useState(null)
  const [loading, setLoading] = useState(true)
  const [payoutAccount, setPayoutAccount] = useState(null)
  const [selectedEarnings, setSelectedEarnings] = useState([])
  const [showAccountForm, setShowAccountForm] = useState(false)
  const [payoutStatus, setPayoutStatus] = useState('')

  const loadEarnings = (page = 1) => {
    deliveryService.earnings({ page }).then(({ data }) => {
      setEarnings(data.data)
      setMeta(data.meta)
      setSelectedEarnings([])
    })
  }

  useEffect(() => {
    Promise.all([deliveryService.earningsSummary(), deliveryService.earnings(), deliveryService.payoutAccount()])
      .then(([summaryRes, earningsRes, accountRes]) => {
        setSummary(summaryRes.data.data)
        setEarnings(earningsRes.data.data)
        setMeta(earningsRes.data.meta)
        setPayoutAccount(accountRes.data.data)
      })
      .finally(() => setLoading(false))
  }, [])

  const selectedAmount = earnings
    .filter((earning) => selectedEarnings.includes(earning.id))
    .reduce((total, earning) => total + Number(earning.amount_earned), 0)

  const toggleEarning = (earning) => {
    if (earning.status !== 'pending' || earning.delivery_payout_id) return
    setSelectedEarnings((ids) => ids.includes(earning.id) ? ids.filter((id) => id !== earning.id) : [...ids, earning.id])
  }

  const requestPayout = async () => {
    if (!payoutAccount || selectedEarnings.length === 0) return
    setPayoutStatus('Submitting payout request...')
    try {
      await deliveryService.requestPayout({ payout_account_id: payoutAccount.id, earning_ids: selectedEarnings })
      setPayoutStatus('Payout requested. It will be transferred after approval.')
      setSelectedEarnings([])
      loadEarnings()
    } catch (error) {
      setPayoutStatus(error.response?.data?.message ?? 'Payout request failed.')
    }
  }

  if (loading) {
    return (
      <div className="space-y-3 p-4">
        <div className="grid grid-cols-3 gap-3">
          <SkeletonStat />
          <SkeletonStat />
          <SkeletonStat />
        </div>
        <SkeletonListRow />
      </div>
    )
  }

  return (
    <div className="p-4">
      <h1 className="mb-4 text-lg font-bold text-neutral-900">Earnings</h1>

      <div className="mb-6 grid grid-cols-3 gap-3">
        <SummaryCard label="Today" value={summary.today} />
        <SummaryCard label="This Week" value={summary.week} />
        <SummaryCard label="This Month" value={summary.month} />
      </div>

      {meta && (
        <div className="mb-4 flex justify-between rounded-lg bg-brand-50 px-4 py-3 text-sm">
          <span className="text-brand-700">Total Earned</span>
          <span className="font-bold text-brand-700">₹{meta.total_earned?.toFixed(0)}</span>
        </div>
      )}

      <section className="mb-6 rounded-lg border border-neutral-100 bg-white p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold text-neutral-900">Payout account</h2>
            <p className="mt-1 text-xs text-neutral-500">{payoutAccount ? payoutAccount.summary : 'Add a bank account or UPI ID to withdraw earnings.'}</p>
          </div>
          <button className="text-sm font-semibold text-brand-700" onClick={() => setShowAccountForm((visible) => !visible)}>
            {payoutAccount ? 'Change' : 'Add account'}
          </button>
        </div>
        {showAccountForm && <PayoutAccountForm onSaved={(account) => { setPayoutAccount(account); setShowAccountForm(false) }} />}
      </section>

      <section className="mb-6 rounded-lg bg-neutral-900 p-4 text-white">
        <p className="text-xs font-medium uppercase tracking-wide text-neutral-400">Selected for withdrawal</p>
        <div className="mt-1 flex items-end justify-between gap-4">
          <p className="text-2xl font-bold">₹{selectedAmount.toFixed(0)}</p>
          <button
            className="rounded-md bg-accent-500 px-3 py-2 text-sm font-bold text-neutral-950 disabled:cursor-not-allowed disabled:opacity-40"
            disabled={!payoutAccount || selectedEarnings.length === 0}
            onClick={requestPayout}
          >
            Request payout
          </button>
        </div>
        {payoutStatus && <p className="mt-2 text-xs text-neutral-300">{payoutStatus}</p>}
      </section>

      <h2 className="mb-2 text-sm font-bold text-neutral-900">Per-Order History</h2>
      {earnings.length === 0 ? (
        <EmptyState icon={Wallet} title="No earnings yet" description="Complete deliveries to start earning." />
      ) : (
        <div className="divide-y divide-neutral-100 rounded-lg border border-neutral-100 bg-white">
          {earnings.map((e) => (
            <button key={e.id} className="flex w-full items-center justify-between px-4 py-3 text-left disabled:cursor-default" disabled={e.status !== 'pending' || Boolean(e.delivery_payout_id)} onClick={() => toggleEarning(e)}>
              <div>
                <p className="text-sm font-medium text-neutral-900">{e.order?.order_number}</p>
                <p className="text-xs text-neutral-400">{new Date(e.created_at).toLocaleDateString()} {e.delivery_payout_id ? '· Withdrawal pending' : e.status === 'paid' ? '· Paid' : ''}</p>
              </div>
              <div className="flex items-center gap-3">
                <p className="text-sm font-bold text-accent-600">₹{Number(e.amount_earned).toFixed(0)}</p>
                {e.status === 'pending' && !e.delivery_payout_id && <span className={`h-4 w-4 rounded border ${selectedEarnings.includes(e.id) ? 'border-brand-600 bg-brand-600' : 'border-neutral-300'}`} />}
              </div>
            </button>
          ))}
        </div>
      )}

      <Pagination meta={meta} onPageChange={loadEarnings} />
    </div>
  )
}

function PayoutAccountForm({ onSaved }) {
  const [type, setType] = useState('bank_account')
  const [saving, setSaving] = useState(false)

  const save = async (event) => {
    event.preventDefault()
    setSaving(true)
    const form = new FormData(event.currentTarget)
    try {
      const { data } = await deliveryService.savePayoutAccount(Object.fromEntries(form.entries()))
      onSaved(data.data)
    } finally {
      setSaving(false)
    }
  }

  return (
    <form className="mt-4 space-y-3 border-t border-neutral-100 pt-4" onSubmit={save}>
      <select name="type" value={type} onChange={(event) => setType(event.target.value)} className="w-full rounded-md border border-neutral-200 px-3 py-2 text-sm">
        <option value="bank_account">Bank account</option>
        <option value="upi">UPI ID</option>
      </select>
      {type === 'bank_account' ? <>
        <input name="account_holder_name" required placeholder="Account holder name" className="w-full rounded-md border border-neutral-200 px-3 py-2 text-sm" />
        <input name="account_number" required inputMode="numeric" placeholder="Account number" className="w-full rounded-md border border-neutral-200 px-3 py-2 text-sm" />
        <input name="ifsc_code" required placeholder="IFSC code" className="w-full rounded-md border border-neutral-200 px-3 py-2 text-sm" />
      </> : <input name="upi_id" required placeholder="UPI ID (name@bank)" className="w-full rounded-md border border-neutral-200 px-3 py-2 text-sm" />}
      <button disabled={saving} className="rounded-md bg-brand-600 px-3 py-2 text-sm font-bold text-white disabled:opacity-50">{saving ? 'Saving...' : 'Save payout account'}</button>
    </form>
  )
}

function SummaryCard({ label, value }) {
  return (
    <div className="rounded-lg border border-neutral-100 bg-white p-3 text-center">
      <p className="text-xs text-neutral-400">{label}</p>
      <p className="mt-1 text-lg font-bold text-neutral-900">₹{value?.toFixed(0) ?? 0}</p>
    </div>
  )
}
