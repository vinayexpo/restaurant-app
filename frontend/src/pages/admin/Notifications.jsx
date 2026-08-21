import { useState } from 'react'
import toast from 'react-hot-toast'
import { Send } from 'lucide-react'
import { adminService } from '../../services/adminService'
import { Input } from '../../components/Input'
import { Textarea } from '../../components/Textarea'
import { Select } from '../../components/Select'
import { Button } from '../../components/Button'

export default function AdminNotifications() {
  const [form, setForm] = useState({ title: '', body: '', target: 'all', user_id: '' })
  const [sending, setSending] = useState(false)
  const [log, setLog] = useState([])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSending(true)
    try {
      const { data } = await adminService.broadcastNotification(form)
      toast.success(`Sent to ${data.data.sent_count} users.`)
      setLog((prev) => [{ ...form, sent_count: data.data.sent_count, at: new Date() }, ...prev])
      setForm({ title: '', body: '', target: 'all', user_id: '' })
    } catch {
      toast.error('Could not send notification.')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <h1 className="text-lg font-bold text-neutral-900">Notification Broadcaster</h1>

      <form onSubmit={handleSubmit} className="space-y-3 rounded-xl border border-neutral-100 bg-white p-5">
        <Input label="Title" value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} required />
        <Textarea label="Message" value={form.body} onChange={(e) => setForm((p) => ({ ...p, body: e.target.value }))} rows={4} required />
        <Select label="Target Audience" value={form.target} onChange={(e) => setForm((p) => ({ ...p, target: e.target.value }))}>
          <option value="all">All Users</option>
          <option value="customer">All Customers</option>
          <option value="restaurant_owner">All Restaurant Owners</option>
          <option value="delivery_partner">All Delivery Partners</option>
          <option value="user">Specific User (by ID)</option>
        </Select>
        {form.target === 'user' && (
          <Input label="User ID" type="number" value={form.user_id} onChange={(e) => setForm((p) => ({ ...p, user_id: e.target.value }))} required />
        )}
        <Button type="submit" loading={sending} className="w-full">
          <Send size={14} /> Send Notification
        </Button>
      </form>

      {log.length > 0 && (
        <div>
          <h2 className="mb-2 text-sm font-bold text-neutral-900">Sent Log</h2>
          <div className="space-y-2">
            {log.map((entry, i) => (
              <div key={i} className="rounded-lg border border-neutral-100 bg-white p-3 text-sm">
                <p className="font-medium text-neutral-900">{entry.title}</p>
                <p className="text-xs text-neutral-500">Sent to {entry.sent_count} users — {entry.at.toLocaleTimeString()}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
