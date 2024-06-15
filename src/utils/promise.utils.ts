export function yieldToMain() {
  return new Promise((resolve) => {
    setTimeout(resolve, 0)
  })
}

export function debounce(fn: Function, delay: number) {
  let timer = 0
  return function () {
    if (timer) {
      clearTimeout(timer)
    }
    timer = setTimeout(() => {
      timer = 0
      fn()
    }, delay)
    return timer
  }
}
