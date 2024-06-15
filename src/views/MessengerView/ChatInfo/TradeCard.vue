<script lang="ts" setup>
import Card from '@/components/Card.vue'
import Dropdown from '@/components/form/Dropdown.vue'
import { useChatService } from '@/services/chat.service'
import { useChatStore, type Chat } from '@/stores/chat.store'
import { useNotify } from '@/hooks/notify'
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useUserStore } from '@/stores/user.store'

const props = defineProps({
  chatId: {
    type: Number,
    required: true,
  },
})

const chatStore = useChatStore()
const userStore = useUserStore()
const chatService = useChatService()
const notify = useNotify()
const { t } = useI18n()

const chat = ref<Chat>()
watch(
  () => props.chatId,
  (id) => {
    refresh()
  },
  { immediate: true },
)

function refresh() {
  chatStore.fetchChat(props.chatId).then((c) => {
    chat.value = c
    chatStage.value = c.stage
  })
}

const chatStage = ref<number>()
function updateChatStage() {
  if (chat.value && chatStage.value !== undefined) {
    const savedChat = chatStore.archivedChats[chat.value.id]
    const stage = chatStage.value
    return chatService
      .updateChat(chat.value.id, { stage: chatStage.value })
      .then(() => {
        savedChat!.stage = stage
        notify(t('tradeStageUpdated'), 'success')
      })
      .catch(() => {
        chatStage.value = chat.value?.stage
        notify('tradeStageUpdateError', 'error')
      })
  }
}
</script>

<template>
  <Card
    class="w-full"
    :header="$t('infoAboutTrade').toUpperCase()"
    :foldable="true"
    fold-key="folded_chatInfo_tradeInfo"
    v-if="chat"
  >
    <div class="flex flex-col gap-2">
      <div class="border-b border-gray-5 dark:border-surface-600 pb-2">
        <p
          class="flex justify-between"
          v-for="(value, label, index) in {
            [$t('channel')]: chat.channel?.title,
            [$t('tradeLine')]: chat.line,
          }"
          :class="{
            'border-t border-gray-5 dark:border-surface-600 mt-2 pt-2':
              index > 0,
          }"
        >
          <span class="text-sm font-medium">{{ label }}:</span>
          <span class="text-sm">{{ value }}</span>
        </p>
      </div>
      <div>
        {{ $t('tradeStage') }}:<br />
        <Dropdown
          class="w-full"
          v-model="chatStage"
          optionLabel="title"
          optionValue="id"
          :options="userStore.stages"
          @change="updateChatStage"
        />
      </div>
    </div>
  </Card>
</template>
@/hooks/notify
