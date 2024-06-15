<script lang="ts" setup>
import SectionFolder from '@/components/SectionFolder.vue'
import PlayerCard from './ChatInfo/PlayerCard.vue'
import { onMounted, ref, watch } from 'vue'
import Avatar from '@/components/Avatar.vue'
import TradeCard from './ChatInfo/TradeCard.vue'
import NotesCard from './ChatInfo/NotesCard.vue'
import SettingsModal from './ChatInfo/SettingsModal.vue'
import { booleanStoredRef } from '@/utils/vue.utils'
import { useChatStore, type Chat } from '@/stores/chat.store'
import { useUserStore } from '@/stores/user.store'

const props = defineProps({
  chatId: {
    type: Number,
    required: true,
  },
})

const chatStore = useChatStore()
const userStore = useUserStore()

const chatInfoFolded = booleanStoredRef('folded_chatInfo', true)

const chat = ref<Chat>()
watch(
  () => props.chatId,
  (id) => {
    if (id) {
      chatStore.fetchChat(props.chatId).then((current) => {
        chat.value = current
      })
    }
  },
  { immediate: true },
)

const infoSettingsModalVisible = ref(false)

onMounted(() => {
  userStore.getFilters()
  userStore.getStages()
})
</script>

<template>
  <div
    :class="['flex ml-3', { 'md:h-[calc(100dvh-3rem)]': !chatInfoFolded }]"
    v-if="chat"
  >
    <!-- Folder -->
    <div>
      <SectionFolder
        :class="{ 'bg-red-600': !chatInfoFolded }"
        side="left"
        v-model="chatInfoFolded"
      />
    </div>
    <!-- Folded -->
    <div
      v-if="chatInfoFolded"
      class="h-16 bg-primary-500 flex items-center justify-center py-1 px-3"
    >
      <Avatar class="size-11" :src="chat?.avatar" />
    </div>
    <!-- Unfolded -->
    <div
      v-else
      class="w-96 md:w-[calc(100dvw-1.3rem)] h-full bg-primary-500 dark:bg-surface-700 flex flex-col py-2 pl-4 pr-0 rounded-bl-md"
    >
      <div class="flex gap-3 items-center text-white">
        <Avatar class="size-11" :src="chat?.avatar" />
        <div class="fxlex gap-1 flex-col justify-center">
          <div>
            <span class="font-medium">{{ chat?.name }}</span>
            <span class="ml-3 font-light underline"
              >(@{{ chat?.username }})</span
            >
          </div>
          <span class="font-light dark:text-gray-300"
            >{{ $t('tradeId') }}: {{ chat?.id ?? 'null' }}</span
          >
        </div>
        <!-- <IconButton
          icon="dotdotdot"
          :class="['ml-auto mr-3.5 p-1 w-11 h-11 p-3 bg-primary-500 text-white']"
          :icon-size="20"
          @click="infoSettingsModalVisible = true"
        /> -->
      </div>
      <div class="w-full border-t border-gray-6 opacity-20 mt-2 mb-3" />
      <div
        class="overflow-y-auto scrollbar scrollbar-white max-w-full dark:text-gray-400"
      >
        <PlayerCard :chat-id="chatId" />
        <TradeCard class="mt-2" :chat-id="chatId" />
        <NotesCard class="mt-2" :chat-id="chatId" />
      </div>
    </div>
    <SettingsModal v-model:visible="infoSettingsModalVisible" />
  </div>
</template>
