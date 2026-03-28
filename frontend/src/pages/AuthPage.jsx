import { useState } from 'react'
import { login, signup } from '../utils/api'

export default function AuthPage({ onAuth }) {
  const [mode, setMode] = useState('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  async function handleSubmit() {
    if (!email || !password) return
    if (mode === 'signup' && !name) return
    setLoading(true)
    setError(null)

    try {
      const res = mode === 'login'
        ? await login(email, password)
        : await signup(name, email, password)

      if (res.token) {
        localStorage.setItem('token', res.token)
        localStorage.setItem('userName', res.name)
        onAuth(res.name)
      } else {
        setError(res.detail || 'Something went wrong')
      }
    } catch {
      setError('Could not connect to backend. Is it running?')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <h1 className="font-serif text-5xl text-gold-300 mb-2">BizLytics</h1>
      <p className="text-ink-400 mb-10 text-center">Business analytics powered by AI</p>

      <div className="w-full max-w-md bg-ink-800 border border-ink-600 rounded-3xl p-8">

        {/* Tabs */}
        <div className="flex mb-8 bg-ink-700 rounded-xl p-1">
          <button
            onClick={() => { setMode('login'); setError(null) }}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors
              ${mode === 'login' ? 'bg-gold-400 text-ink-900' : 'text-ink-400 hover:text-ink-200'}`}
          >
            Login
          </button>
          <button
            onClick={() => { setMode('signup'); setError(null) }}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors
              ${mode === 'signup' ? 'bg-gold-400 text-ink-900' : 'text-ink-400 hover:text-ink-200'}`}
          >
            Sign Up
          </button>
        </div>

        {/* Fields */}
        <div className="flex flex-col gap-4">
          {mode === 'signup' && (
            <div>
              <label className="text-ink-400 text-sm mb-1 block">Full Name</label>
              <input
                className="w-full bg-ink-700 border border-ink-600 rounded-xl px-4 py-3 text-ink-200 outline-none focus:border-gold-400 transition-colors"
                placeholder="Your name"
                value={name}
                onChange={e => setName(e.target.value)}
              />
            </div>
          )}

          <div>
            <label className="text-ink-400 text-sm mb-1 block">Email</label>
            <input
              type="email"
              className="w-full bg-ink-700 border border-ink-600 rounded-xl px-4 py-3 text-ink-200 outline-none focus:border-gold-400 transition-colors"
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            />
          </div>

          <div>
            <label className="text-ink-400 text-sm mb-1 block">Password</label>
            <input
              type="password"
              className="w-full bg-ink-700 border border-ink-600 rounded-xl px-4 py-3 text-ink-200 outline-none focus:border-gold-400 transition-colors"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            />
          </div>

          {error && <p className="text-rose-400 text-sm">{error}</p>}

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-gold-400 hover:bg-gold-300 disabled:opacity-50 text-ink-900 font-semibold py-3 rounded-xl transition-colors mt-2"
          >
            {loading ? 'Please wait...' : mode === 'login' ? 'Login →' : 'Create Account →'}
          </button>
        </div>

      </div>

      <p className="mt-6 text-ink-600 text-xs">Your data is private and secure</p>
    </div>
  )
}