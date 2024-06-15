<script lang="ts" setup>
import { computed } from 'vue'
import Button from '../form/Button.vue'

const props = defineProps({
  src: {
    type: String,
  },
})

const filename = computed(() => {
  const match = props.src?.match(/([^\/]+)$/)
  return match ? match[1] : props.src
})
</script>

<template>
  <a :href="src" target="_blank" class="no-underline break-words">
    {{ $t('download') }} {{ filename }}
  </a>
</template>
