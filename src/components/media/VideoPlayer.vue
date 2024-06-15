<script lang="ts" setup>
const props = defineProps({
  src: {
    type: String,
    required: true,
  },
  extension: {
    type: String,
    default: 'mp4',
  },
  width: {
    type: Number,
  },
  height: {
    type: Number,
  },
})
</script>

<template>
  <VueVideoPlayer :src="src" :width="width" :height="height" controls />
</template>
