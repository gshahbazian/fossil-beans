/**
 * Takes total seconds and returns "M:SS".
 */
export function trimIntervalToMinsSecs(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}
