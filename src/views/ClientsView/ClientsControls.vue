<script setup lang="ts">
import Button from 'primevue/button'
import ClientsTableIcon from '@/assets/icons/clients-table.svg'
import ClientsFilterIcon from '@/assets/icons/clients-filter.svg'
import SettingsIcon from '@icons/settings-icon.svg'
import DotsIcon from '@icons/dotdotdot.svg'
import ShiftIcon from '@/assets/icons/shift-icon.svg'
import { useInterval } from '@vueuse/core'
import { useUserStore } from '@/stores/user.store'
import { computed, onMounted, ref, watch } from 'vue'
import { DateTime } from 'luxon'
import { useClientsService } from '@/services/clients.service'
import Dropdown, { type DropdownChangeEvent } from 'primevue/dropdown'
import { useClientsStore } from '@/stores/clients.store'
import type { ProfileLine } from '@/models'
import ClientsFilters from '@/views/ClientsView/ClientsFilters/ClientsFilters.vue'
import type { ClientsFilters as ClientsFiltersType } from '@/models'
import RemovePlayersDialog from '@/views/ClientsView/RemovePlayersDialog.vue'
import { isEmpty } from 'lodash'
import IconButton from '@/components/form/IconButton.vue'
import { storeToRefs } from 'pinia'

const userStore = useUserStore()
const clientsStore = useClientsStore()
const { clientsSettings } = storeToRefs(clientsStore)
const clientsService = useClientsService()
const time = ref<string | null>(null)
const filtersVisible = ref(false)
const filters = ref<ClientsFiltersType>({})
const burgerVisible = ref(false)

const updateTimeText = () => {
  if (userStore.user && userStore.user.shift) {
    time.value = DateTime.local()
      .diff(DateTime.fromISO(userStore.user.shift.date))
      .toFormat('hh:mm:ss')
  } else {
    time.value = null
  }
}

useInterval(100, {
  callback() {
    updateTimeText()
  },
})

const changeLine = (event: DropdownChangeEvent) => {
  filters.value = {}
  filtersVisible.value = false
  clientsStore.fetchLine(event.value)
}
const updateShift = () => {
  clientsService.setShift().then(() => {
    userStore.fetchData()
  })
}

onMounted(() => {
  updateTimeText()
})

const viewTable = defineModel('viewTable')

const filterActive = computed(() => {
  let active = false
  for (const item of Object.values(filters.value)) {
    if (!isEmpty(item)) {
      active = true
    }
  }
  return active
})

const goToOldSettings = () => {
  window.location.replace('https://mvpproject.io/business/')
}
</script>

