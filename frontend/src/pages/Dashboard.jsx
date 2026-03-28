import { useState, useEffect } from 'react'
import { getReports } from '../utils/api'
import KpiCards from '../components/KpiCards'
import Charts from '../components/Charts'
import Inventory from '../components/Inventory'
import Performers from '../components/Performers'
import AiChat from '../components/AiChat'
import StockInput from '../components/StockInput'

const TABS = ['Overview', 'Inventory', 'AI Advisor']

export default function Dashboard({ onReset, onLogout, onBack, userName, profile }) {
  const [data, setData] = useState(null)
  const [tab, setTab] = useState('Overview')
  const [loading, setLoading] = useState(true)

  async function fetchData() {
    try {
      const res = await getReports(profile.id)
      setData(res)
    } catch {
      console.error('Failed to fetch reports')
    }
    setLoading(false)
  }

  useEffect(() => { fetchData() }, [])

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gold-300 text-xl animate-pulse">Loading your dashboard...</p>
    </div>
  )

  return (
    <div className="min-h-screen px-4 py-8 max-w-6xl mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        {/* Left — logo + profile name */}
        <div className="flex items-center gap-4">
          <h1 className="font-serif text-3xl text-gold-300">BizLytics</h1>
          <span className="text-ink-700">|</span>
          <div className="flex items-center gap-2">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center text-ink-900 text-sm font-bold"
              style={{ backgroundColor: profile.color }}
            >
              {profile.name.charAt(0).toUpperCase()}
            </div>
            <span className="text-ink-200 font-medium">{profile.name}</span>
          </div>
        </div>

        {/* Right — actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={onReset}
            className="text-ink-400 hover:text-ink-200 text-sm border border-ink-600 px-4 py-2 rounded-xl transition-colors"
          >
            ↑ Upload CSV
          </button>
          <button
            onClick={onBack}
            className="text-ink-400 hover:text-ink-200 text-sm border border-ink-600 px-4 py-2 rounded-xl transition-colors"
          >
            ← Businesses
          </button>
          <div className="flex items-center gap-3 ml-2 pl-3 border-l border-ink-700">
            <span className="text-ink-500 text-sm">{userName}</span>
            <button
              onClick={onLogout}
              className="text-ink-500 hover:text-rose-400 text-sm transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-8">
        {TABS.map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-5 py-2 rounded-xl text-sm font-medium transition-colors
              ${tab === t
                ? 'bg-gold-400 text-ink-900'
                : 'bg-ink-800 text-ink-400 hover:text-ink-200 border border-ink-600'}`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* KPI Cards — always visible */}
      <KpiCards data={data} />

      {/* Tab Content */}
      {tab === 'Overview' && (
        <>
          <Charts data={data} />
          <Performers data={data} />
        </>
      )}

      {tab === 'Inventory' && (
        <>
          <StockInput onUpdate={fetchData} profileId={profile.id} />
          <Inventory data={data} onRefresh={fetchData} />
        </>
      )}

      {tab === 'AI Advisor' && (
        <AiChat profileId={profile.id} />
      )}

    </div>
  )
}
