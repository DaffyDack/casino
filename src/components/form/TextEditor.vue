<script setup lang="ts">
import { ref } from 'vue'

const text = ref<any>(null)
const selRange = ref<any>(null)
const modeClass = ref('')

const modes = [
  { name: 'boldi', label: 'Жирно' },
  { name: 'cursiv', label: 'Курсив' },
  { name: 'underli', label: 'Подчеркн' },
]

const isActive = (modeName: string) => {
  return modeClass.value.includes(modeName)
}

const toggleMode = (modeName: string) => {
  if (isActive(modeName)) {
    modeClass.value = modeClass.value.replace(modeName, '').trim()
  } else {
    modeClass.value += ` ${modeName}`
  }

  if (selRange.value) {
    if (selRange.value.commonAncestorContainer === text.value) {
      const spans = [...text.value.getElementsByTagName('span')]
      const start = spans.indexOf(selRange.value.startContainer.parentElement)
      const end = spans.indexOf(selRange.value.endContainer.parentElement)
      for (let i = start; i <= end; i++) {
        if (isActive(modeName)) {
          spans[i].classList.add(modeName)
        } else {
          spans[i].classList.remove(modeName)
        }
      }
    }
  }
}

const handleKeypress = (e: any) => {
  if (/[a-zA-Z0-9,.А-ЯЁа-яё]/u.test(e.key.toString()) && e.key !== 'Enter') {
    e.preventDefault()

    const span = document.createElement('span')
    span.textContent = e.key
    span.className = modeClass.value
    text.value.append(span)

    const sel: any = window.getSelection()
    sel.collapse(span, 1)
  }
}

const handleMouseup = () => {
  const sel: any = window.getSelection()
  if (sel.type === 'Range') {
    selRange.value = sel.getRangeAt(0)
    modes.forEach((mode) => {
      document
        .querySelector<HTMLElement>(`[data-font="${mode.name}"]`)
        ?.classList.remove('active')
    })
    modeClass.value = ''
  } else {
    selRange.value = null
  }
}
</script>
<template>
  <div class="specialTextEditor">
    <div
      id="text"
      ref="text"
      contenteditable="true"
      spellcheck="false"
      @keypress="handleKeypress"
      @mouseup="handleMouseup"
    ></div>
    <button
      v-for="mode in modes"
      :key="mode.name"
      :data-font="mode.name"
      class="mode"
      @click="toggleMode(mode.name)"
      :class="{ active: isActive(mode.name) }"
    >
      {{ mode.label }}
    </button>
  </div>
</template>

<style lang="scss">
.specialTextEditor {
  #text {
    min-height: 40px;
    outline: 1px solid lightblue;
    margin: 5px;
  }

  .active {
    background-color: lightblue;
  }

  .boldi {
    font-weight: bold;
  }

  .cursiv {
    font-style: italic;
  }

  .underli {
    text-decoration: underline;
  }
}
</style>
