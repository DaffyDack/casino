<script setup lang="ts">
import Spinner from '@/assets/img/loader.svg'
const { size } = defineProps({
  size: {
    type: String,
    default: '50',
  },
})
</script>

<template>
  <Spinner class="spinner" :width="size" />
</template>

<style scoped lang="scss">
.spinner {
  position: relative;
  animation: jump 1s ease-in-out infinite;
}

@keyframes jump {
  0% {
    left: -20px;
    transform: rotate(0deg);
  }
  50% {
    left: 20px;
    transform: rotate(80deg);
  }
  100% {
    left: -20px;
    transform: rotate(0deg);
  }
}
</style>
