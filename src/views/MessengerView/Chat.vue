<script lang="ts" setup>
import { onUnmounted, reactive } from 'vue'
import { ref } from 'vue'
import {
  checkDatesEquality,
  getHourMinute,
  getMinuteSecond,
} from '@/utils/datetime.utils'
import { onMounted } from 'vue'
import MessageInput from './Chat/MessageInput.vue'
import IconImage from '@/components/IconImage.vue'
import MessengerViewChatInfo from './ChatInfo.vue'
import ContextMenu from '@/components/form/ContextMenu.vue'
import IconButton from '@/components/form/IconButton.vue'
import { watch } from 'vue'
import { useRouter } from 'vue-router'
import {
  useChatService,
  type FileType,
  type Message,
} from '@/services/chat.service'
import { computed } from 'vue'
import { useNotify } from '@/hooks/notify'
import { useClipboard } from '@/hooks/clipboard'
import { useUserStore } from '@/stores/user.store'
import { parseMimeType } from '@/utils/file.utils'
import VideoPlayer from '@/components/media/VideoPlayer.vue'
import AudioPlayer from '@/components/media/AudioPlayer.vue'
import FilePlayer from '@/components/media/FilePlayer.vue'
import { useChatSocketService } from '@/services/chat-socket.service'
import { MINUTE_MS, SECOND_MS } from '@/const/time.const'
import { useDebounceFn } from '@vueuse/core'
import { useChatStore } from '@/stores/chat.store'
import { yieldToMain } from '@/utils/promise.utils'
import { generateShortUuidv4 } from '@/utils/string.utils'
import { useI18n } from 'vue-i18n'
import { storeToRefs } from 'pinia'
import { debounce } from 'lodash'
import { DateTime } from 'luxon'
import LoadingBlurred from '@/components/LoadingBlurred.vue'
import { type ChatMessage, MessageStatuses } from '@/models'

const emit = defineEmits<{
  read: [number]
}>()

// Modules
const router = useRouter()
const chatService = useChatService()
const chatStore = useChatStore()
const clipboard = useClipboard()
const notify = useNotify()
const userStore = useUserStore()
const { user } = storeToRefs(userStore)
const chatSocketService = useChatSocketService()
const { t } = useI18n()

// Chat
const chatId = computed(() => Number(router.currentRoute.value.query.chat))
const chatName = ref('')
const chatMessages = ref<ChatMessage[]>([])
const replyingMessage = ref<ChatMessage>()
const messageInputText = ref('')
const elMessagesScrollable = ref<HTMLElement>()
const scrollChatToBottom = () => {
  elMessagesScrollable.value!.scrollTop =
    elMessagesScrollable.value!.scrollHeight
}
const getMessage = (messageId: number) => {
  return chatMessages.value.find((m) => m.id === messageId)
}

// Fetch messages
let draftRestoreEnabled = true
let noFetchFlag = true
const fetchingMessages = ref(false)
const toLocalMessage = (m: Message): ChatMessage => {
  return {
    id: m.id,
    messengerId: m.message_id,
    text: m.text,
    actionData: m.echo === 'system' ? getActionText(m.text) : [],
    author:
      m.echo === 'manager'
        ? m.author ?? userStore.user?.name ?? t('manager')
        : chatName.value,
    echo: m.echo,
    myMessage: m.echo === 'manager',
    status: m.read ? MessageStatuses.Read : MessageStatuses.Delivered,
    datetime: new Date(m.created_at),
    fileType: m.file_type ?? undefined,
    fileUrl: m.image
      ? `${import.meta.env.VITE_APP_DUNKBACK_URL}/${m.image}`
      : null,
    replyTo: m.reply
      ? {
          id: m.reply.id,
          text: m.reply.text ?? undefined,
          datetime: new Date(m.reply.created_at),
          author:
            m.reply.echo === 'client'
              ? chatName.value
              : m.reply.author ?? userStore.user?.name ?? t('manager'),
          fileType: m.reply.file_type ?? undefined,
          fileUrl: m.reply.image ?? undefined,
        }
      : undefined,
    transationText: m.translate ?? undefined,
  }
}
function fetchMessages({ initial = false, cached = true } = {}) {
  noFetchFlag = false
  fetchingMessages.value = true
  return chatStore
    .getOrFetchArchivedChat(chatId.value, { cached })
    .then((c) => {
      chatName.value = c.name
      chatMessages.value = c.messages.map(toLocalMessage)
      // Draft
      if (draftRestoreEnabled) {
        draftRestoreEnabled = false
        restoreDraft()
      }
      // Scroll
      if (initial) {
        elMessagesScrollable.value!.scrollTop =
          elMessagesScrollable.value!.scrollHeight
      }
    })
    .finally(() => {
      setTimeout(() => {
        fetchingMessages.value = false
      }, 200)
    })
}

