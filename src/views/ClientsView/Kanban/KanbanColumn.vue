<script lang="ts" setup>
import draggable from 'vuedraggable'
import { computed, ref } from 'vue'
import InputText from 'primevue/inputtext'
import KanbanCard from './KanbanCard.vue'
import ContextMenu from 'primevue/contextmenu'
import { useClientsStore } from '@/stores/clients.store'
import type { ClientsStage } from '@/models'
import { storeToRefs } from 'pinia'
import Pallete from '@/views/ClientsView/Kanban/Pallete.vue'
import PalleteIcon from '@/assets/icons/pallete-icon.svg'
import PenIcon from '@/assets/icons/pen.svg'
import SelectIcon from '@/assets/icons/select.svg'
import RemoveDialog from '@/views/ClientsView/Kanban/RemoveDialog.vue'
import { type Player } from '@/models'
import { onClickOutside } from '@vueuse/core'

const { stage } = defineProps<{ stage: ClientsStage }>()
const store = useClientsStore()
const { selectPlayers, clientsSettings } = storeToRefs(store)

const menuRef = ref<ContextMenu>()
const menuToggled = ref(false)
const showPallete = ref(false)
const removeDialogVisible = ref(false)
const editTitle = ref(false)
const editTitleValue = ref()
const inputEditRef = ref()

const handleMenuClick = (event: MouseEvent) => {
  event.stopPropagation()
  if (!menuRef.value) return
  menuToggled.value = !menuToggled.value
  menuRef.value.toggle(event)
}

const getButtonClass = () => {
  return `pi ${menuToggled.value ? 'pi-ellipsis-h' : 'pi-ellipsis-v'} clients-kanban__additional`
}

const showCheckBox = () => {
  store.changeSelectCheckboxState(!selectPlayers.value)
  store.updatePlayersSelection(stage.players)
}

const showRemoveDialog = () => {
  removeDialogVisible.value = true
}

const doubleClickEdit = () => {
  if (!clientsSettings.value) return
  editTitle.value = true
  editTitleValue.value = stage.title
}

const menuModel = computed(() => {
  return [
    {
      label: 'Изменить цвет',
      class: 'clients-kanban__menu-item',
      icon: 'pallete',
      command: () => (showPallete.value = true),
      visible: clientsSettings.value,
    },
    {
      label: 'Выбрать',
      icon: 'select_icon',
      class: 'clients-kanban__menu-item',
      command: showCheckBox,
    },
    {
      label: 'Удалить',
      icon: 'delete',
      class: 'clients-kanban__menu-item',
      command: showRemoveDialog,
      visible: clientsSettings.value,
    },
  ]
})

interface PlayerDndEvent {
  moved?: {
    newIndex: number
    element: Player
  }
  added?: {
    newIndex: number
    element: Player
  }
}

const playerMove = (evt: PlayerDndEvent) => {
  const event = evt.moved || evt.added
  if (!event || !event.element) return
  store.movePlayer(event.element, stage.id, 0)
}

const handleColorChange = (color: string) => {
  store.changeStageColor(stage.id, color)
}

const handleColorChangeEnd = () => {
  // TODO: check if color changed??
  store.stageChangeColor(stage.id, stage.color)
  showPallete.value = false
}

onClickOutside(inputEditRef, () => {
  editTitle.value = false
  store.updateStage(stage.id, { title: editTitleValue.value })
})
</script>

<template>
  <div class="flex flex-col clients-kanban__column min-h-screen">
    <div class="clients-kanban__overlay"></div>
    <div
      class="relative flex justify-between clients-kanban__header px-2 cursor-move"
      :style="{ backgroundColor: stage.color }"
    >
      <div class="flex items-center w-full h-full">
        <InputText
          ref="inputEditRef"
          v-model="editTitleValue"
          class="w-full edit-column"
          v-if="editTitle"
        />
        <span
          v-else
          class="flex text-ellipsis text-nowrap clients-kanban__h1 w-full items-center"
          @dblclick="doubleClickEdit"
        >
          {{ stage.title }}
        </span>
      </div>
      <i
        :class="getButtonClass()"
        style="font-size: 1rem"
        @click="handleMenuClick"
      ></i>
      <ContextMenu ref="menuRef" :model="menuModel" @hide="menuToggled = false">
        <template #item="{ item }">
          <div
            class="flex font-semibold items-center py-2 px-3 no-underline overflow-hidden cursor-pointer select-none"
          >
            <PalleteIcon
              class="fill-icon mr-2"
              v-if="item.icon === 'pallete'"
            />
            <PenIcon class="fill-icon mr-2" v-if="item.icon === 'pen'" />
            <SelectIcon
              class="stroke-icon mr-2"
              v-if="item.icon === 'select_icon'"
            />
            <i v-if="item.icon === 'delete'" class="pi pi-times mr-2"></i>
            <span class="leading-6 text-sm">
              {{ item.label }}
            </span>
          </div>
        </template>
      </ContextMenu>
      <transition name="fade">
        <Pallete
          class="pallete"
          @on-color-change="handleColorChange"
          :color="stage.color"
          v-if="showPallete"
          @on-click-outside="handleColorChangeEnd"
        />
      </transition>
    </div>
    <div class="flex flex-col">
      <draggable
        :list="stage.players"
        :animation="200"
        group="players"
        item-key="id"
        class="min-h-screen"
        @change="playerMove"
      >
        <template #item="{ element }">
          <KanbanCard
            class="cursor-move"
            :player="element"
            :color="stage.color"
            :key="element.id"
            :stage-id="stage.id"
            :show-checkbox="selectPlayers"
          />
        </template>
      </draggable>
    </div>

    <RemoveDialog
      :visible="removeDialogVisible"
      @hide="removeDialogVisible = false"
      @remove-stage="store.removeStage(stage.id)"
    />
  </div>
</template>

<style scoped lang="scss">
.fill-icon {
  fill: rgb(var(--surface-500));
}

.stroke-icon {
  stroke: rgb(var(--surface-500));
}
.pallete {
  position: absolute;
  top: 45px;
  right: 5px;
  background-color: white;
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.edit-column {
  padding: 5px;
}

.sortable-ghost {
  opacity: 0.5;
  background: #f7fafc;
}
</style>
