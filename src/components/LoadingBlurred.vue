<script lang="ts" setup>
import Spinner from '@/components/Spinner.vue'

const props = defineProps({
  color: {
    type: String,
    default: 'white',
  },
  themeAdaptive: {
    type: Boolean,
    default: false,
  },
  text: {
    type: String,
  },
})
</script>

<template>
  <div
    class="absolute w-full h-full flex gap-2 items-center justify-center backdrop-blur-sm"
  >
    <Spinner />
    <span
      class="ml-5"
      :class="{
        'text-black dark:text-white ': themeAdaptive,
        'text-white': !themeAdaptive,
      }"
      >{{ text }}</span
    >
  </div>
</template>
