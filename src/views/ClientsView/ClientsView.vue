<script lang="ts" setup>
import './ClientsView.scss'
import Kanban from './Kanban/Kanban.vue'
import Table from '@/views/ClientsView/Table/Table.vue'
import { onMounted, ref } from 'vue'
import { useUserStore } from '@/stores/user.store'
import { storeToRefs } from 'pinia'
import { useClientsStore } from '@/stores/clients.store'
import ClientsSelect from '@/views/ClientsView/ClientsSelect.vue'
import ClientsControls from '@/views/ClientsView/ClientsControls.vue'
import { useEventListener } from '@vueuse/core'
import LoadingBlurred from '@/App.vue'

const viewTable = ref(false)
const userStore = useUserStore()
const clientsStore = useClientsStore()
const { lines } = storeToRefs(userStore)
</script>

<template>
  <div class="flex flex-col w-full clients-controls">
    <ClientsSelect
      v-if="clientsStore.selectPlayers"
      :view-table="viewTable"
    ></ClientsSelect>
    <ClientsControls v-else v-model:view-table="viewTable"></ClientsControls>
  </div>
  <div class="relative clients-view">
    <transition name="slide-left">
      <Kanban class="absolute w-full" v-if="!viewTable" />
      <Table class="absolute w-full" v-else />
    </transition>
  </div>
</template>

<style lang="scss" scoped>
.clients-view {
  max-width: 100%;
  width: 100%;
}

.slide-left-enter-active,
.slide-left-leave-active {
  transition: all 0.25s ease-out;
}

.slide-left-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.slide-left-leave-to {
  opacity: 0;
  transform: translateX(-100%);
}
</style>
