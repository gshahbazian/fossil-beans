// https://youmightnotneed.com/lodash/#trimStart
export const trimStart = (str: string, c = '\\s') =>
  str.replace(new RegExp(`^([${c}]*)(.*)$`), '$2')
