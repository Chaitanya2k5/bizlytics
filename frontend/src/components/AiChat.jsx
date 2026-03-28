import { useState } from 'react'
import { sendChat } from '../utils/api'

export default function AiChat({ profileId }) {
  const [messages, setMessages] = useState([
    { role: 'ai', text: "Hi! I'm your BizLytics AI advisor. Ask me anything about your business data!" }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSend() {
    if (!input.trim()) return
    const userMsg = { role: 'user', text: input }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)
    try {
      const res = await sendChat(input, profileId)
      setMessages(prev => [...prev, { role: 'ai', text: res.reply }])
    } catch {
      setMessages(prev => [...prev, { role: 'ai', text: 'Sorry, something went wrong. Is the backend running?' }])
    }
    setLoading(false)
  }

  return (
    <div className="bg-ink-800 border border-ink-600 rounded-2xl p-5">
      <h3 className="text-ink-200 font-semibold mb-4">🤖 AI Business Advisor</h3>

      {/* Messages */}
      <div className="h-72 overflow-y-auto flex flex-col gap-3 mb-4 pr-1">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-xs px-4 py-2 rounded-2xl text-sm ${
              msg.role === 'user'
                ? 'bg-gold-400 text-ink-900'
                : 'bg-ink-700 text-ink-200'
            }`}>
              {msg.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-ink-700 text-ink-400 px-4 py-2 rounded-2xl text-sm">Thinking...</div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="flex gap-2">
        <input
          className="flex-1 bg-ink-700 border border-ink-600 rounded-xl px-4 py-2 text-ink-200 text-sm outline-none focus:border-gold-400"
          placeholder="Ask about your business..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSend()}
        />
        <button
          onClick={handleSend}
          className="bg-gold-400 hover:bg-gold-300 text-ink-900 font-semibold px-4 py-2 rounded-xl text-sm transition-colors"
        >
          Send
        </button>
      </div>
    </div>
  )
}