import { useState, useEffect } from 'react'
import { getProfiles, createProfile, deleteProfile } from '../utils/api'

const COLORS = [
  '#f0b429', '#10b981', '#3b82f6', '#8b5cf6',
  '#ef4444', '#f97316', '#06b6d4', '#ec4899'
]

export default function ProfilesPage({ userName, onSelectProfile, onLogout }) {
  const [profiles, setProfiles] = useState([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [newName, setNewName] = useState('')
  const [newColor, setNewColor] = useState(COLORS[0])
  const [error, setError] = useState(null)
  const [deleting, setDeleting] = useState(null)

  useEffect(() => {
    fetchProfiles()
  }, [])

  async function fetchProfiles() {
    setLoading(true)
    try {
      const res = await getProfiles()
      setProfiles(res.profiles || [])
    } catch {
      setError('Could not load profiles')
    }
    setLoading(false)
  }

  async function handleCreate() {
    if (!newName.trim()) return
    setCreating(true)
    setError(null)
    try {
      const profile = await createProfile(newName.trim(), newColor)
      setProfiles(prev => [...prev, profile])
      setNewName('')
      setNewColor(COLORS[0])
      setShowForm(false)
    } catch {
      setError('Could not create profile')
    }
    setCreating(false)
  }

  async function handleDelete(e, profileId) {
    e.stopPropagation()
    if (!confirm('Delete this business and all its data?')) return
    setDeleting(profileId)
    try {
      await deleteProfile(profileId)
      setProfiles(prev => prev.filter(p => p.id !== profileId))
    } catch {
      setError('Could not delete profile')
    }
    setDeleting(null)
  }

  return (
    <div className="min-h-screen px-4 py-10 max-w-2xl mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="font-serif text-4xl text-gold-300">BizLytics</h1>
          <p className="text-ink-400 text-sm mt-1">Welcome back, <span className="text-ink-200">{userName}</span></p>
        </div>
        <button
          onClick={onLogout}
          className="text-ink-500 hover:text-rose-400 text-sm transition-colors"
        >
          Logout
        </button>
      </div>

      {/* Title */}
      <div className="mb-6">
        <h2 className="text-ink-100 text-xl font-semibold">Your Businesses</h2>
        <p className="text-ink-500 text-sm mt-1">Select a business to view its dashboard</p>
      </div>

      {/* Error */}
      {error && (
        <p className="text-rose-400 text-sm mb-4">{error}</p>
      )}

      {/* Profile Cards */}
      {loading ? (
        <p className="text-ink-500 text-sm">Loading...</p>
      ) : (
        <div className="flex flex-col gap-3 mb-6">
          {profiles.length === 0 && !showForm && (
            <div className="bg-ink-800 border border-ink-600 rounded-2xl p-8 text-center">
              <p className="text-ink-400 text-sm">No businesses yet.</p>
              <p className="text-ink-500 text-xs mt-1">Create your first business profile below.</p>
            </div>
          )}

          {profiles.map(profile => (
            <div
              key={profile.id}
              onClick={() => onSelectProfile(profile)}
              className="bg-ink-800 border border-ink-600 hover:border-gold-400 rounded-2xl p-5 flex items-center justify-between cursor-pointer transition-all group"
            >
              <div className="flex items-center gap-4">
                {/* Color dot */}
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-ink-900 font-bold text-lg"
                  style={{ backgroundColor: profile.color }}
                >
                  {profile.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-ink-100 font-medium">{profile.name}</p>
                  <p className="text-ink-500 text-xs">Click to open dashboard</p>
                </div>
              </div>

              {/* Delete button */}
              <button
                onClick={(e) => handleDelete(e, profile.id)}
                disabled={deleting === profile.id}
                className="text-ink-600 hover:text-rose-400 text-xs transition-colors opacity-0 group-hover:opacity-100"
              >
                {deleting === profile.id ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Create Form */}
      {showForm ? (
        <div className="bg-ink-800 border border-ink-600 rounded-2xl p-6">
          <h3 className="text-ink-200 font-medium mb-4">New Business Profile</h3>

          <div className="mb-4">
            <label className="text-ink-400 text-sm mb-1 block">Business Name</label>
            <input
              className="w-full bg-ink-700 border border-ink-600 rounded-xl px-4 py-3 text-ink-200 outline-none focus:border-gold-400 transition-colors"
              placeholder="e.g. My Clothing Store"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleCreate()}
              autoFocus
            />
          </div>

          <div className="mb-6">
            <label className="text-ink-400 text-sm mb-2 block">Pick a Color</label>
            <div className="flex gap-2 flex-wrap">
              {COLORS.map(color => (
                <button
                  key={color}
                  onClick={() => setNewColor(color)}
                  className="w-8 h-8 rounded-lg transition-transform hover:scale-110"
                  style={{
                    backgroundColor: color,
                    outline: newColor === color ? `3px solid white` : 'none',
                    outlineOffset: '2px'
                  }}
                />
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleCreate}
              disabled={creating || !newName.trim()}
              className="flex-1 bg-gold-400 hover:bg-gold-300 disabled:opacity-50 text-ink-900 font-semibold py-3 rounded-xl transition-colors"
            >
              {creating ? 'Creating...' : 'Create Business'}
            </button>
            <button
              onClick={() => { setShowForm(false); setNewName(''); setError(null) }}
              className="px-5 py-3 rounded-xl border border-ink-600 text-ink-400 hover:text-ink-200 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowForm(true)}
          className="w-full border-2 border-dashed border-ink-600 hover:border-gold-400 rounded-2xl py-5 text-ink-500 hover:text-gold-400 transition-colors text-sm font-medium"
        >
          + Add New Business
        </button>
      )}

    </div>
  )
}