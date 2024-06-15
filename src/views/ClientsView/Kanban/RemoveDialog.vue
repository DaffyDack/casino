<script setup lang="ts">
import Modal from '@/components/Modal.vue'
import Button from 'primevue/button'

const emit = defineEmits<{ (e: 'removeStage'): void }>()

const visible = defineModel<boolean>('visible', { required: true })
const hide = () => {
  visible.value = false
}

const remove = () => {
  emit('removeStage')
  hide()
}
</script>

<template>
  <Modal :visible="visible" @hide="hide" class="remove-stage">
    <p class="text-lg font-bold text-center">Удалить колонку?</p>
    <div class="mt-10">
      <Button
        class="clients-controls__red clients-controls__no-shadow"
        label="Удалить"
        @click="remove"
      ></Button>
      <Button
        class="clients-controls__blue clients-controls__no-shadow"
        label="Отменить"
        @click="hide"
      ></Button>
    </div>
  </Modal>
</template>

<style scoped lang="scss">
.dark.remove-stage {
  background-color: red;
}
</style>
