<script lang="ts" setup>
import IconImage from '@/components/IconImage.vue'

const props = defineProps({
  icon: {
    type: String,
    required: true,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  loading: {
    default: false,
  },
})
</script>

<template>
  <IconImage
    class="flex items-center justify-center rounded select-none"
    :class="{
      'cursor-pointer hover:opacity-80 active:opacity-100': !disabled,
      'cursor-wait': loading,
    }"
    :name="icon"
    @click="
      disabled && $event.stopImmediatePropagation() && $event.preventDefault()
    "
  />
</template>
