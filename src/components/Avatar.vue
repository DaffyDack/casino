<script lang="ts" setup>
const props = defineProps({
  src: {
    default: 'img/default_avatar.jpeg',
    // test
  },
})
</script>

<template>
  <img
    v-bind="$attrs"
    :src="src || 'img/default_avatar.jpeg'"
    class="h-11 w-11 rounded-full"
    onerror="this.src='img/default_avatar.jpeg'"
  />
</template>
