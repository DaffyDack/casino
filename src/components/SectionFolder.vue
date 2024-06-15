<script lang="ts" setup>
import type { PropType } from 'vue'
import IconImage from './IconImage.vue'
import { computed } from 'vue'

const props = defineProps({
  side: {
    type: String as PropType<'left' | 'right'>,
    default: 'right',
  },
})

const folded = defineModel<boolean>()

const angleDirection = computed(() => {
  return props.side === 'right'
    ? folded.value
      ? 'right'
      : 'left'
    : folded.value
      ? 'left'
      : 'right'
})
</script>

<template>
  <div
    class="select-none cursor-pointer hover:opacity-80 w-5 h-16 bg-primary-500 flex items-center justify-center text-white"
    :class="{
      'rounded-r-md': side === 'right',
      'rounded-l-md': side === 'left',
    }"
    @click="folded = !folded"
  >
    <IconImage
      :name="`angle-${angleDirection}`"
      hex-color="#ffffff"
      class="w-2"
    />
  </div>
</template>
