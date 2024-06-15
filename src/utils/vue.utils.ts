import { watch, ref } from 'vue'

export function booleanStoredRef(key: string, defaultValue: boolean) {
  const storedValue = localStorage.getItem(key)
  const result = ref(storedValue === null ? defaultValue : storedValue === '1')
  watch(result, (value) => {
    localStorage.setItem(key, value ? '1' : '0')
  })
  return result
}

export function addEventListener(
  target: HTMLElement,
  eventType: string,
  callback: EventListener,
) {
  target.addEventListener(eventType, callback)
  return () => {
    target.removeEventListener(eventType, callback)
  }
}
