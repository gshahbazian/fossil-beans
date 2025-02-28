/**
 * Interval is in format HH:MM:SS.MS or HH:MM:SS
 *
 * This function returns just M:SS.
 */
export function trimIntervalToMinsSecs(interval: string) {
  const [, minutes, seconds] = interval.split(':')

  const cleanMins = minutes?.replace(/^0/, '') ?? '0'
  const cleanSecs = seconds?.split('.')[0] ?? '00'

  return `${cleanMins}:${cleanSecs}`
}
