<script setup lang="ts">
const { message } = defineProps<{ message?: string }>()
</script>

<template>
  <InlineMessage class="invalid-message">{{ message }}</InlineMessage>
</template>

<style scoped lang="scss">
.invalid-message {
  font-size: 0.9rem;
  color: #dc0909;
}
</style>
