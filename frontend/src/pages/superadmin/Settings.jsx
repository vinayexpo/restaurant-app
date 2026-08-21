import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { superadminService } from '../../services/superadminService'
import { SkeletonListRow } from '../../components/Skeleton'

export default function SuperadminSettings() {
  const [settings, setSettings] = useState([])
  const [loading, setLoading] = useState(true)
  const [drafts, setDrafts] = useState({})

  const load = () =>
    superadminService
      .settings()
      .then(({ data }) => setSettings(data.data))
      .finally(() => setLoading(false))

  useEffect(() => {
    load()
  }, [])

  const save = async (setting) => {
    const value = drafts[setting.key] ?? setting.value
    if (!window.confirm(`Update "${setting.key}" to "${value}"?`)) return
    try {
      await superadminService.updateSetting(setting.key, { value, cast: setting.cast })
      toast.success('Setting updated.')
      load()
    } catch {
      toast.error('Could not update setting.')
    }
  }

  if (loading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonListRow key={i} />
        ))}
      </div>
    )
  }

  return (
    <div>
      <h1 className="mb-4 text-lg font-bold text-neutral-900">Platform Settings</h1>
      <p className="mb-4 text-xs text-neutral-500">Includes superadmin-only keys (tax rate, commission defaults, maintenance mode).</p>
      <div className="overflow-x-auto rounded-lg border border-neutral-100 bg-white">
        <table className="w-full text-sm">
          <thead className="border-b border-neutral-100 text-left text-xs text-neutral-500">
            <tr>
              <th className="px-4 py-2.5">Key</th>
              <th className="px-4 py-2.5">Type</th>
              <th className="px-4 py-2.5">Value</th>
              <th className="px-4 py-2.5"></th>
            </tr>
          </thead>
          <tbody>
            {settings.map((s) => (
              <tr key={s.key} className="border-b border-neutral-50 last:border-0">
                <td className="px-4 py-3 font-mono text-xs text-neutral-900">{s.key}</td>
                <td className="px-4 py-3 text-neutral-500">{s.cast}</td>
                <td className="px-4 py-3">
                  <input
                    defaultValue={s.value}
                    onChange={(e) => setDrafts((p) => ({ ...p, [s.key]: e.target.value }))}
                    className="h-8 w-32 rounded-md border border-neutral-200 px-2 text-xs"
                  />
                </td>
                <td className="px-4 py-3">
                  <button onClick={() => save(s)} className="text-xs font-semibold text-brand-600">
                    Save
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
