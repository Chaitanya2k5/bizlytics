import { useState, useEffect } from 'react'
import { uploadCSV, getFiles, removeFile } from '../utils/api'

export default function UploadPage({ onUpload, onLogout, onBack, userName, profile }) {
  const [dragging, setDragging] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [files, setFiles] = useState([])
  const [success, setSuccess] = useState(null)

  useEffect(() => { fetchFiles() }, [])

  async function fetchFiles() {
    try {
      const res = await getFiles(profile.id)
      setFiles(res.files || [])
    } catch {}
  }

  async function handleFiles(fileList) {
    const csvFiles = Array.from(fileList).filter(f => f.name.endsWith('.csv'))
    if (csvFiles.length === 0) {
      setError('Please upload .csv files only')
      return
    }
    setLoading(true)
    setError(null)
    setSuccess(null)

    let uploaded = 0
    for (const file of csvFiles) {
      try {
        const res = await uploadCSV(file, profile.id)
        if (res.status === 'ok' || res.rows) uploaded++
        else setError(res.detail || 'Upload failed for ' + file.name)
      } catch {
        setError('Could not connect to backend. Is it running?')
      }
    }

    setLoading(false)
    if (uploaded > 0) {
      setSuccess(`${uploaded} file(s) uploaded successfully!`)
      fetchFiles()
    }
  }

  async function handleRemove(filename) {
    await removeFile(filename, profile.id)
    fetchFiles()
    if (files.length <= 1) setSuccess(null)
  }

  return (
    <div className="min-h-screen px-4 py-8 max-w-2xl mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between mb-10">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="text-ink-500 hover:text-ink-200 text-sm transition-colors"
          >
            ← Businesses
          </button>
          <span className="text-ink-700">|</span>
          <div className="flex items-center gap-2">
            <div
              className="w-6 h-6 rounded-md flex items-center justify-center text-ink-900 text-xs font-bold"
              style={{ backgroundColor: profile.color }}
            >
              {profile.name.charAt(0).toUpperCase()}
            </div>
            <span className="text-ink-200 text-sm font-medium">{profile.name}</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-ink-500 text-sm">{userName}</span>
          <button
            onClick={onLogout}
            className="text-ink-500 hover:text-rose-400 text-sm transition-colors"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Title */}
      <div className="text-center mb-10">
        <h1 className="font-serif text-4xl text-gold-300 mb-2">Upload Sales Data</h1>
        <p className="text-ink-400 text-sm">Upload one or more CSV files for <span className="text-ink-200">{profile.name}</span></p>
      </div>

      {/* Drop Zone */}
      <div
        onDragOver={e => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={e => { e.preventDefault(); setDragging(false); handleFiles(e.dataTransfer.files) }}
        className={`w-full border-2 border-dashed rounded-3xl p-16 text-center transition-colors cursor-pointer
          ${dragging ? 'border-gold-400 bg-ink-700' : 'border-ink-600 bg-ink-800 hover:border-gold-400'}`}
        onClick={() => document.getElementById('csvInput').click()}
      >
        <div className="text-5xl mb-4">📂</div>
        <p className="text-ink-200 font-medium mb-1">Drag & drop your CSV files here</p>
        <p className="text-ink-400 text-sm">or click to browse — multiple files supported</p>
        <input
          id="csvInput"
          type="file"
          accept=".csv"
          multiple
          className="hidden"
          onChange={e => handleFiles(e.target.files)}
        />
      </div>

      {loading && <p className="mt-6 text-gold-300 animate-pulse text-center">Uploading...</p>}
      {error && <p className="mt-4 text-rose-400 text-sm text-center">{error}</p>}
      {success && <p className="mt-4 text-emerald-400 text-sm text-center">{success}</p>}

      {/* Uploaded Files List */}
      {files.length > 0 && (
        <div className="w-full mt-8 bg-ink-800 border border-ink-600 rounded-2xl p-5">
          <h3 className="text-ink-200 font-semibold mb-3">📁 Loaded Files ({files.length})</h3>
          {files.map((f, i) => (
            <div key={i} className="flex justify-between items-center py-2 border-b border-ink-700 last:border-0">
              <span className="text-ink-200 text-sm">{f}</span>
              <button
                onClick={() => handleRemove(f)}
                className="text-rose-400 hover:text-rose-300 text-xs border border-rose-400 hover:border-rose-300 px-2 py-1 rounded-lg transition-colors"
              >
                Remove
              </button>
            </div>
          ))}
          <button
            onClick={onUpload}
            className="mt-4 w-full bg-gold-400 hover:bg-gold-300 text-ink-900 font-semibold py-3 rounded-xl transition-colors"
          >
            View Dashboard →
          </button>
        </div>
      )}

      <p className="mt-8 text-ink-600 text-xs text-center">
        Expected columns: date, product, category, quantity_sold, unit_price, unit_cost, stock_remaining
      </p>
    </div>
  )
}