// Draft
const draft = computed(() => chatStore.drafts[chatId.value])
function saveDraft() {
  if (messageInputText.value.length) {
    chatStore.saveDraftToStorage(chatId.value, {
      text: messageInputText.value,
      replyTargetMessageId: replyingMessage.value?.id,
      dateTime: new Date().toISOString(),
    })
  } else {
    chatStore.deleteDraftFromStorage(chatId.value)
  }
}
function restoreDraft() {
  messageInputText.value = draft.value?.text ?? ''
  replyingMessage.value = draft.value?.replyTargetMessageId
    ? getMessage(draft.value.replyTargetMessageId)
    : undefined
}

const messageInputCallback = debounce(() => {
  if (!messageInputText.value) {
    chatStore.deleteDraftFromStorage(chatId.value)
  } else {
    saveDraft()
  }
}, 200)

watch(messageInputText, () => {
  messageInputCallback()
})

// Submit message
function submitMessage(
  text: string,
  options?: {
    files?: { format: 'file' | 'type-related'; file: File }[]
    translationLanguage?: string
  },
) {
  // Text sending
  if (text.trim().length) {
    const uuid = generateShortUuidv4()
    const submittingMessage: ChatMessage = reactive({
      id: -Math.round(Math.random() * 1e9 + 2),
      uuid,
      author: `${userStore.user?.name} (${userStore.user?.email})`,
      text,
      myMessage: true,
      datetime: new Date(),
      replyTo: replyingMessage.value,
    })

    chatStore.updateChatMessage(chatId.value, submittingMessage)
    chatMessages.value.unshift(submittingMessage)

    chatService
      .sendMessage({
        chat_id: chatId.value,
        text,
        language: options?.translationLanguage ?? 'NO',
        reply: replyingMessage.value?.messengerId,
        reply_text: replyingMessage.value?.id,
        uuid,
      })
      .then(() => {
        // Check if not error because socket error may come earlier
        if (submittingMessage.status === MessageStatuses.Sent) {
          submittingMessage.status = MessageStatuses.Delivered
        }
      })
      .catch((error) => {
        submittingMessage.status = MessageStatuses.Error
        notify(error.message, 'error')
      })
    replyingMessage.value = undefined
  }

  // Files sending
  if (options?.files?.length) {
    for (const { file, format } of options.files) {
      const fileTypeMap: Record<
        string,
        'image' | 'audio' | 'video' | 'audio_file' | 'video_file'
      > = {
        image: 'image',
        video: 'video',
        audio: 'audio',
      } as const
      chatService.sendMessage({
        chat_id: chatId.value,
        file_type: (fileTypeMap[parseMimeType(file.type).type!] +
          (format === 'file' ? '_file' : '')) as FileType, // TODO: remove "as"
        file: file,
      })
    }
  }

  scrollChatToBottom()
}

// Interval fetch
let refreshMessagesInterval = -1
const enableIntervalFetch = () => {
  clearInterval(refreshMessagesInterval)
  refreshMessagesInterval = setInterval(() => {
    fetchMessages()
  }, 5 * MINUTE_MS)
}
const disableIntervalFetch = () => {
  clearInterval(refreshMessagesInterval)
}

// Socket mode
const socketMode = ref(false)
watch(
  socketMode,
  (socketMode) => {
    if (socketMode) {
      disableIntervalFetch()
    } else {
      enableIntervalFetch()
    }
  },
  { immediate: true },
)

// Context menu
const contextMenuEvent = ref()
const contextMenuMessage = ref<ChatMessage>()

