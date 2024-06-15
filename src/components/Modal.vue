<script lang="ts" setup>
import Dialog from 'primevue/dialog'
import IconButton from './form/IconButton.vue'

const visible = defineModel<boolean>('visible')
const emit = defineEmits<{ (e: 'hide'): void }>()

const hideModal = () => {
  visible.value = false
  emit('hide')
}
</script>

<template>
  <Dialog
    :modal="true"
    class="relative"
    :closable="false"
    :visible="visible"
    :show-header="false"
  >
    <IconButton
      icon="cross"
      class="w-7 absolute -right-7 -top-7 text-white modal-exit"
      @click="hideModal"
    />
    <slot />
  </Dialog>
</template>

<style lang="scss" scoped>
@media screen and (max-width: 450px) {
  .modal-exit {
    top: -30px;
    right: 0;
  }
}
</style>
