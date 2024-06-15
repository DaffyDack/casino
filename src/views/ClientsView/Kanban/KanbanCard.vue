<script lang="ts" setup>
import { DateTime } from 'luxon'
import Checkbox from '@/components/form/Checkbox.vue'
import './KanbanCard.scss'
import type { Player } from '@/models'
import { computed, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useClientsStore } from '@/stores/clients.store'
import ContextMenu from 'primevue/contextmenu'
import router from '@/router'
import { onLongPress } from '@vueuse/core'

const { player, color, stageId } = defineProps<{
  player: Player
  color: string
  showCheckbox: boolean
  stageId: number
}>()
defineEmits<{
  (e: 'onDragStart', event: DragEvent, player: Player, stageId: number): void
}>()
const store = useClientsStore()
const { selectedPlayers, clients, selectPlayers } = storeToRefs(store)
const menuRef = ref()
const kanbanCard = ref()

const menuModel = computed(() => {
  return [
    {
      label: 'Удалить',
      command: () => store.removePlayer(player),
    },
    {
      label: 'Выбрать',
      command: () => {
        store.changeSelectCheckboxState(!selectPlayers.value)
        store.changePlayerSelected(player.id)
      },
    },
    clients.value
      ? {
          label: 'Переместить',
          items: clients.value.stages.map((v) => ({
            label: v.title || 'Нет заголовка',
            command: () => store.movePlayer(player, v.id),
          })),
        }
      : {},
  ]
})

const isSelected = computed(() => selectedPlayers.value.includes(player.id))

const changeSelected = () => {
  store.changePlayerSelected(player.id)
}

const toggleContextMenu = (event: MouseEvent) => {
  event.stopPropagation()
  event.preventDefault()
  if (!menuRef.value) return
  menuRef.value.toggle(event)
}

const creationDate = computed(() => {
  return player.created_at
    ? DateTime.fromISO(player.created_at).toFormat('dd.MM.yyyy')
    : 'Нет даты'
})

const moveToChats = () => {
  router.push(`/messenger?chat=${player.id}`)
}

onLongPress(kanbanCard, toggleContextMenu)
</script>

<template>
  <div
    class="kanban-card"
    :style="{ borderColor: color }"
    @contextmenu="toggleContextMenu"
    ref="kanbanCard"
    @dblclick="moveToChats"
  >
    <ContextMenu ref="menuRef" :model="menuModel" />
    <div class="kanban-card__checkbox flex justify-end" v-if="showCheckbox">
      <Checkbox
        v-model="isSelected"
        @click="changeSelected"
        class="kanban-select"
      />
    </div>
    <div class="kanban-card__deal font-semibold">Сделка #{{ player.id }}</div>
    <div class="kanban-card__stage font-semibold" :style="{ color }">
      {{ player.first_name }}
    </div>
    <div class="kanban-card__group">
      <div class="kanban-card__name">Канал:</div>
      <div class="kanban-card__value">
        {{ player.channel ? player.channel.title : 'Не указан' }}
      </div>
    </div>
    <div class="kanban-card__group">
      <div class="kanban-card__name">Страна:</div>
      <div class="kanban-card__value">{{ player.country }}</div>
    </div>
    <div class="kanban-card__group">
      <div class="kanban-card__name">Ответственный:</div>
      <div class="kanban-card__value">
        {{ player.resp ? player.resp.username : 'Не указан' }}
      </div>
    </div>
    <div class="kanban-card__group">
      <div class="kanban-card__name">Дата создания:</div>
      <div class="kanban-card__value">{{ creationDate }}</div>
    </div>
    <div class="kanban-card__group">
      <div class="kanban-card__name">Кол-во депозитов:</div>
      <div class="kanban-card__value">{{ player.deposit_count }}</div>
    </div>
    <div class="kanban-card__group">
      <div class="kanban-card__name">Сумма депозитов</div>
      <div class="kanban-card__value">{{ player.deposit_amount }}</div>
    </div>
    <div class="kanban-card__group">
      <div class="kanban-card__name">Теги</div>
      <div class="kanban-card__value break-words">
        {{ player.tags || 'Нет тегов' }}
      </div>
    </div>
  </div>
</template>

<style lang="scss">
.dark {
  & .kanban-select {
    border: 1px solid #9d9db7;
  }
}
.kanban-card__value {
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
