import { useState } from 'react'
import { addStock } from '../utils/api'

export default function StockInput({ onUpdate, profileId }) {
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState(null)

  async function handleSubmit() {
    if (!input.trim()) return
    setLoading(true)
    setMessage(null)
    try {
      const res = await addStock(input, profileId)
      setMessage({ success: true, text: res.message || 'Stock updated!' })
      setInput('')
      if (onUpdate) onUpdate()
    } catch {
      setMessage({ success: false, text: 'Something went wrong. Try again.' })
    }
    setLoading(false)
  }

  return (
    <div className="bg-ink-800 border border-ink-600 rounded-2xl p-5 mb-6">
      <h3 className="text-ink-200 font-semibold mb-2">📦 Update Stock</h3>
      <p className="text-ink-400 text-sm mb-4">
        Type naturally — e.g. "Add 50 units of Coffee Beans" or "Remove 20 units of Milk"
      </p>
      <div className="flex gap-2">
        <input
          className="flex-1 bg-ink-700 border border-ink-600 rounded-xl px-4 py-2 text-ink-200 text-sm outline-none focus:border-gold-400"
          placeholder="e.g. Add 100 units of Product X..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSubmit()}
        />
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="bg-gold-400 hover:bg-gold-300 disabled:opacity-50 text-ink-900 font-semibold px-4 py-2 rounded-xl text-sm transition-colors"
        >
          {loading ? 'Updating...' : 'Update'}
        </button>
      </div>
      {message && (
        <p className={`mt-2 text-sm ${message.success ? 'text-emerald-400' : 'text-rose-400'}`}>
          {message.text}
        </p>
      )}
    </div>
  )
}
