import { useState, useEffect } from 'react'
import AuthPage from './pages/AuthPage'
import ProfilesPage from './pages/ProfilesPage'
import UploadPage from './pages/UploadPage'
import Dashboard from './pages/Dashboard'

export default function App() {
  const [user, setUser] = useState(null)
  const [activeProfile, setActiveProfile] = useState(null)
  const [uploaded, setUploaded] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    const name = localStorage.getItem('userName')
    // Only restore user if token exists, never skip to dashboard
    if (token && name) {
      setUser(name)
    }
    setLoading(false)
  }, [])

  function handleAuth(name) {
    setUser(name)
    setActiveProfile(null)
    setUploaded(false)
  }

  function handleLogout() {
    localStorage.removeItem('token')
    localStorage.removeItem('userName')
    setUser(null)
    setActiveProfile(null)
    setUploaded(false)
  }

  function handleSelectProfile(profile) {
    setActiveProfile(profile)
    setUploaded(false)
  }

  function handleBackToProfiles() {
    setActiveProfile(null)
    setUploaded(false)
  }

  // Still checking localStorage
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-ink-400 text-sm">Loading...</p>
    </div>
  )

  // Not logged in → show auth
  if (!user) return <AuthPage onAuth={handleAuth} />

  // Logged in but no profile selected → show profiles page
  if (!activeProfile) return (
    <ProfilesPage
      userName={user}
      onSelectProfile={handleSelectProfile}
      onLogout={handleLogout}
    />
  )

  // Profile selected, no data uploaded → show upload
  if (!uploaded) return (
    <UploadPage
      onUpload={() => setUploaded(true)}
      onLogout={handleLogout}
      onBack={handleBackToProfiles}
      userName={user}
      profile={activeProfile}
    />
  )

  // All good → show dashboard
  return (
    <Dashboard
      onReset={() => setUploaded(false)}
      onLogout={handleLogout}
      onBack={handleBackToProfiles}
      userName={user}
      profile={activeProfile}
    />
  )
}