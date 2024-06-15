<script setup lang="ts">
import Modal from '@/components/Modal.vue'
import Button from 'primevue/button'
import { useClientsStore } from '@/stores/clients.store'

const emit = defineEmits<{ (e: 'removePlayers'): void }>()

const store = useClientsStore()

const visible = defineModel<boolean>('visible', { required: true })
const hide = () => {
  visible.value = false
}

const remove = () => {
  emit('removePlayers')
  hide()
}
</script>

<template>
  <Modal :visible="visible" @hide="hide">
    <div class="remove-dialog">
      <p class="text-lg font-bold text-center">Удалить сделки?</p>
      <div class="deals-list">
        <div class="deals-list__item" v-for="item in store.selectedPlayers">
          Сделка #{{ item }}
        </div>
      </div>
      <div class="mt-10 remove-dialog__controls">
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
    </div>
  </Modal>
</template>

<style scoped lang="scss">
.deals-list {
  display: flex;
  flex-flow: column;
  justify-content: center;
  width: 100%;
  margin-top: 20px;
  max-height: 200px;
  overflow-y: scroll;
  padding-top: 10px;
  &__item {
    display: flex;
    justify-content: center;
    font-size: 1.1rem;
    margin-top: 5px;
  }
}

.remove-dialog {
  min-width: 400px;
  &__controls {
    display: flex;
    justify-content: center;
    width: 100%;
  }
}

@media (max-width: 550px) {
  .remove-dialog {
    min-width: 80vw;
  }
}
</style>
