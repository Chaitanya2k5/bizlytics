import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, Legend
} from 'recharts'

const GOLD = '#f0b429'
const EMERALD = '#34d399'
const ROSE = '#fb7185'
const INK = '#3d3a37'
const COLORS = [GOLD, EMERALD, ROSE, '#818cf8', '#38bdf8']

export default function Charts({ data }) {
  if (!data) return null

  const daily = data.monthly || []
  const categories = data.categories || []
  const products = data.products || []

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">

      {/* Monthly Revenue */}
      <div className="bg-ink-800 border border-ink-600 rounded-2xl p-5">
        <h3 className="text-ink-200 font-semibold mb-4">Monthly Revenue</h3>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={daily}>
            <XAxis dataKey="month" stroke={INK} tick={{ fill: '#7a7570', fontSize: 11 }} />
            <YAxis stroke={INK} tick={{ fill: '#7a7570', fontSize: 11 }} />
            <Tooltip contentStyle={{ background: '#1a1918', border: '1px solid #3d3a37', borderRadius: 8 }} />
            <Line type="monotone" dataKey="revenue" stroke={GOLD} strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Category Revenue */}
      <div className="bg-ink-800 border border-ink-600 rounded-2xl p-5">
        <h3 className="text-ink-200 font-semibold mb-4">Revenue by Category</h3>
        <ResponsiveContainer width="100%" height={280}>
          <PieChart>
            <Pie data={categories} dataKey="revenue" nameKey="category" cx="50%" cy="50%" outerRadius={90} label={false}>
              {categories.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip contentStyle={{ background: '#1a1918', border: '1px solid #3d3a37', borderRadius: 8 }} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Top Products by Revenue */}
      <div className="bg-ink-800 border border-ink-600 rounded-2xl p-5">
        <h3 className="text-ink-200 font-semibold mb-4">Top Products by Revenue</h3>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={products.slice(0, 5)} layout="vertical">
            <XAxis type="number" stroke={INK} tick={{ fill: '#7a7570', fontSize: 11 }} />
            <YAxis type="category" dataKey="product" stroke={INK} tick={{ fill: '#7a7570', fontSize: 11 }} width={100} />
            <Tooltip contentStyle={{ background: '#1a1918', border: '1px solid #3d3a37', borderRadius: 8 }} />
            <Bar dataKey="revenue" fill={GOLD} radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Profit by Product */}
      <div className="bg-ink-800 border border-ink-600 rounded-2xl p-5">
        <h3 className="text-ink-200 font-semibold mb-4">Profit by Product</h3>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={products.slice(0, 5)} layout="vertical">
            <XAxis type="number" stroke={INK} tick={{ fill: '#7a7570', fontSize: 11 }} />
            <YAxis type="category" dataKey="product" stroke={INK} tick={{ fill: '#7a7570', fontSize: 11 }} width={100} />
            <Tooltip contentStyle={{ background: '#1a1918', border: '1px solid #3d3a37', borderRadius: 8 }} />
            <Bar dataKey="profit" fill={EMERALD} radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

    </div>
  )
}