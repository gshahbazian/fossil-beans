const pstShortDate = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  timeZone: 'America/Los_Angeles',
})

/** Short PST date, e.g. "Jan 15". */
export function formatPstShortDate(date: Date) {
  return pstShortDate.format(date)
}
