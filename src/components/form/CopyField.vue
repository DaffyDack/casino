<script lang="ts" setup>
import { useNotify } from '@/hooks/notify'
import IconImage from '../IconImage.vue'
import { useToast } from 'primevue/usetoast'
import { useClipboard } from '@/hooks/clipboard'

const props = defineProps({
  icon: {
    type: String,
  },
  value: {
    type: String,
  },
})

const clipboard = useClipboard()

function copyToClipboard() {
  if (props.value) {
    clipboard.write(props.value)
  }
}
</script>

<template>
  <div
    class="px-2 h-8 flex gap-2 items-center rounded border border-gray-6 dark:border-surface-600 dark:bg-surface-700 rounded-md border-solid"
  >
    <IconImage v-if="icon" :name="icon" class="w-3 text-primary-500" />
    <input
      class="w-full text-sm dark:text-white/80 border-none ring-none outline-none bg-transparent"
      :value="value"
    />
    <IconImage
      name="copy"
      class="ml-auto cursor-pointer hover:opacity-80 w-3 text-gray-2"
      @click="copyToClipboard"
    />
  </div>
</template>
@/hooks/clipboard @/hooks/notify
