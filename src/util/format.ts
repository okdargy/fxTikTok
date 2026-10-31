export function formatNumber(value: string | number): string {
  if (value === '0') return '0'

  const num = typeof value === 'string' ? parseInt(value, 10) : value

  if (num < 1000) return num.toString()
  const strip = (s: string) => s.replace(/\.0$/, '')

  if (num < 10000) return strip((num / 1000).toFixed(1)) + 'K'
  if (num < 1000000) return strip((num / 1000).toFixed(1)) + 'K'
  if (num < 10000000) return strip((num / 1000000).toFixed(1)) + 'M'
  if (num < 1000000000) return strip((num / 1000000).toFixed(1)) + 'M'
  if (num < 10000000000) return strip((num / 1000000000).toFixed(1)) + 'B'
  return strip((num / 1000000000).toFixed(0)) + 'B'
}

export function formatTime(time: number): string {
  const timeElapsed = Date.now() - time * 1000
  const minutes = Math.floor(timeElapsed / 60000)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (days > 0) {
    return `${days}d ${hours % 24}h`
  } else if (hours > 0) {
    return `${hours}h ${minutes % 60}m`
  } else {
    return `${minutes}m`
  }
}
