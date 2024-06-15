<script lang="ts" setup>
import { type PropType } from 'vue'

const props = defineProps({
  name: {
    type: String as PropType<string>,
    required: true,
  },
})
</script>

<template>
  <div class="inline-block leading-none">
    <component width="100%" height="100%" :is="`icon-${name}`" />
  </div>
</template>