const messageContextMenu = computed(() => {
  return [
    /*{
      label: 'Ответить',
      icon: 'pi pi-reply',
      command: () => (replyingMessage = contextMenuMessage),
    },
    {
      label: 'Перевод (DeepL powered)',
      icon: 'pi pi-language',
      command: () =>
        (contextMenuMessage!.transationText =
          'Типа перевели текст сообщения, бла-бла-бла'),
    },
    { label: 'Вставить ссылку на регистрацию', icon: 'pi pi-link' },
    { label: 'Прочитано', icon: 'pi pi-eye' },*/
    {
      label: t('copy'),
      icon: 'pi pi-copy',
      visible: () => {
        return !!(contextMenuMessage.value && contextMenuMessage.value.text)
      },
      command: () => {
        copyMessageToClipboard(contextMenuMessage.value!)
      },
    },
    {
      label: t('delete'),
      icon: 'pi pi-trash',
      visible: user.value && user.value.role !== 'manager',
      command: () => deleteMessage(contextMenuMessage.value!),
    },
    {
      label: t('copyImage'),
      icon: 'pi pi-image',
      visible: () => {
        return !!(
          contextMenuMessage.value?.fileUrl &&
          contextMenuMessage.value.fileType === 'image'
        )
      },
      command: () => {
        if (contextMenuMessage.value?.fileUrl) {
          copyMessageImageToClipboard(contextMenuMessage.value.fileUrl)
        }
      },
    },
    {
      label: t('openOriginal'),
      icon: 'pi pi-file',
      visible: () => {
        return !!(
          contextMenuMessage.value?.fileUrl &&
          contextMenuMessage.value.fileType === 'image'
        )
      },
      command: () => {
        if (contextMenuMessage.value?.fileUrl) {
          window.open(contextMenuMessage.value.fileUrl, '_blank')
        }
      },
    },
  ]
})
// New events
const newEvents = ref<{ userId: number; details: string }[]>([])

// Transalte
const translatingMessages = reactive<Record<number, boolean>>({})
function translateMessage(message: ChatMessage) {
  translatingMessages[message.id] = true
  return chatService
    .translate({
      message_id: message.id,
    })
    .then(({ text }) => {
      const msg = getMessage(message.id)
      if (msg) msg.transationText = text
    })
    .catch(() => {
      notify(t('translationError'), 'error')
    })
    .finally(() => {
      translatingMessages[message.id] = false
    })
}

// Message context menu commands
function copyMessageToClipboard(message: ChatMessage) {
  if (message.text) {
    clipboard.write(message.text)
  }
}

function copyMessageImageToClipboard(imageUrl: string) {
  clipboard.writeImage(imageUrl)
}

const deletingMessage = ref(false)
function deleteMessage(message: ChatMessage) {
  deletingMessage.value = true
  return chatService
    .deleteMessage({ message: message.id, chat: chatId.value })
    .then((response) => {
      const { data } = response
      if (!data.status) {
        throw Error(data.message)
      }
      notify(t('messageDeleted'), 'success')
      const index = chatMessages.value.findIndex((m) => m.id === message.id)
      if (index !== -1) {
        chatMessages.value.splice(index, 1)
      }
    })
    .catch((err: any) => {
      notify(err.message, 'error')
    })
    .finally(() => {
      deletingMessage.value = false
    })
}

// Mark as read
const markingAsRead = ref(false)
function markAsRead() {
  markingAsRead.value = true
  chatService
    .readChat({ chat_id: chatId.value })
    .then(() => {
      markingAsRead.value = false
      notify(t('chatRead'), 'success')
      emit('read', chatId.value)
    })
    .catch(() => {
      notify(t('chatReadError'), 'error')
    })
}

// ChatId watcher
watch(
  chatId,
  (chatId) => {
    if (!chatId) return
    messageInputText.value = ''
    yieldToMain().then(() => {
      if (noFetchFlag) {
        // Wait for fetch from after socket open before manual fetch
        const SOCKET_CONNECTING_WAIT_TIMEOUT = 1000 as const
        setTimeout(() => {
          if (noFetchFlag) {
            fetchMessages({ cached: false, initial: true })
          }
        }, SOCKET_CONNECTING_WAIT_TIMEOUT)
      } else {
        fetchMessages({ initial: true })
      }
    })
  },
  { immediate: true },
)

// Route change handler
router.beforeEach((to, from) => {
  if (from.name === 'messenger') {
    chatStore.restoreDrafts()
    draftRestoreEnabled = true
  }
})

