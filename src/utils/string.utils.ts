export function generateShortUuidv4() {
  return 'xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0,
      v = c == 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

export function formatByteSize(
  size: number,
  { format = 'auto', precision = 1 } = {},
) {
  if (size < 1024) return size.toFixed(precision) + ' B'
  size /= 1024
  if (size < 1024) return size.toFixed(precision) + ' KB'
  size /= 1024
  if (size < 1024) return size.toFixed(precision) + ' MB'
  size /= 1024
  return size.toFixed(precision) + ' GB'
}
