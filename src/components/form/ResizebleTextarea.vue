<script lang="ts" setup>
import { watch } from 'vue'
import { onMounted } from 'vue'
import { ref } from 'vue'

const props = defineProps({
  initialHeight: {
    type: String,
    default: '56px',
  },
  maxHeight: {
    type: String,
    default: '240px',
  },
})

const elTextarea = ref<HTMLTextAreaElement>()
const value = defineModel<string>()
watch(value, () => {
  setTimeout(() => {
    refreshHeight()
  }, 0)
})

function refreshHeight() {
  elTextarea.value!.style.height = 'auto'
  elTextarea.value!.style.height = elTextarea.value!.scrollHeight + 'px'
}

onMounted(() => {
  if (elTextarea.value!.value == '') {
    elTextarea.value!.setAttribute(
      'style',
      `height:${props.initialHeight};overflow-y:hidden;max-height:${props.maxHeight};`,
    )
  } else {
    elTextarea.value!.setAttribute(
      'style',
      `height:${elTextarea.value!.scrollHeight}px;overflow-y:hidden;max-height:${props.maxHeight};`,
    )
  }
  // elTextarea.value!.addEventListener('input', refreshHeight, false)
})
</script>

<template>
  <textarea
    class="resize-none border-none dark:bg-surface-800 dark:text-gray-400"
    ref="elTextarea"
    v-bind="$attrs"
    rows="1"
    v-model="value"
  />
</template>
