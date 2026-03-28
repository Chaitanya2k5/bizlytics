const BASE = import.meta.env.VITE_API_URL || '/api'

function getToken() {
  return localStorage.getItem('token')
}

function authHeaders() {
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${getToken()}`
  }
}

// ── Auth ─────────────────────────────────────────────────────────
export async function signup(name, email, password) {
  const res = await fetch(`${BASE}/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password })
  })
  return res.json()
}

export async function login(email, password) {
  const res = await fetch(`${BASE}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  })
  return res.json()
}

// ── Profiles ─────────────────────────────────────────────────────
export async function getProfiles() {
  const res = await fetch(`${BASE}/profiles`, { headers: authHeaders() })
  return res.json()
}

export async function createProfile(name, color) {
  const res = await fetch(`${BASE}/profiles`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ name, color })
  })
  return res.json()
}

export async function deleteProfile(profileId) {
  const res = await fetch(`${BASE}/profiles/${profileId}`, {
    method: 'DELETE',
    headers: authHeaders()
  })
  return res.json()
}

// ── Data (all scoped to profile) ──────────────────────────────────
export async function uploadCSV(file, profileId) {
  const form = new FormData()
  form.append('file', file)
  const res = await fetch(`${BASE}/upload-csv?profile_id=${profileId}`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${getToken()}` },
    body: form
  })
  return res.json()
}

export async function getReports(profileId) {
  const res = await fetch(`${BASE}/reports?profile_id=${profileId}`, {
    headers: authHeaders()
  })
  return res.json()
}

export async function getFiles(profileId) {
  const res = await fetch(`${BASE}/files?profile_id=${profileId}`, {
    headers: authHeaders()
  })
  return res.json()
}

export async function removeFile(filename, profileId) {
  const res = await fetch(`${BASE}/remove-csv/${encodeURIComponent(filename)}?profile_id=${profileId}`, {
    method: 'DELETE',
    headers: authHeaders()
  })
  return res.json()
}

export async function sendChat(message, profileId) {
  const res = await fetch(`${BASE}/chat`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ message, profile_id: profileId })
  })
  return res.json()
}

export async function addStock(instruction, profileId) {
  const res = await fetch(`${BASE}/add-stock`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ instruction, profile_id: profileId })
  })
  return res.json()
}