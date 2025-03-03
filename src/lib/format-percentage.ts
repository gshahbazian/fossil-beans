const decimalFormat = new Intl.NumberFormat('en-US', {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
})

export function formatPercentage(numerator: number, denominator: number) {
  return decimalFormat.format((numerator / denominator) * 100)
}
