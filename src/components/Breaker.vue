<script lang="ts" setup>
import type { PropType } from 'vue'

const props = defineProps({
  orientation: {
    type: String as PropType<'horizontal' | 'vertical'>,
    default: 'horizontal',
  },
  height: {
    type: String,
  },
  width: {
    type: String,
  },
  color: {
    type: String,
    default: '#2d3044',
  },
  thickness: {
    type: Number,
    default: 1,
  },
  text: {},
  textColor: {
    type: String,
    default: '#5b5b5b',
  },
  textFontSize: {
    default: 14,
  },
})
</script>

<template>
  <div
    class="flex items-center"
    :class="orientation === 'horizontal' ? 'my-4' : 'mx-4'"
    :style="{
      height,
      width,
    }"
  >
    <span
      v-if="text"
      class="mr-2 font-bold whitespace-nowrap"
      :style="{
        color: textColor ?? color,
        'font-size': `${textFontSize}px`,
      }"
      >{{ text }}</span
    >
    <div
      class="w-full h-full"
      :style="{
        border: `0px solid ${color}`,
        color,
        'border-width':
          orientation === 'horizontal' ? `${thickness}px 0 0 0` : `0 ${thickness}px 0 0`,
      }"
    ></div>
  </div>
</template>
