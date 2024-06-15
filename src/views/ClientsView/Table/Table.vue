<script setup lang="ts">
import DataTable, {
  type DataTableRowContextMenuEvent,
} from 'primevue/datatable'
import Column from 'primevue/column'
import Skeleton from 'primevue/skeleton'
import { useClientsStore } from '@/stores/clients.store'
import { storeToRefs } from 'pinia'
import { computed, onMounted, reactive, ref, watch } from 'vue'
import type { ExpandedClientsPlayer, Player } from '@/models'
import ContextMenu from 'primevue/contextmenu'
import { DateTime } from 'luxon'
import { sortBy } from 'lodash'
import { Tippy } from 'vue-tippy'
import { useEventListener } from '@vueuse/core'
import { VueSpinner } from 'vue3-spinners'

const store = useClientsStore()
const { clients, fetching, page, currentLine, filters } = storeToRefs(store)
const selectedRows = ref()
const selectedRow = ref<Player>()
const menuRef = ref()
const toolTipPosition = ref({
  top: '0px',
  left: '0px',
  text: '',
  display: 'none',
})

const menuModel = computed(() => {
  return [
    {
      label: 'Удалить',
      command: () => {
        if (selectedRow.value) {
          store.removePlayer(selectedRow.value)
        }
      },
    },
    clients.value
      ? {
          label: 'Переместить',
          items: clients.value.stages.map((v) => ({
            label: v.title || 'Нет заголовка',
            command: () => {
              if (selectedRow.value) {
                store.movePlayer(selectedRow.value, v.id)
              }
            },
          })),
        }
      : {},
  ]
})

const onRowContextMenu = (event: DataTableRowContextMenuEvent) => {
  menuRef.value.show(event.originalEvent)
}

const onPage = () => {
  if (!fetching.value) {
    store.fetchLine(currentLine.value, filters.value, page.value + 1)
  }
}

const items = ref<any>([])
const getItems = () => {
  if (!clients.value) return []
  const result = []
  for (let i = 0; i < clients.value.stages.length; i++) {
    const stage = clients.value.stages[i]
    for (const player of stage.players) {
      result.push({
        ...player,
        playerStageIndex: i,
        createdDateText: player.created_at
          ? DateTime.fromISO(player.created_at).toFormat('dd.MM.yyyy')
          : 'Нет даты',
      })
    }
  }
  return sortBy(result, ['id'], ['asc'])
}
const viewHeight = ref(0)

const calculateHeight = () => {
  const header = document.getElementsByTagName('header')[0]
  const kanbanHeader = document.getElementsByClassName('clients-controls')[0]
  if (header && kanbanHeader) {
    const headerHeight = header.clientHeight
    const kanbanHeaderHeight = kanbanHeader.clientHeight
    const result = window.innerHeight - headerHeight - kanbanHeaderHeight - 50
    viewHeight.value = result
  }
}

useEventListener('resize', calculateHeight)

watch(clients, () => {
  items.value = getItems()
})

onMounted(() => {
  items.value = getItems()
  calculateHeight()
})

const getColumnClass = (playerStageIndex: number, itemStageIndex: number) => {
  if (playerStageIndex > itemStageIndex) {
    return { 'stages__item--active': true }
  }
  if (playerStageIndex === itemStageIndex) {
    return { 'stages__item--current': true }
  }
}

const handleStageClick = (player: Player, nextStageId: number) => {
  if (player.stage === nextStageId) return
  store.movePlayer(player, nextStageId)
}

const stageHover = (text: string | undefined, event: MouseEvent) => {
  const { target } = event
  if (target instanceof Element) {
    const bodyRect = document.body.getBoundingClientRect()
    const rect = target.getBoundingClientRect()
    toolTipPosition.value = {
      top: `${rect.top - bodyRect.top - 45}px`,
      left: `${rect.left - bodyRect.left}px`,
      text: text || '',
      display: 'flex',
    }
  }
}

watch(selectedRows, () => {
  if (selectedRows.value && selectedRows.value.length > 0) {
    store.changeSelectCheckboxState(true)
    store.updatePlayersSelection(selectedRows.value)
  } else {
    store.changeSelectCheckboxState(false)
  }
})
</script>

