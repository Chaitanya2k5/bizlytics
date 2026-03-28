import { formatNumber, statusColor, statusLabel } from '../utils/format'

export default function Inventory({ data, onRefresh }) {
  if (!data) return null

  const { inventory } = data

  return (
    <div className="bg-ink-800 border border-ink-600 rounded-2xl p-5 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-ink-200 font-semibold">Inventory Status</h3>
        <button
          onClick={onRefresh}
          className="text-ink-400 hover:text-gold-300 text-xs border border-ink-600 px-3 py-1 rounded-lg transition-colors"
        >
          🔄 Refresh
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-ink-400 border-b border-ink-600">
              <th className="text-left py-2 pr-4">Product</th>
              <th className="text-right py-2 pr-4">Stock</th>
              <th className="text-right py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {inventory?.map((item, i) => (
              <tr key={i} className="border-b border-ink-700 hover:bg-ink-700 transition-colors">
                <td className="py-2 pr-4 text-ink-200">{item.product}</td>
                <td className="py-2 pr-4 text-right text-ink-200">{formatNumber(item.stock)}</td>
                <td className={`py-2 text-right font-medium ${statusColor(item.stock, 50)}`}>
                  {statusLabel(item.stock, 50)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}