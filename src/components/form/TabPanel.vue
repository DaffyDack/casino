<script lang="ts" setup>
const props = defineProps({
  header: {
    type: String,
    required: true,
  },
})
</script>

<template>
  <slot></slot>
</template>
