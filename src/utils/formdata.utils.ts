export function makeFormData(data: { [key: string]: any }) {
  const formData = new FormData()
  Object.entries(data).forEach(([key, value]) => {
    if (value instanceof File) {
      formData.append(key, value)
    } else {
      formData.append(
        key,
        typeof value === 'string' ? value : JSON.stringify(value),
      )
    }
  })
  return formData
}
