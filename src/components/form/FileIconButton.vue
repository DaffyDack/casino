<script lang="ts" setup>
import { ref, watch } from 'vue'
import IconButton from './IconButton.vue'

const props = defineProps({
  accept: {
    type: String,
    default: '.jpg,.jpeg,.png,.ogg,.mp4',
  },
})
const emit = defineEmits<{
  submit: [files: File[]]
}>()

const inputEl = ref<HTMLInputElement>()
const onInputFileChange = (e: Event) => {
  const target = e.target as HTMLInputElement
  if (!target.files) return
  emit('submit', Array.from(target.files))
  target.value = ''
}
</script>

<template>
  <IconButton
    v-bind="$attrs"
    icon="paper-clip"
    class="mb-1.5 w-6 text-gray-12"
    @click="inputEl?.click()"
  />
  <input
    ref="inputEl"
    class="hidden"
    type="file"
    :accept="accept"
    @change="onInputFileChange"
    multiple
  />
</template>
