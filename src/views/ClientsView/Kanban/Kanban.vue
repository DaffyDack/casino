<script lang="ts" setup>
import draggable from 'vuedraggable'
import { type OrderUpdateData, useClientsStore } from '@/stores/clients.store'
import './Kanban.scss'
import KanbanColumn from './KanbanColumn.vue'
import { storeToRefs } from 'pinia'
import KanbanAddSection from '@/views/ClientsView/Kanban/KanbanAddSection.vue'
import type { ClientsStage } from '@/models'
import { computed, onMounted, ref } from 'vue'
import { useUserStore } from '@/stores/user.store'
import { useEventListener, useInfiniteScroll } from '@vueuse/core'
import { VueSpinner } from 'vue3-spinners'
import { debounce } from 'lodash'

const store = useClientsStore()
const userStore = useUserStore()
const { lines } = storeToRefs(userStore)
const { clients, clientsSettings, fetching, currentLine, page, filters } =
  storeToRefs(store)
const viewHeight = ref(0)
const viewWidth = ref(0)
const containerRef = ref<HTMLDivElement>()
interface StageMoveEvent {
  moved?: {
    newIndex: number
    element: ClientsStage
  }
}

const calculateHeight = () => {
  const header = document.getElementsByTagName('header')[0]
  const kanbanHeader = document.getElementsByClassName('clients-controls')[0]
  if (header && kanbanHeader) {
    const headerHeight = header.clientHeight
    const kanbanHeaderHeight = kanbanHeader.clientHeight
    const result = window.innerHeight - headerHeight - kanbanHeaderHeight
    viewHeight.value = result
  }
}

const calculateWidth = () => {
  if (containerRef.value) {
    viewWidth.value = containerRef.value.clientWidth
  }
}

useEventListener('resize', () => {
  calculateHeight()
  calculateWidth()
})

onMounted(() => {
  if (lines.value.length > 0) {
    store.fetchLine(lines.value[0])
  }
  calculateHeight()
  calculateWidth()
})

useInfiniteScroll(
  containerRef,
  debounce(() => {
    if (clients.value && !fetching.value) {
      store.fetchLine(currentLine.value, filters.value, page.value + 1)
    }
  }, 100),
)
const stages = computed(() => {
  return clients.value ? clients.value.stages : []
})

const stageMove = (evt: StageMoveEvent) => {
  const event = evt.moved
  if (!event || !event.element || !stages.value) return
  const updateList: OrderUpdateData[] = []
  for (let i = 0; i < stages.value.length; i++) {
    const { id } = stages.value[i]
    updateList.push({ id, order: i })
  }
  store.updateStagesOrder(updateList)
}
</script>

<template>
  <div
    class="flex flex-col kanban-scrollable relative"
    :style="{ height: `${viewHeight}px` }"
    ref="containerRef"
  >
    <div class="flex clients-kanban relative">
      <transition name="clients-fade">
        <KanbanAddSection v-if="clientsSettings" />
      </transition>
      <draggable
        v-if="clients"
        handle=".clients-kanban__header"
        :list="stages"
        :animation="200"
        group="stages"
        item-key="id"
        class="flex gap-2"
        @change="stageMove"
        :disabled="!clientsSettings"
      >
        <template #item="{ element }">
          <KanbanColumn :stage="element" />
        </template>
      </draggable>
    </div>
    <div
      class="w-full h-2 flex justify-center items-center text-black dark:text-white p-2 fixed right-0 bottom-8"
      v-if="fetching"
      :style="{ width: `${viewWidth}px` }"
    >
      <VueSpinner size="50px"></VueSpinner>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.kanban-scrollable {
  overflow: scroll;
  &::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }
  &::-webkit-scrollbar-thumb {
    background-color: #333333;
    border-radius: 4px;
  }
  &::-webkit-scrollbar-track {
    background-color: transparent;
  }
  &::-webkit-scrollbar {
    opacity: 1 !important;
  }
}
</style>
