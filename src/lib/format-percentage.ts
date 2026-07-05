const decimalFormat = new Intl.NumberFormat('en-US', {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
})

export function formatPercentage(numerator: number, denominator: number) {
  return decimalFormat.format((numerator / denominator) * 100)
}

/**
 * Shooting percentage with a trailing `%`, or `-` when there were no attempts.
 */
export function formatShootingPercentage(made: number, attempted: number) {
  if (attempted <= 0) return '-'

  return `${formatPercentage(made, attempted)}%`
}
