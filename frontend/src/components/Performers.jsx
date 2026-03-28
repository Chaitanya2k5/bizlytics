import { formatCurrency } from '../utils/format'

export default function Performers({ data }) {
  if (!data) return null

  const top = data.top_performers || []
  const bottom = data.bottom_performers || []

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">

      <div className="bg-ink-800 border border-ink-600 rounded-2xl p-5">
        <h3 className="text-ink-200 font-semibold mb-4">🏆 Top Performers</h3>
        {top.map((item, i) => (
          <div key={i} className="flex justify-between items-center py-2 border-b border-ink-700 last:border-0">
            <span className="text-ink-200 text-sm">{item.product}</span>
            <span className="text-emerald-400 text-sm font-medium">{formatCurrency(item.profit)}</span>
          </div>
        ))}
      </div>

      <div className="bg-ink-800 border border-ink-600 rounded-2xl p-5">
        <h3 className="text-ink-200 font-semibold mb-4">⚠️ Needs Attention</h3>
        {bottom.map((item, i) => (
          <div key={i} className="flex justify-between items-center py-2 border-b border-ink-700 last:border-0">
            <span className="text-ink-200 text-sm">{item.product}</span>
            <span className="text-rose-400 text-sm font-medium">{formatCurrency(item.profit)}</span>
          </div>
        ))}
      </div>

    </div>
  )
}