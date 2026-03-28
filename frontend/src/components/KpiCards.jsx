import { formatCurrency, formatPercent } from '../utils/format'

export default function KpiCards({ data }) {
  if (!data || !data.kpis) return null
  const { kpis } = data

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <div className="bg-ink-800 border border-ink-600 rounded-2xl p-5">
        <p className="text-ink-400 text-sm mb-1">Total Revenue</p>
        <p className="text-gold-300 font-serif text-2xl">{formatCurrency(kpis.total_revenue)}</p>
      </div>
      <div className="bg-ink-800 border border-ink-600 rounded-2xl p-5">
        <p className="text-ink-400 text-sm mb-1">Total Cost</p>
        <p className="text-gold-300 font-serif text-2xl">{formatCurrency(kpis.total_cost)}</p>
      </div>
      <div className="bg-ink-800 border border-ink-600 rounded-2xl p-5">
        <p className="text-ink-400 text-sm mb-1">Net Profit</p>
        <p className="text-gold-300 font-serif text-2xl">{formatCurrency(kpis.total_profit)}</p>
      </div>
      <div className="bg-ink-800 border border-ink-600 rounded-2xl p-5">
        <p className="text-ink-400 text-sm mb-1">Profit Margin</p>
        <p className="text-gold-300 font-serif text-2xl">{formatPercent(kpis.margin)}</p>
      </div>
    </div>
  )
}