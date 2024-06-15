<script setup lang="ts">
import InputText from 'primevue/inputtext'
import Button from 'primevue/button'
import MultiSelect from 'primevue/multiselect'
import Calendar from 'primevue/calendar'
import { onMounted, ref } from 'vue'
import { useClientsStore } from '@/stores/clients.store'
import { useEventListener } from '@vueuse/core'
import IconButton from '@/components/form/IconButton.vue'
import SearchIcon from '@icons/search.svg'
import { storeToRefs } from 'pinia'
import FiltersCalendar from '@/views/ClientsView/ClientsFilters/FiltersCalendar.vue'
import type { ClientsFilters } from '@/models'

const store = useClientsStore()
const { currentLine } = storeToRefs(store)
const numberOfMonths = ref(2)
const visible = defineModel('visible')
const filters = defineModel<ClientsFilters>('filters', { required: true })
const emits = defineEmits<{ (e: 'onFilter'): void }>()

const calendarResizeHandler = () => {
  const windowInnerWidth = window.innerWidth
  if (windowInnerWidth < 1200) {
    numberOfMonths.value = 1
  } else {
    numberOfMonths.value = 2
  }
}

const applyFiltersHandler = () => {
  emits('onFilter')
  store.fetchLine(currentLine.value, filters.value)
}

useEventListener('resize', calendarResizeHandler)

onMounted(calendarResizeHandler)
</script>

<template>
  <div class="kanban-filters" v-if="visible">
    <div class="flex justify-between">
      <span class="kanban-filters__header">{{ $t('filters') }}</span>
      <div class="flex justify-between items-center kanban-filters__exit">
        <IconButton
          icon="cross"
          class="w-6 text-gray-10"
          @click="visible = false"
        />
      </div>
    </div>
    <div class="kanban-filters__controls mt-2">
      <div class="flex kanban-filters__group">
        <div class="flex flex-col kanban-filters__input">
          <label for="">Поиск</label>
          <InputText
            class="kanban-filters__control"
            v-model="filters.search"
            :placeholder="$t('enterWord')"
          />
        </div>
        <div class="flex flex-col kanban-filters__input">
          <label for="">{{ $t('stage') }}</label>
          <MultiSelect
            class="kanban-filters__control"
            v-model="filters.stages"
            :options="store.lineFilters.stages"
            option-label="title"
            :placeholder="$t('selectFromMultiselect')"
            option-value="id"
          />
        </div>
        <div class="flex flex-col kanban-filters__input">
          <label for="">{{ $t('currentAssignee') }}</label>
          <MultiSelect
            class="kanban-filters__control"
            v-model="filters.assignees"
            :options="store.lineFilters.managers"
            option-label="username"
            :placeholder="$t('selectFromMultiselect')"
            option-value="id"
          />
        </div>
      </div>
      <div class="flex kanban-filters__group">
        <div class="flex flex-col kanban-filters__input">
          <label for="">{{ $t('channel') }}</label>
          <MultiSelect
            class="kanban-filters__control"
            v-model="filters.channels"
            :options="store.lineFilters.channels"
            option-label="name"
            :placeholder="$t('selectFromMultiselect')"
            option-value="id"
          />
        </div>
        <div class="flex flex-col kanban-filters__input">
          <label for="">{{ $t('platform') }}</label>
          <MultiSelect
            class="kanban-filters__control"
            v-model="filters.platforms"
            :options="store.lineFilters.platforms"
            :placeholder="$t('selectFromMultiselect')"
          />
        </div>
        <div class="flex flex-col kanban-filters__input">
          <label for="">{{ $t('registrationDate') }}</label>
          <FiltersCalendar
            class="kanban-filters__control"
            v-model="filters.regDate"
            :numberOfMonths="numberOfMonths"
            :placeholder="$t('enterDate')"
          />
        </div>
      </div>
      <div class="flex kanban-filters__group">
        <div class="flex flex-col kanban-filters__input">
          <label for="">{{ $t('creationDate') }}</label>
          <FiltersCalendar
            class="kanban-filters__control"
            v-model="filters.created"
            :numberOfMonths="numberOfMonths"
            :placeholder="$t('enterDate')"
          />
        </div>
        <div class="flex flex-col kanban-filters__input">
          <label for="">Последнее сообщение менеджера</label>
          <FiltersCalendar
            class="kanban-filters__control"
            v-model="filters.lastManagerMessageDate"
            :numberOfMonths="numberOfMonths"
            :placeholder="$t('enterDate')"
          />
        </div>
        <div class="flex flex-col kanban-filters__input">
          <label for="">Последнее сообщение клиента</label>
          <FiltersCalendar
            class="kanban-filters__control"
            v-model="filters.lastClientMessageDate"
            :numberOfMonths="numberOfMonths"
            :placeholder="$t('enterDate')"
          />
        </div>
      </div>
      <div class="flex kanban-filters__group">
        <div class="flex flex-col kanban-filters__input">
          <label for="">{{ $t('edgeAssignee') }}</label>
          <MultiSelect
            class="kanban-filters__control"
            v-model="filters.edgeAssignee"
            :options="store.lineFilters.managers"
            option-label="username"
            :placeholder="$t('selectFromMultiselect')"
            option-value="id"
          />
        </div>
        <div class="flex flex-col kanban-filters__input">
          <label for="">{{ $t('depositDate') }}</label>
          <FiltersCalendar
            class="kanban-filters__control"
            v-model="filters.depositDate"
            :numberOfMonths="numberOfMonths"
            :placeholder="$t('enterDate')"
          />
        </div>
        <div class="flex flex-col kanban-filters__input justify-end">
          <label for="">Теги</label>
          <MultiSelect
            class="kanban-filters__control"
            v-model="filters.tags"
            :options="store.lineFilters.tags"
            :placeholder="$t('selectFromMultiselect')"
          ></MultiSelect>
        </div>
      </div>
      <Button
        class="clients-controls__red clients-controls__no-shadow kanban-filters__search"
        @click="applyFiltersHandler"
      >
        <template #icon>
          <SearchIcon class="kanban-search-icon" />
          {{ $t('search') }}
        </template>
      </Button>
    </div>
  </div>
</template>

<style scoped lang="scss">
.dark {
  & .kanban-filters {
    background-color: #232637;
    border: 1px solid #3b4061;
    color: white;
    & label {
      color: #9d9db7;
    }
  }
}

.kanban-search-icon {
  margin-right: 10px;
  width: 1rem;
}

.kanban-filters {
  display: flex;
  flex-flow: column;
  padding: 10px 20px 20px 20px;
  position: absolute;
  top: 40px;
  width: 100%;
  background-color: #ffffff;
  border: 1px solid #d7d8dc;
  z-index: 1000;

  &__input {
    flex-grow: 1;
    width: 33%;
  }

  &__controls {
    display: flex;
    flex-flow: column;
    gap: 15px;
  }
  &__group {
    display: flex;
    flex-grow: 1;
    gap: 15px;
  }
  &__control {
    max-height: 28px;
  }
  &__header {
    font-size: 1.2rem;
    font-weight: bold;
  }
}

@media (max-width: 1100px) {
  .kanban-filters {
    top: 0;
    z-index: 1002;
    &__controls {
      gap: 5px;
    }
    &__group {
      flex-flow: row;
      flex-wrap: wrap;
      gap: 5px;
    }
    &__input {
      width: 50%;
    }
    &__search {
      margin-top: 5px;
    }
  }
}
</style>