// Mounted/Unmounted
let unsubscribeSocketMessage: (() => void) | undefined = undefined
let unsubscribeSocketOpen: (() => void) | undefined = undefined
let unsubscribeSocketClose: (() => void) | undefined = undefined
onMounted(() => {
  chatStore.restoreDrafts()
  // Socket subscriptions
  unsubscribeSocketOpen = chatSocketService.subscribe('_open', () => {
    socketMode.value = true
    fetchMessages({ cached: false, initial: true })
  })
  unsubscribeSocketClose = chatSocketService.subscribe('_close', () => {
    socketMode.value = false
    fetchMessages()
  })
  unsubscribeSocketMessage = chatSocketService.subscribe('message', (data) => {
    if (data.chat === chatId.value && chatName.value) {
      const msg = chatMessages.value.findIndex(
        (m) =>
          (data.id && data.id === m.id) ||
          (data.uuid && data.uuid === data.uuid),
      )
      switch (data.action) {
        case 'sended':
        case 'received':
          if (msg !== -1) {
            const messageInValue = chatMessages.value[msg]
            chatMessages.value[msg] = {
              ...messageInValue,
              ...toLocalMessage(data),
            }
          } else {
            chatMessages.value = [toLocalMessage(data), ...chatMessages.value]
          }
          break
        case 'error':
          if (msg) {
            Object.assign(msg, { status: MessageStatuses.Error })
            chatMessages.value = [...chatMessages.value]
          } else {
            console.warn('no message found')
          }
          break
        default:
          console.warn('Unprocessed socket action:', data)
      }
    }
  })
})

/**
 * Returns array of objects for actions
 * @param text
 * text example '#ffffff{TEXT}|#ffffff{TEXT}'
 * where #ffffff is color
 * {TEXT} - text data
 * | - is delimiter
 */
const getActionText = (text: string) => {
  if (!text)
    return [
      {
        color: '#185499',
        text: 'Неизвестное событие',
        id: generateShortUuidv4(),
      },
    ]
  const textSplit = text.split('|')
  const result = []
  const ACTION_TEXT_REGEX = /{.+}/gm

  for (const item of textSplit) {
    let messageText = item.match(ACTION_TEXT_REGEX)?.['0']
    if (!messageText) continue
    const color = item.replace(messageText, '')
    messageText = messageText.replace(/[{}]/gm, '')
    result.push({
      color,
      text: messageText,
      id: generateShortUuidv4(),
    })
  }
  return result
}
onUnmounted(() => {
  clearInterval(refreshMessagesInterval)
  unsubscribeSocketMessage && unsubscribeSocketMessage()
  unsubscribeSocketOpen && unsubscribeSocketOpen()
  unsubscribeSocketClose && unsubscribeSocketClose()
})

// Types
</script>

