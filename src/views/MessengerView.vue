<script setup lang="ts">
import Chat from './MessengerView/Chat.vue'
import ChatList from './MessengerView/ChatList.vue'
import SectionFolder from '@/components/SectionFolder.vue'
import { useRoute } from 'vue-router'
import { booleanStoredRef } from '@/utils/vue.utils'
import { useDark } from '@vueuse/core'
import { computed } from 'vue'
import { watch } from 'vue'
import { inject } from 'vue'
import type { Ref } from 'vue'
import type { RouteLocationRaw } from 'vue-router'
import { RouteNames } from '@/router'

const route = useRoute()

const prevRoute = inject<Ref<RouteLocationRaw>>('prevRoute')!

const chatListFolded = booleanStoredRef('folded_chatList', false)
const isChatSelected = computed(() => !!route.query.chat)
watch(
  isChatSelected,
  (isChatSelected) => {
    if (isChatSelected) {
      prevRoute.value = { query: {} }
    } else {
      prevRoute.value = { name: RouteNames.Home }
    }
  },
  { immediate: true },
)

const isDark = useDark()

// TODO: Refactore tempory solution till global store
const readEventBus: ((chatId: number) => any)[] = []
</script>

<template>
  <div class="flex h-full">
    <!-- Chats list -->
    <KeepAlive>
      <ChatList
        :class="[{ 'md:hidden': isChatSelected }, 'shrink-0']"
        v-model:folded="chatListFolded"
        :readEventBus="readEventBus"
      />
    </KeepAlive>
    <!-- Chats list folder -->
    <div :class="['md:hidden', 'w-0 z-10 relative mt-5']">
      <SectionFolder class="absolute" v-model="chatListFolded" />
    </div>
    <!-- Opened chat -->
    <div :class="[{ 'md:hidden': !isChatSelected }, 'grow']" class="relative">
      <!-- Chats list -->
      <KeepAlive>
        <Chat
          v-if="isChatSelected"
          @read="(chatId) => readEventBus.forEach((fn) => fn(chatId))"
        />
      </KeepAlive>
      <div
        v-if="!isChatSelected"
        class="bg-surface-100 dark:bg-surface-850 h-full flex justify-center items-center"
      >
        <div
          class="bg-white dark:bg-gray-14 w-[600px] h-[400px] text-lg font-bold rounded-2xl flex flex-col items-center justify-center gap-9"
        >
          <img v-if="isDark" src="@/assets/img/light-mvp-project.svg?image" />
          <img v-else src="@/assets/img/dark-mvp-project.svg?image" />
          <p class="dark:text-white text-surface-800">
            {{ $t('chooseChatFromList') }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