<template>
  <div class="flex relative w-full justify-between clients-controls-media">
    <transition name="clients-fade">
      <ClientsFilters
        v-model:visible="filtersVisible"
        v-model:filters="filters"
        @on-filter="filtersVisible = false"
      />
    </transition>
    <div class="flex">
      <Button
        class="clients-controls__no-shadow"
        :class="{ 'black-btn': !!time, 'clients-controls__red': !time }"
        :label="time ? time : 'НАЧАТЬ СМЕНУ'"
        @click="updateShift"
      >
        <template #icon>
          <ShiftIcon class="mr-2" />
        </template>
      </Button>
      <Button
        class="ml-2 clients-controls__blue clients-controls__no-shadow clients-controls__filter mobile-hidden"
        :class="{ 'clients-controls__black': filterActive }"
        label="ФИЛЬТР"
        @click="filtersVisible = !filtersVisible"
      >
        <template #icon>
          <ClientsFilterIcon class="mr-2" />
        </template>
      </Button>
      <Dropdown
        class="ml-2 mobile-hidden"
        :options="userStore.lines"
        option-label="title"
        :model-value="clientsStore.currentLine"
        @change="changeLine"
      ></Dropdown>
    </div>
    <div class="flex mobile-hidden">
      <Button
        :label="viewTable ? 'КАНБАН' : 'ТАБЛИЦА'"
        class="clients-controls__blue clients-controls__no-shadow clients-controls__kanban mr-2.5"
        @click="viewTable = !viewTable"
      >
        <template #icon>
          <ClientsTableIcon class="mr-2" />
        </template>
      </Button>
      <Button
        v-if="userStore.user?.role !== 'manager'"
        :label="clientsSettings ? 'СОХРАНИТЬ' : 'НАСТРОЙКА'"
        class="clients-controls__no-shadow clients-controls__settings"
        :class="{ 'clients-controls__settings--active': clientsSettings }"
        @click="clientsSettings = !clientsSettings"
      >
        <template #icon>
          <SettingsIcon class="mr-2" />
        </template>
      </Button>
      <Button
        v-if="userStore.user?.role !== 'manager'"
        label="СТАРАЯ НАСТРОЙКА"
        class="clients-controls__no-shadow clients-controls__settings clients-controls__oldsettings"
        :class="{ 'clients-controls__settings--active': clientsSettings }"
        @click="goToOldSettings"
      >
        <template #icon>
          <SettingsIcon class="mr-2" />
        </template>
      </Button>
    </div>
    <!-- Burger menu -->
    <transition name="clients-fade">
      <div
        class="absolute flex flex-col clients-mobile-buttons"
        v-if="burgerVisible"
      >
        <div class="flex justify-between">
          <span class="font-bold text-xl">{{ $t('clientsControl') }}</span>
          <div class="flex justify-between items-center kanban-filters__exit">
            <IconButton
              icon="cross"
              class="w-6 text-gray-10"
              @click="burgerVisible = false"
            />
          </div>
        </div>
        <Button
          class="clients-controls__blue clients-controls__no-shadow clients-controls__filter"
          :class="{ 'clients-controls__black': filterActive }"
          label="ФИЛЬТР"
          @click="filtersVisible = !filtersVisible"
        >
          <template #icon>
            <ClientsFilterIcon class="mr-2" />
          </template>
        </Button>
        <Dropdown
          :options="userStore.lines"
          option-label="title"
          :model-value="clientsStore.currentLine"
          @change="changeLine"
        ></Dropdown>
        <Button
          :label="viewTable ? 'КАНБАН' : 'ТАБЛИЦА'"
          class="clients-controls__blue clients-controls__no-shadow clients-controls__kanban"
          @click="viewTable = !viewTable"
        >
          <template #icon>
            <ClientsTableIcon class="mr-2" />
          </template>
        </Button>
        <Button
          v-if="userStore.user?.role !== 'manager'"
          :label="clientsSettings ? 'СОХРАНИТЬ' : 'НАСТРОЙКА'"
          class="clients-controls__no-shadow clients-controls__settings"
          :class="{ 'clients-controls__settings--active': clientsSettings }"
          @click="clientsSettings = !clientsSettings"
        >
          <template #icon>
            <SettingsIcon class="mr-2" />
          </template>
        </Button>
        <Button
          v-if="userStore.user?.role !== 'manager'"
          label="СТАРАЯ НАСТРОЙКА"
          class="clients-controls__no-shadow clients-controls__settings"
          :class="{ 'clients-controls__settings--active': clientsSettings }"
          @click="goToOldSettings"
        >
          <template #icon>
            <SettingsIcon class="mr-2" />
          </template>
        </Button>
      </div>
    </transition>

    <Button
      class="clients-controls__no-shadow bg-white hover:bg-gray-3 more-btn"
      @click="burgerVisible = true"
    >
      <template #icon>
        <span class="flex text-black font-bold">
          <DotsIcon class="w-1 mr-2" />
          ЕЩЕ
        </span>
      </template>
    </Button>
  </div>
</template>

<style scoped lang="scss">
.black-btn {
  background-color: #181818;
  color: white;
  &:hover {
    background-color: lighten(#181818, 10%);
  }
  &:active {
    background-color: lighten(#181818, 20%);
  }
}

.more-btn {
  display: none;
}

.clients-mobile-buttons {
  display: none;
  width: 100%;
  padding: 10px;
  border-radius: 5px;
  background-color: white;
  z-index: 1000;
  gap: 10px;
  border: 1px solid #d7d8dc;
}

.clients-controls {
  &__oldsettings {
    margin-left: 10px;
  }
}

@media screen and (max-width: 1005px) {
  .clients-controls {
    &__filter {
      margin-left: 3px;
    }
    &__kanban {
      margin: 0;
    }
  }

  .clients-mobile-buttons {
    display: flex;
    .dark & {
      background-color: #232637;
      border: 1px solid #3b4061;
      color: white;
    }
  }
  .more-btn {
    display: flex;
    &:hover,
    &:focus {
      background-color: darken(#ffff, 10%);
    }
  }

  .mobile-hidden {
    display: none;
  }

  .clients-controls-media {
    & button {
      font-size: 0.8rem;
    }
  }
}
</style>
