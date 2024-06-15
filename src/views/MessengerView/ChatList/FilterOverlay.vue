<script lang="ts" setup>
import { useChatStore } from '@/stores/chat.store'
import IconButton from '@/components/form/IconButton.vue'
import Calendar from 'primevue/calendar'
import Button from '@/components/form/Button.vue'
import Chips from '@/components/form/Chips.vue'
import { onMounted, onUnmounted, ref, watch } from 'vue'
import { yieldToMain } from '@/utils/promise.utils'
import MultiSelect from '@/components/form/MultiSelect.vue'
import type { ChatFilter } from './FilterOverlay.types'
import { useUserStore } from '@/stores/user.store'
import { useWindowSize } from '@vueuse/core'

/** Minimal bottom margin from the window bottom */
const MIN_MARGIN_BOTTOM_PX = 20

const visible = defineModel<boolean>('visible')
const filters = defineModel<ChatFilter>({ required: true })

const emit = defineEmits<{ filter: [] }>()

const chatStore = useChatStore()
const userStore = useUserStore()

const { width: windowWidth, height: windowHeight } = useWindowSize()

const filtersOverlay = ref<HTMLDivElement>()
const filtersWrapper = ref<HTMLDivElement>()
const mouseDownListener_offFilterOverlay = (e: Event) => {
  let node = e.target as HTMLElement | null
  let appFlag = false
  while (node) {
    if (node === filtersOverlay.value) {
      return
    }
    if (node.id === 'app') {
      appFlag = true
    }
    node = node.parentNode as HTMLElement
  }
  visible.value &&= !appFlag // primevue overlays located next to #app div, so they are not in filtersOverlay.
}
onMounted(() => {
  document.addEventListener('mousedown', mouseDownListener_offFilterOverlay)
})
onUnmounted(() => {
  document.removeEventListener('mousedown', mouseDownListener_offFilterOverlay)
})

const checkWindowOverflow = () => {
  // Check window bottom overflow
  if (!filtersOverlay.value || !filtersWrapper.value) return
  const { y, height } = filtersOverlay.value.getBoundingClientRect()
  const {
    paddingTop,
    paddingBottom,
    borderTopWidth,
    borderBottomWidth,
    boxSizing,
  } = window.getComputedStyle(filtersOverlay.value)
  const paddingBlockPx =
    Number(paddingBottom.slice(0, -2)) + Number(paddingTop.slice(0, -2))
  const borderBlockPx =
    boxSizing === 'content-box'
      ? 0
      : Number(borderBottomWidth.slice(0, -2)) +
        Number(borderTopWidth.slice(0, -2))
  const newHeight =
    y + height >= window.innerHeight - MIN_MARGIN_BOTTOM_PX ||
    filtersWrapper.value.scrollHeight > filtersWrapper.value.clientHeight
      ? `${Math.min(filtersWrapper.value.scrollHeight + paddingBlockPx + borderBlockPx, window.innerHeight - y - MIN_MARGIN_BOTTOM_PX)}px`
      : 'auto'
  filtersOverlay.value!.style['height'] = newHeight
}
watch(visible, () => {
  yieldToMain().then(checkWindowOverflow)
})
onMounted(() => {
  window.addEventListener('resize', checkWindowOverflow)
  userStore.getFilters()
  userStore.getStages()
})
onUnmounted(() => {
  window.removeEventListener('mousedown', checkWindowOverflow)
})
</script>

<template>
  <div
    v-if="visible"
    class="bg-white dark:bg-surface-800 dark:border-primary-500 dark:border absolute top-full w-full rounded-md p-4 pr-1 text-gray-1 dark:text-gray-400 z-10 mt-1"
    ref="filtersOverlay"
  >
    <div ref="filtersWrapper" class="overflow-y-auto scrollbar max-h-full">
      <div class="flex justify-between items-center">
        <p class="font-bold select-none">{{ $t('filters') }}</p>
        <IconButton
          icon="cross"
          class="w-6 text-gray-10"
          @click="visible = false"
        />
      </div>
      <ul
        class="text-xs text-gray-2 dark:text-gray-400 flex flex-col gap-2 mt-2 px-px"
      >
        <li>
          <p>{{ $t('stage') }}</p>
          <MultiSelect
            v-model="filters.stages"
            class="w-full"
            :options="userStore.stages"
            option-label="title"
            option-value="id"
            filter
          />
        </li>
        <li>
          <p>{{ $t('currentAssignee') }}</p>
          <MultiSelect
            v-model="filters.assignees"
            class="w-full"
            :options="userStore.managers"
            option-label="name"
            option-value="id"
            filter
          />
        </li>
        <li>
          <p>{{ $t('channel') }}</p>
          <MultiSelect
            v-model="filters.channels"
            class="w-full"
            :options="userStore.channels"
            option-label="name"
            option-value="id"
            filter
          />
        </li>
        <li>
          <p>{{ $t('platform') }}</p>
          <MultiSelect
            v-model="filters.platforms"
            class="w-full"
            :options="userStore.platforms"
            option-label="name"
            option-value="name"
            filter
          />
        </li>
        <li>
          <p>{{ $t('registrationDate') }}</p>
          <Calendar
            v-model="filters.regDate"
            class="w-full"
            selection-mode="range"
            show-button-bar
            :numberOfMonths="windowWidth < 700 ? 1 : 2"
          />
        </li>
        <li>
          <p>{{ $t('creationDate') }}</p>
          <Calendar
            v-model="filters.created"
            class="w-full"
            selection-mode="range"
            show-button-bar
            :numberOfMonths="windowWidth < 700 ? 1 : 2"
          />
        </li>
        <li>
          <p>{{ $t('lastManagerMessageDate') }}</p>
          <Calendar
            v-model="filters.lastManagerMessageDate"
            class="w-full"
            selection-mode="range"
            show-button-bar
            :numberOfMonths="windowWidth < 700 ? 1 : 2"
          />
        </li>
        <li>
          <p>{{ $t('lastClientMessageDate') }}</p>
          <Calendar
            v-model="filters.lastClientMessageDate"
            class="w-full"
            selection-mode="range"
            show-button-bar
            :numberOfMonths="windowWidth < 700 ? 1 : 2"
          />
        </li>
        <li>
          <p>{{ $t('edgeAssignee') }}</p>
          <MultiSelect
            v-model="filters.edgeAssignee"
            class="w-full"
            :options="userStore.managers"
            option-label="name"
            option-value="id"
            filter
          />
        </li>
        <li>
          <p>{{ $t('depositDate') }}</p>
          <Calendar
            class="w-full"
            v-model="filters.depositDate"
            selection-mode="range"
            show-button-bar
            :numberOfMonths="windowWidth < 700 ? 1 : 2"
          />
        </li>
        <li>
          <p>{{ $t('tags') }}</p>
          <Chips
            v-model="filters.tags"
            class="w-full"
            :placeholder="$t('typeTags')"
          />
        </li>
      </ul>
      <Button
        :label="$t('apply').toUpperCase()"
        icon="pi pi-check"
        class="w-full justify-center mt-3"
        @click="emit('filter')"
      />
    </div>
  </div>
</template>