<template>
  <div
    class="relative flex bg-gray-7 dark:bg-surface-850 w-full h-full p-5 pr-0 pl-9 chat-list"
  >
    <LoadingBlurred
      class="top-0 left-0 z-50"
      :text="$t('loading')"
      v-if="fetchingMessages"
      theme-adaptive
    />
    <!-- Chat dialog -->
    <div class="grow flex flex-col justify-end">
      <!-- Chat messages -->
      <ul
        ref="elMessagesScrollable"
        class="overflow-y-auto scrollbar pr-4 scrollbar-alternative dark:scrollbar-alternative list-none flex flex-col-reverse h-full chat-list__messages"
      >
        <template v-for="(message, index) in chatMessages" :key="message.id">
          <li
            v-if="message.echo === 'system'"
            class="flex justify-center mt-4 w-full gap-1"
          >
            <span class="text-gray-400 text-sm">
              {{
                DateTime.fromISO(message.datetime.toISOString()).toFormat(
                  'dd.MM.yyyy',
                )
              }}
            </span>
            <span class="text-gray-400 dark:text-white text-sm">
              {{ message.author }}
            </span>
            <span
              v-for="item in message.actionData"
              :style="{ color: item.color }"
              class="text-sm"
              :key="item.id"
            >
              {{ item.text }}
            </span>
          </li>
          <li
            v-else
            class="mt-4 w-fit min-w-44 max-w-4/6 rounded relative message"
            :class="{
              'pl-20 ml-auto': message.myMessage,
              'pr-20': !message.myMessage,
            }"
          >
            <!--  Message info header -->
            <div class="flex items-end gap-2">
              <span
                class="grow text-gray-1 dark:text-white/80 font-medium mr-2"
                >{{ message.author }}</span
              >
              <span class="text-sm text-gray-1 dark:text-gray-4">{{
                getHourMinute(message.datetime)
              }}</span>
              <IconImage
                v-if="
                  message.myMessage &&
                  message.status === MessageStatuses.Delivered
                "
                name="check"
                class="border-solid border border-gray-6 text-gray-6 rounded-full w-5"
              />
              <IconImage
                v-if="
                  message.myMessage && message.status === MessageStatuses.Read
                "
                name="check-double"
                class="border-solid rounded-full w-5 bg-primary-500 text-white"
              />
              <!-- <IconImage
              v-if="message.myMessage && message.status === 2"
              name="check-double"
              class="bg-primary-500 rounded-full w-5"
              hex-color="#ffffff"
            /> -->
              <IconImage
                v-if="
                  message.myMessage && message.status === MessageStatuses.Error
                "
                name="warning"
                class="w-5 text-red-600"
              />
            </div>
            <!-- Message contents -->
            <div
              class="py-4 rounded mt-1 relative message__content"
              :class="{
                'bg-primary-500 text-gray-3': message.myMessage,
                'bg-white dark:bg-surface-800 dark:border-surface-700 text-gray-400 border border-gray-6 ':
                  !message.myMessage,
              }"
              @contextmenu="
                (contextMenuEvent = $event) && (contextMenuMessage = message)
              "
            >
              <!-- Replied message -->
              <div
                v-if="message.replyTo"
                :class="[
                  'rounded p-2 mb-2 mx-4 whitespace-pre-line',
                  message.myMessage ? 'bg-white' : 'bg-primary-500 text-white',
                ]"
              >
                <p :class="[message.myMessage ? 'text-gray-1' : 'text-white']">
                  {{ message.replyTo.author }}
                </p>
                <p
                  :class="[
                    'line-clamp-5',
                    message.myMessage ? 'text-gray-2' : 'text-white',
                  ]"
                >
                  {{ message.replyTo.text }}
                </p>
              </div>
              <!-- User text message -->
              <div v-if="!message.fileType" class="mx-4 whitespace-pre-line">
                <p v-if="message.text" class="break-all">
                  {{ message.text }}
                </p>
                <div v-else-if="message.audio" class="flex gap-4">
                  <IconButton icon="play" class="shrink-0" />
                  <div>
                    <img
                      src="@/assets/img/waveform.svg"
                      class="object-cover object-left h-full"
                    />
                  </div>
                  <div>
                    {{ getMinuteSecond(message.duration || 0) }}
                  </div>
                </div>
              </div>
              <template v-else-if="message.fileUrl">
                <!-- Image message -->
                <div
                  v-if="message.fileType === 'image'"
                  class="mx-4 chat-image"
                >
                  <img :src="message.fileUrl" class="max-w-96 md:max-w-72" />
                </div>
                <!-- Video message -->
                <div
                  v-else-if="message.fileType === 'video'"
                  class="mx-4 md:max-w-72"
                >
                  <VideoPlayer
                    :src="message.fileUrl"
                    :width="240"
                    :height="198"
                  />
                </div>
                <!-- Audio message -->
                <div
                  v-else-if="message.fileType === 'audio'"
                  class="mx-4 md:max-w-72"
                >
                  <AudioPlayer :src="message.fileUrl" :width="240" />
                </div>
                <!-- File message -->
                <div v-else class="mx-4 max-w-72">
                  <FilePlayer :src="message.fileUrl" class="max-w-72 p-0" />
                </div>
              </template>
              <!-- Translation -->
              <div
                v-if="message.transationText"
                :class="[
                  'border-t  mt-4 pt-1 px-4',
                  message.myMessage ? 'border-white/10' : 'border-black/10',
                ]"
              >
                <p class="font-medium text-sm">
                  <IconImage
                    :class="[
                      '-translate-y-px h-3',
                      message.myMessage ? 'text-white' : 'text-black',
                    ]"
                    name="lang-translator"
                  />
                  {{ $t('translation') }}:
                </p>
                <p class="break-all whitespace-pre-line">
                  {{ message.transationText }}
                </p>
              </div>
              <!-- Message sidebar -->
              <div
                :class="[
                  'flex flex-col gap-2 absolute bottom-0 mx-2',
                  message.myMessage ? 'right-full' : 'left-full',
                ]"
              >
                <IconButton
                  v-if="
                    !message.transationText &&
                    !message.fileType &&
                    !message.myMessage
                  "
                  :disabled="translatingMessages[message.id]"
                  :loading="translatingMessages[message.id]"
                  icon="lang-translator"
                  class="w-5 text-gray-4"
                  :class="[{ 'opacity-40': translatingMessages[message.id] }]"
                  @click="translateMessage(message)"
                />
                <IconButton
                  v-if="message.id > 0"
                  icon="reply"
                  class="w-5 text-gray-4"
                  @click="replyingMessage = message"
                />
              </div>
            </div>
          </li>
          <li
            v-if="
              index === chatMessages.length - 1 ||
              !checkDatesEquality(
                message.datetime,
                chatMessages[index + 1].datetime,
              )
            "
            class="text-white border-t border-gray-300 dark:border-gray-600 flex justify-center mt-10"
          >
            <div
              class="bg-white dark:bg-surface-700 border border-gray-300 dark:border-gray-600 text-gray-400 py-px px-2 rounded-lg -mt-3.5 text-sm"
            >
              {{ message.datetime.toLocaleDateString() }}
            </div>
          </li>
        </template>
      </ul>
      <ContextMenu :event="contextMenuEvent" :model="messageContextMenu" />
      <!-- Input -->
      <div
        class="chat-input"
        :class="['mt-5 mr-1 -mb-5 -ml-9', 'pt-4 pr-4 pb-5 pl-9']"
      >
        <!-- Replying message -->
        <div
          v-if="replyingMessage"
          :class="[
            'mb-1 border border-gray-6 dark:border-surface-700 p-2 rounded',
            replyingMessage.myMessage
              ? 'bg-primary-500 text-white'
              : 'bg-white dark:bg-surface-800 text-gray-1 dark:text-white/80',
          ]"
        >
          <div :class="['flex items-center gap-2']">
            <IconImage name="reply" :class="['w-3']" />
            <span class="text-xs font-medium dark:text-white/80"
              >{{ $t('reply') }} {{ replyingMessage.author }}
            </span>
            <IconButton
              icon="cross"
              :hex-color="replyingMessage.myMessage ? '#fff' : '#171923'"
              class="w-4 ml-auto"
              @click="replyingMessage = undefined"
            />
          </div>
          <div :class="['w-11/12 line-clamp1 opacity-60']">
            <p class="line-clamp-1" v-if="replyingMessage.text">
              {{ replyingMessage.text }}
            </p>
            <p v-else-if="replyingMessage.audio">
              {{ $t('audio').toLowerCase() }}
            </p>
          </div>
        </div>
        <!-- INPUT -->
        <MessageInput
          class="chat-input__input"
          :translator="true"
          :read="true"
          :attachments="true"
          :emoji="true"
          :send="true"
          @read="markAsRead"
          @submit="submitMessage"
          v-model="messageInputText"
        />
      </div>
    </div>
    <!-- Chat info -->
    <MessengerViewChatInfo
      :class="['md:absolute md:top-0 md:right-0', 'shrink-0']"
      :chat-id="chatId"
    />

    <!-- New events modal -->
    <!-- <Modal v-model:visible="newEventsModalVisible">
      <ul>
        <li
          v-for="event in newEvents"
          class="flex gap-3 border-b border-gray-6 mb-4 pb-4"
        >
          <Avatar :src="users[event.userId].avatar" />
          <div>
            <p class="font-medium">{{ users[event.userId].name }}</p>
            <p class="text-sm text-gray-2">{{ event.details }}</p>
          </div>
        </li>
      </ul>
      <Button
        label="OK"
        icon="pi pi-check"
        class="w-full justify-center font"
        @click="newEventsModalVisible = false"
      />
    </Modal> -->
  </div>
</template>

<style lang="scss" scoped>
@media screen and (max-width: 400px) {
  .message {
    max-width: 280px;
    &__content {
      padding: 5px 3px 3px 5px;
    }
  }

  .chat-list {
    padding: 0;
    overflow-x: hidden;
    &__messages {
      padding: 0 5px 20px;
      margin: 0;
      width: 100%;
      min-width: 100%;
      overflow-x: hidden;
    }
  }

  .chat-input {
    width: 100%;
    min-width: 100%;
    padding: 0;
    margin: 0;
    &__input {
      width: 100%;
    }
  }
  .chat-image {
    max-width: 280px;
    margin: 0;
    & img {
      width: 100%;
    }
  }
}
</style>
@/hooks/clipboard @/hooks/notify
