export function formatCurrency(value) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value)
}

export function formatNumber(value) {
  return new Intl.NumberFormat('en-IN').format(value)
}

export function formatPercent(value) {
  return `${parseFloat(value).toFixed(1)}%`
}

export function statusColor(stock, reorder) {
  if (stock === 0) return 'text-rose-400'
  if (stock <= reorder) return 'text-yellow-400'
  return 'text-emerald-400'
}

export function statusLabel(stock, reorder) {
  if (stock === 0) return 'Out of Stock'
  if (stock <= reorder) return 'Low Stock'
  return 'In Stock'
}