<template>
  <div class="overflow-x-scroll">
    <div class="stage-tooltip" :style="{ ...toolTipPosition }">
      <p>
        {{ toolTipPosition.text }}
      </p>
    </div>
    <ContextMenu ref="menuRef" :model="menuModel" />
    <DataTable
      v-model:value="items"
      v-model:selection="selectedRows"
      stripedRows
      class="pt-8 table"
      context-menu
      v-model:context-menu-selection="selectedRow"
      @row-contextmenu="onRowContextMenu"
      highlight-on-select
      scrollable
      :scroll-height="'flex'"
      :virtualScrollerOptions="{
        lazy: true,
        onLazyLoad: onPage,
        itemSize: 46,
        delay: 200,
        showLoader: true,
        loading: fetching,
        appendOnly: true,
      }"
      tableStyle="min-width: 50rem"
      :style="{ width: '100%', height: `${viewHeight}px` }"
    >
      <Column selectionMode="multiple" headerStyle="width: 3rem">
        <template #loading>
          <div
            class="flex align-items-center"
            :style="{ height: '20px', 'flex-grow': '1', overflow: 'hidden' }"
          >
            <Skeleton width="100%" height="100%" />
          </div>
        </template>
      </Column>
      <Column header="ID" field="id" :sortable="true">
        <template #loading>
          <div
            class="flex align-items-center"
            :style="{ height: '20px', 'flex-grow': '1', overflow: 'hidden' }"
          >
            <Skeleton width="100%" height="100%" />
          </div>
        </template>
      </Column>
      <Column header="Имя" field="username" :sortable="true">
        <template #loading>
          <div
            class="flex align-items-center"
            :style="{ height: '20px', 'flex-grow': '1', overflow: 'hidden' }"
          >
            <Skeleton width="100%" height="100%" />
          </div>
        </template>
      </Column>
      <Column header="Дата создания" field="createdDateText" :sortable="true">
        <template #loading>
          <div
            class="flex align-items-center"
            :style="{ height: '20px', 'flex-grow': '1', overflow: 'hidden' }"
          >
            <Skeleton width="100%" height="100%" />
          </div>
        </template>
      </Column>
      <Column header="Ответственный" field="resp" :sortable="true">
        <template #loading>
          <div
            class="flex align-items-center"
            :style="{ height: '17px', 'flex-grow': '1', overflow: 'hidden' }"
          >
            <Skeleton width="60%" height="1rem" />
          </div>
        </template>
        <template #body="row">
          {{ row.data.resp ? row.data.resp.username : 'Не указан' }}
        </template>
      </Column>
      <Column header="Стадия" field="playerStage">
        <template #loading>
          <div
            class="flex align-items-center"
            :style="{ height: '17px', 'flex-grow': '1', overflow: 'hidden' }"
          >
            <Skeleton width="60%" height="1rem" />
          </div>
        </template>
        <template #body="slotProps">
          <div
            v-if="clients?.stages"
            class="flex stages relative"
            :style="{
              width: `${clients?.stages.length * 15 + clients?.stages.length * 3 + 6}px`,
            }"
          >
            <tippy
              v-for="(item, index) in clients.stages"
              :content="item.title"
            >
              <div
                class="stages__item"
                :class="getColumnClass(slotProps.data.playerStageIndex, index)"
                @click="handleStageClick(slotProps.data, item.id)"
              ></div>
            </tippy>
          </div>
          <span>
            {{
              clients?.stages.filter((v) => v.id === slotProps.data.stage)[0]
                .title || 'Не указан'
            }}
          </span>
        </template>
      </Column>
      <Column header="Теги" field="tags" style="max-width: 200px">
        <template #loading>
          <div
            class="flex align-items-center"
            :style="{ height: '17px', 'flex-grow': '1', overflow: 'hidden' }"
          >
            <Skeleton width="60%" height="1rem" />
          </div>
        </template>
        <template #body="slotProps">
          <span class="break-words" style="width: 30px">
            {{ slotProps.data.tags || 'Нет тегов' }}
          </span>
        </template>
      </Column>
      <Column header="Платформа" field="platform" :sortable="true">
        <template #loading>
          <div
            class="flex align-items-center"
            :style="{ height: '17px', 'flex-grow': '1', overflow: 'hidden' }"
          >
            <Skeleton width="60%" height="1rem" />
          </div>
        </template>
      </Column>
    </DataTable>
  </div>
</template>

<style scoped lang="scss">
.stages {
  border: solid 1px #d7d8dc;
  padding: 3px;
  gap: 3px;

  &__item {
    width: 15px;
    height: 15px;
    background-color: #d0dbf5;
    cursor: pointer;
    border-radius: 3px;

    &:hover {
      border: solid 1px #3575e6;
      background-color: #ffffff;
    }

    &--current {
      background-color: #3575e6;

      &:hover {
        border: unset;
        background-color: #3575e6;
      }
    }

    &--active {
      background-color: #3575e6;
    }
  }
}

.dark {
  & .stages {
    background-color: #232637;
    border: 1px solid #3b4061;

    &__item {
      background-color: #203964;

      &:hover {
        background-color: #ffffff;
        border: 1px solid #3575e6;
      }

      &--current {
        background-color: #3575e6;

        &:hover {
          border: unset;
          background-color: #3575e6;
        }
      }

      &--active {
        background-color: #3575e6;
      }
    }
  }
}

.table {
  padding: 20px 15px 0 15px;
  width: 100%;
  user-select: none;
}
</style>
