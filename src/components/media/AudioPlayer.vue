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
})
</script>

<template>
  <VueVideoPlayer :src="src" :width="width" audioOnlyMode controls />
</template>
