<script setup lang="ts">
import Button from 'primevue/button'
import Dropdown, { type DropdownChangeEvent } from 'primevue/dropdown'
import Checkbox from 'primevue/checkbox'
import ElipsisIcon from '@/assets/icons/dotdotdot.svg'
import { useUserStore } from '@/stores/user.store'
import { computed, onMounted, ref, toRefs } from 'vue'
import { useClientsStore } from '@/stores/clients.store'
import type { Player } from '@/models'
import { onClickOutside } from '@vueuse/core'
import RemovePlayersDialog from '@/views/ClientsView/RemovePlayersDialog.vue'
import StrokeRemove from '@/assets/icons/stroke-remove.svg'

const { viewTable } = defineProps<{ viewTable: boolean }>()
const userStore = useUserStore()
const clientsStore = useClientsStore()
const { clients, selectedPlayers } = toRefs(clientsStore)
const allSelected = ref(false)
const showOverlay = ref(false)
const clientsDropdowns = ref()
const removePlayersVisible = ref(false)

onMounted(() => {
  userStore.getStages()
  userStore.getFilters()
})

const handleSelectAll = () => {
  clientsStore.changePlayersSelection(!allSelected.value)
  allSelected.value = !allSelected.value
}

const updateProperty = (property: keyof Player, event: DropdownChangeEvent) => {
  clientsStore.updatePlayers({ [property]: event.value.id })
}
const updatePlayerPlatform = (event: DropdownChangeEvent) => {
  clientsStore.updatePlayers({ platform: event.value.name })
}

const showRemoveDialog = () => {
  if (selectedPlayers.value.length) {
    removePlayersVisible.value = true
  }
}

onClickOutside(clientsDropdowns, (event: Event) => {
  if (
    event.target instanceof Element &&
    event.target.className.includes('clients-more')
  )
    return
  showOverlay.value = false
})
</script>

<template>
  <RemovePlayersDialog
    :visible="removePlayersVisible"
    @remove-players="clientsStore.removePlayers"
  />
  <div class="flex w-full justify-between align-center relative container">
    <div
      class="flex items-center cursor-pointer select-checkbox"
      @click.prevent="handleSelectAll"
    >
      <Checkbox
        v-model="allSelected"
        binary
        :input-class="{ 'cursor-pointer': true }"
        v-if="!viewTable"
      />
      <label class="ml-2 cursor-pointer select-none" v-if="!viewTable"
        >Выбрать все</label
      >
    </div>
    <Button
      class="clients-more clients-controls__red clients-controls__no-shadow"
      @click.prevent="showOverlay = !showOverlay"
    >
      <template #icon>
        <ElipsisIcon />
      </template>
    </Button>
    <div
      class="clients-dropdowns"
      ref="clientsDropdowns"
      :class="{ 'clients-dropdowns--show': showOverlay }"
    >
      <Dropdown
        placeholder="сменить статус"
        :options="clients?.stages"
        option-label="title"
        class="clients-dropdowns__control"
        @change="updateProperty('stage', $event)"
      ></Dropdown>
      <Dropdown
        placeholder="сменить ответственного"
        class="ml-2 clients-dropdowns__control"
        :options="userStore.managers"
        @change="updateProperty('resp', $event)"
        option-label="username"
      ></Dropdown>
      <Dropdown
        placeholder="сменить платформу"
        class="ml-2 clients-dropdowns__control"
        :options="userStore.platforms"
        option-label="name"
        @change="updatePlayerPlatform"
      ></Dropdown>
      <Dropdown
        placeholder="сменить канал"
        class="ml-2 clients-dropdowns__control"
        :options="userStore.channels"
        @change="updateProperty('channel', $event)"
        option-label="name"
      ></Dropdown>
      <Button
        class="ml-2 clients-controls__red clients-controls__no-shadow h-full clients-dropdowns__control"
        :disabled="!selectedPlayers.length"
        @click="showRemoveDialog"
      >
        <template #icon>
          Удалить
          <StrokeRemove class="ml-2" />
        </template>
      </Button>
    </div>
  </div>
</template>

<style scoped lang="scss">
.container {
  min-height: 20px;
}

.clients-more {
  display: none;
}

@media (max-width: 1250px) {
  .clients-dropdowns {
    display: none;
    background-color: white;
    border: 1px solid #d7d8dc;
    border-radius: 5px;
    padding: 10px;
    gap: 10px;
    flex-flow: column;
    position: absolute;
    right: 0;
    top: 33px;
    z-index: 1000;
    .dark & {
      background-color: #232637;
      border: 1px solid #3b4061;
    }
    &--show {
      display: flex;
    }
    &__control {
      margin-left: 0;
    }
  }
  .clients-more {
    display: flex;
    width: 30px;
    height: 30px;
    z-index: 999;
    border-radius: 3px;

    & svg {
      width: 100%;
      height: 100%;
    }
  }
}

.dark {
  .select-checkbox {
    color: white;
    & input {
      border: solid 1px #3b4061;
    }
  }
}
</style>
