<script lang="ts" setup>
import IconImage from '@/components/IconImage.vue'
import IconButton from '@/components/form/IconButton.vue'
import IconInputText from '@/components/form/IconInputText.vue'
import { debounce, orderBy } from 'lodash'
import { ref } from 'vue'
import { checkDatesEquality } from '@/utils/datetime.utils'
import { useRouter } from 'vue-router'
import { computed } from 'vue'
import Avatar from '@/components/Avatar.vue'
import Button from '@/components/form/Button.vue'
import Dropdown from '@/components/form/Dropdown.vue'
import { onMounted } from 'vue'
import { onUnmounted } from 'vue'
import ContextMenu from '@/components/form/ContextMenu.vue'
import { reactive } from 'vue'
import Checkbox from '@/components/form/Checkbox.vue'
import { watch } from 'vue'
import Burger from '@/components/form/Burger.vue'
import Modal from '@/components/Modal.vue'
import { useChatService } from '@/services/chat.service'
import { useToast } from 'primevue/usetoast'
import {
  useChatStore,
  type Manager,
  type SimpleChat,
} from '@/stores/chat.store'
import FilterOverlay from './ChatList/FilterOverlay.vue'
import { useNotify } from '@/hooks/notify'
import { useChatSocketService } from '@/services/chat-socket.service'
import { MINUTE_MS } from '@/const/time.const'
import type { ChatFilter } from './ChatList/FilterOverlay.types'
import ConfirmDialog from '@/components/ConfirmDialog.vue'
import { RouteNames } from '@/router'
import { useI18n } from 'vue-i18n'
import type { PropType } from 'vue'
import LoadingBlurred from '@/components/LoadingBlurred.vue'
import { useUserStore } from '@/stores/user.store'
import type { SocketMessage } from '@/models/SocketMessage'
import type { ApiChat } from '@/models'
import { storeToRefs } from 'pinia'
import Spinner from '@/components/Spinner.vue'
import { vOnLongPress } from '@vueuse/components'
import { sortChats } from '@/utils/sortChats'

const props = defineProps({
  readEventBus: {
    type: Array as PropType<((chatId: number) => any)[]>,
  },
})

// Modules
const router = useRouter()
const toast = useToast()
const notify = useNotify()
const chatService = useChatService()
const chatStore = useChatStore()
const userStore = useUserStore()
const chatSocketService = useChatSocketService()
const { t } = useI18n()

// Default chats
const {
  chatsList: chats,
  archivedList: archivedChats,
  drafts,
} = storeToRefs(chatStore)
const archiveCount = ref<number>(0)

const searchChats = ref<boolean>(false)
const openedChatId = computed(() =>
  Number(router.currentRoute.value.query.chat),
)
const folded = defineModel<boolean>('folded')

// eslint-disable-next-line
props.readEventBus?.push((id) => {
  console.log(id)
  const chat = chats.value.find((c) => c.id === id)
  if (chat) {
    chat.newMessages = 0
    chats.value = [...chats.value]
  }
})

// Selection
const chatSelectionMode = ref(false)
const selectedChats = ref<Record<number, boolean>>({})
const selectedChatIds = computed(() =>
  Object.entries(selectedChats.value)
    .filter(([key, value]) => value)
    .map(([key, value]) => +key),
)
const allChatsSelected = computed(() =>
  shownChats.value.every((chat) => selectedChats.value[chat.id]),
)

function finishChatSelection() {
  chatSelectionMode.value = false
  selectedChats.value = {}
}

const keydownListener_finishChatSelection = (e: KeyboardEvent) => {
  if (e.key === 'Escape') {
    finishChatSelection()
  }
}
watch(
  selectedChats,
  () => {
    const values = Object.values(selectedChats.value)
    if (values.length && !values.some((checked) => checked)) {
      finishChatSelection()
    }
  },
  { deep: true },
)

const archiveVisible = ref(false)
const getChat = (id: number) => chats.value.find((chat) => chat.id === id)
const archivation = (archive: boolean) => {
  const chats2handle = findChats(
    (chat) =>
      selectedChats.value[chat.id] || chatContextMenuId.value === chat.id,
  )
  Promise.all(
    chats2handle.map((chat) =>
      chatService.updateChat(chat.id, { archive }).then(() => chat),
    ),
  ).then((data) => {
    data.forEach((chat) => {
      chat.archived = archive
      if (chat.archived) {
        archivedChats.value.unshift(chat)
        chats.value = chats.value.filter((v) => v.id !== chat.id)
        archiveCount.value += 1
      } else {
        chats.value.unshift(chat)
        archivedChats.value = archivedChats.value.filter(
          (v) => v.id !== chat.id,
        )
        archiveCount.value -= 1
      }
    })
    if (archiveVisible.value && !archivedChats.value.length) {
      archiveVisible.value = false
    }
  })
}

// Search
const searchQuery = ref('')
const searchingInChats = computed(() => {
  return searchQuery.value.trim().length > 0
})
const searchFilterDebounce = debounce((ev) => {
  searchChats.value = true
  firstFetch()?.then(() => {
    searchChats.value = false
  })
}, 500)

// Paginator & scrolling
const elChatlistScrollable = ref()

// Fetch
const filtersVisible = ref(false)
const filters = reactive<ChatFilter>({})
const fetchingChats = ref(false)
const chatsInList = ref<Set<number>>(new Set())
let fetchChatsTimeout = 0

const formatDate = (d: Date) => new Intl.DateTimeFormat('en-GB').format(d)

const findChat = (predicate: (chat: Chat) => boolean) => {
  const inChats = chats.value.filter(predicate)
  const inArchive = archivedChats.value.filter(predicate)
  return inChats[0] || inArchive[0]
}

const findChats = (predicate: (chat: Chat) => boolean) => {
  const inChats = chats.value.filter(predicate)
  const inArchive = archivedChats.value.filter(predicate)
  return inChats.length > 0 ? inChats : inArchive
}
const formatFetchParams = () => {
  return {
    search: searchQuery.value.trim() || undefined,
    stage: filters.stages,
    platform: filters.platforms,
    responsible: filters.assignees,
    channel: filters.channels,
    tags: filters.tags?.join(','),
    reg_at: filters.regDate?.map(formatDate).join('-'),
    dep_at: filters.depositDate?.map(formatDate).join('-'),
    message_last_manager: filters.lastManagerMessageDate
      ?.map(formatDate)
      .join('-'),
    message_last_client: filters.lastClientMessageDate
      ?.map(formatDate)
      .join('-'),
    created_at: filters.created?.map(formatDate).join('-'),
  }
}

const convertChat = (chat: ApiChat): Chat => {
  return {
    id: chat.id,
    avatar: `${import.meta.env.VITE_APP_DUNKBACK_URL}/${chat.avatar}`,
    name: chat.first_name,
    lastMessage: chat.message_last__text,
    lastMessageDateTime: new Date(chat.message_last__created_at),
    lastMessageStatus: chat.count_read
      ? MessageStatuses.Unread
      : MessageStatuses.Read,
    newMessages: chat.count_read,
    newEvents: 0,
    archived: chat.archive,
    assignee: userStore.managers?.find(
      (manager) => manager.id === chat.resp__id,
    ),
    stage: chat.stage,
  }
}

const updateChatsInList = () => {
  chatsInList.value = new Set([
    ...chats.value.map((v) => v.id),
    ...archivedChats.value.map((v) => v.id),
  ])
  chats.value = sortChats(chats.value)
  archivedChats.value = sortChats(archivedChats.value)
}

const firstFetch = () => {
  if (fetchingChats.value) return
  const params = { ...formatFetchParams(), maxPage: 1 }
  fetchingChats.value = true
  return Promise.all([
    chatService.getChats(params),
    chatService.getArchivedChats(params),
  ])
    .then(([c, ac]) => {
      chats.value = c.chats.map((v) => convertChat(v))
      archivedChats.value = ac.chats.map((v) => convertChat(v))
      updateChatsInList()
      archiveCount.value = ac.chats_count || 0
    })
    .catch(() => {
      toast.add({ detail: t('chatsReceiveError'), severity: 'error' })
    })
    .finally(() => {
      fetchingChats.value = false
    })
}

const fetchChats = debounce(() => {
  if (fetchingChats.value) return
  clearTimeout(fetchChatsTimeout)
  const params = formatFetchParams()
  fetchChatsTimeout = setTimeout(() => {
    firstFetch()
  }, 8 * MINUTE_MS)
  fetchingChats.value = true

  if (archiveVisible.value) {
    return chatService
      .getArchivesFromN({
        ...params,
        start: archivedChats.value[archivedChats.value.length - 1].id,
      })
      .then((data) => {
        const resultData = data.chats.filter(
          (v) => !chatsInList.value.has(v.id),
        )
        archivedChats.value = [
          ...archivedChats.value,
          ...resultData.map((v) => convertChat(v)),
        ]

        archiveCount.value = data.chats_count || 0
        updateChatsInList()
      })
      .catch(() => {
        toast.add({ detail: t('chatsReceiveError'), severity: 'error' })
      })
      .finally(() => {
        fetchingChats.value = false
      })
  } else {
    return chatService
      .getChatsFromN({
        ...params,
        start: chats.value[chats.value.length - 1].id,
      })
      .then((data) => {
        const resultData = data.chats.filter(
          (v) => !chatsInList.value.has(v.id),
        )
        chats.value = [...chats.value, ...resultData.map((v) => convertChat(v))]
        updateChatsInList()
      })
      .catch(() => {
        toast.add({ detail: t('chatsReceiveError'), severity: 'error' })
      })
      .finally(() => {
        fetchingChats.value = false
      })
  }
}, 200)

function filter() {
  firstFetch()
  filtersVisible.value = false
}

// Funnel change
const funnelStatusOptions = computed(() =>
  userStore.stages?.map((s) => ({
    label: s.title,
    value: +s.id,
  })),
)
const funnelStatusChangeModalVisible = ref(false)
const chatFunnels = ref<ChatFunnel[]>([])
const chatFunnelsStageId = ref<number>()
const chatFunnelsFormChanged = ref(false)
const submittingFunnelChanges = ref(false)

function submitFunnelChanges() {
  submittingFunnelChanges.value = true
  Promise.all(
    chatFunnels.value.map((funnel) =>
      chatService.updateChat(funnel.chatId, {
        stage: chatFunnelsStageId.value,
      }),
    ),
  )
    .then(() => {
      funnelStatusChangeModalVisible.value = false
      chatFunnels.value.forEach((funnel) => {
        chats.value.find((c) => c.id === funnel.chatId)!.stage =
          chatFunnelsStageId.value!
      })
      chatFunnelsStageId.value = undefined
      notify(t('funnelStagesUpdated'), 'success')
    })
    .catch((error) => {
      console.error(error)
      notify(t('funnelStagesUpdateError'), 'error')
    })
    .finally(() => {
      submittingFunnelChanges.value = false
    })
}

watch(funnelStatusChangeModalVisible, (visible) => {
  if (visible) {
    chatFunnelsFormChanged.value = false
  }
})

// Assignee change
const assigneeChangeModalVisible = ref(false)
const chatAssignees = ref<ChatAssignee[]>([])
const chatAssigneeId = ref<number>()
const chatAssigneesFormChanged = ref(false)
const submittingChatAssigneeChanges = ref(false)

function submitChatAssigneeChanges() {
  submittingChatAssigneeChanges.value = true
  Promise.all(
    chatAssignees.value.map((chatAssignee) =>
      chatService.updateChat(chatAssignee.chatId, {
        resp: chatAssigneeId.value,
      }),
    ),
  )
    .then(() => {
      assigneeChangeModalVisible.value = false
      chatAssignees.value.map((chatAssignee) => {
        chats.value.find((c) => c.id === chatAssignee.chatId)!.assignee =
          userStore.managers?.find((m) => m.id === chatAssigneeId.value)
      })
      chatAssigneeId.value = undefined
      notify(t('assigneesUpdated'), 'success')
    })
    .catch((error) => {
      console.error(error)
      notify(t('assigneesUpdateError'), 'error')
    })
    .finally(() => {
      submittingChatAssigneeChanges.value = false
    })
}

watch(assigneeChangeModalVisible, (visible) => {
  if (visible) {
    chatAssigneesFormChanged.value = false
  }
})

// Chat delete
const cd_deleteChat = ref<typeof ConfirmDialog>()
const deleteSelectedChats = () => {
  const contextTargetChatSet = new Set(contextTargetChatIds.value)
  return Promise.all(
    contextTargetChatIds.value.map((id) => chatService.deletePlayer(id)),
  )
    .then(() => {
      notify(t('selectedChatsDeleted'), 'success')
      archivedChats.value = archivedChats.value.filter(
        (chat) => !contextTargetChatSet.has(chat.id),
      )
      chats.value = chats.value.filter(
        (chat) => !contextTargetChatSet.has(chat.id),
      )
      if (contextTargetChatSet.has(openedChatId.value)) {
        router.push({ name: RouteNames.Messenger })
      }
    })
    .catch(() => {
      notify(t('chatsDeletionError'), 'error')
    })
}

// Context menu commands
const chatContextMenuId = ref(-1)
const chatContextMenuEvent = ref()
const contextTargetChatIds = computed(() =>
  chatSelectionMode.value ? selectedChatIds.value : [chatContextMenuId.value],
)
const commands = {
  archive() {
    archivation(true)
  },
  unarchive() {
    archivation(false)
  },
  openChatsInNewTab() {
    for (const chatId of contextTargetChatIds.value) {
      window.open(router.resolve({ query: { chat: chatId } }).href, '_blank')
    }
  },
  changeChatFunnels() {
    funnelStatusChangeModalVisible.value = true
    const contextTargetChats = contextTargetChatIds.value.map(
      (id) => chats.value.find((chat) => chat.id === id)!,
    )
    chatFunnelsStageId.value = undefined
    chatFunnels.value = contextTargetChats.map(
      (chat, index): ChatFunnel => ({
        chatId: chat.id,
        stage: chat.stage,
      }),
    )
  },
  changeChatAssignees() {
    assigneeChangeModalVisible.value = true
    chatAssignees.value = contextTargetChatIds.value.map(
      (chatId, index): ChatAssignee => ({
        chatId,
        assignee: getChat(chatId)?.assignee,
      }),
    )
  },
  read() {
    Promise.all(
      contextTargetChatIds.value.map((chatId) =>
        chatService.readChat({ chat_id: chatId }),
      ),
    )
      .then((ids) => {
        contextTargetChatIds.value.forEach((id) => {
          const chat = chats.value.find((c) => c.id === id)
          if (chat) {
            chat.newMessages = 0
          }
        })
        chats.value = [...chats.value]
        notify(t('selectedChatsRead'), 'success')
      })
      .catch(() => {
        notify(t('chatsReadError'), 'error')
      })
  },
  markUnread() {},
  delete() {
    cd_deleteChat.value?.show()
  },
}

function doCommand(command: keyof typeof commands, ...args: any[]) {
  commands[command]()
  finishChatSelection()
}

// Result
const shownChats = computed<Chat[]>(() => {
  const currentChats = archiveVisible.value ? archivedChats.value : chats.value
  const unreadDraftChats = currentChats.filter(
    (c) => chatStore.drafts[c.id] && !!c.newMessages,
  )
  const readDraftChats = currentChats.filter(
    (c) => chatStore.drafts[c.id] && !c.newMessages,
  )
  const unreadChats = currentChats.filter(
    (c) => !!c.newMessages && !chatStore.drafts[c.id],
  )
  const otherChats = currentChats.filter(
    (c) => !chatStore.drafts[c.id] && !c.newMessages,
  )
  const descDateSort = (a: Chat, b: Chat) =>
    b.lastMessageDateTime.getTime() - a.lastMessageDateTime.getTime()
  return [
    ...unreadDraftChats.sort(descDateSort),
    ...readDraftChats.sort(descDateSort),
    ...unreadChats.sort(descDateSort),
    ...otherChats.sort(descDateSort),
  ]
})

const inifiniteScroll = debounce((e: Event) => {
  const { scrollTop, clientHeight, scrollHeight } = e.target as HTMLElement
  if (!fetchingChats.value && scrollTop + clientHeight >= scrollHeight * 0.8) {
    fetchChats()
  }
}, 300)

// Handlers
onMounted(() => {
  firstFetch()
  document.addEventListener('keydown', keydownListener_finishChatSelection)
  elChatlistScrollable.value?.addEventListener('scroll', inifiniteScroll)
})
onUnmounted(() => {
  document.removeEventListener('keydown', keydownListener_finishChatSelection)
  elChatlistScrollable.value?.removeEventListener('scroll', inifiniteScroll)
  unsubscribeSocket()
})

function onContextMenu(e: any, chat: Chat) {
  chatContextMenuEvent.value = e
  chatContextMenuId.value = chat.id
  if (chatSelectionMode.value) {
    selectedChats.value[chat.id] = true
  }
}

const unsubscribeSocket = chatSocketService.subscribe(
  'message',
  (data: SocketMessage) => {
    const chat = findChat((c) => c.id === data.chat)
    if (data.action === 'error') {
      notify(data.message!, 'error')
      return
    }
    if (chat) {
      if (
        chat.lastMessageDateTime.getTime() <=
        new Date(data.created_at).getTime()
      ) {
        chat.lastMessageDateTime = new Date(data.created_at)
        chat.lastMessage = data.text
        chat.lastMessageStatus = MessageStatuses.Unread
        if (!chat.newMessages || data.echo === 'manager') chat.newMessages = 0
        if (data.echo === 'client') chat.newMessages += 1
        if (chat.archived) {
          archivedChats.value = sortChats(archivedChats.value)
        } else {
          chats.value = sortChats(chats.value)
        }
      }
    } else {
      if (searchingInChats.value) {
        return
      }
      const chatData = {
        id: data.id,
        ...data.player,
        lastMessage: data.text,
        lastMessageDateTime: new Date(data.created_at),
        newMessages: 1,
        avatar: `${import.meta.env.VITE_APP_DUNKBACK_URL}/${data.player.avatar}`,
      }
      if (data.player.archived) {
        archivedChats.value.unshift(chatData)
      } else {
        chats.value.unshift(chatData)
      }
    }
  },
)

const getLastMessageDate = (chat: Chat) => {
  const lastMessageDateTime = drafts.value[chat.id]
    ? new Date(drafts.value[chat.id].dateTime)
    : chat.lastMessageDateTime
  return checkDatesEquality(lastMessageDateTime, new Date())
    ? lastMessageDateTime.toLocaleTimeString(undefined, {
        timeStyle: 'short',
      })
    : lastMessageDateTime.toLocaleDateString()
}

const touchChat = ref<Chat | null>(null)
const contextMenuEvent = ref<Event>()
const onLongPress = () => {
  if (!touchChat.value) return
  chatContextMenuEvent.value = contextMenuEvent.value
  chatContextMenuId.value = touchChat.value.id
  if (chatSelectionMode.value) {
    selectedChats.value[touchChat.value.id] = true
  }
}

const selectChat = (chat: Chat, event: Event) => {
  touchChat.value = chat
  contextMenuEvent.value = event
  return chatSelectionMode.value
    ? (selectedChats.value[chat.id] = !selectedChats.value[chat.id])
    : router.push({ query: { chat: chat.id } })
}
// Types
interface Chat {
  id: number
  avatar: string
  name: string
  lastMessage: string
  lastMessageDateTime: Date
  lastMessageStatus: number
  newMessages?: number
  newEvents?: number
  archived: boolean
  stage: number
  assignee?: Manager
}

enum MessageStatuses {
  Read = 1,
  Unread = 2,
}

interface ChatAssignee {
  chatId: number
  assignee?: Manager
}

interface ChatFunnel {
  chatId: number
  stage: number
}
</script>

<template>
  <div
    class="bg-gray-9 text-white h-full flex flex-col"
    :class="{ 'w-full max-w-96 md:max-w-full': !folded }"
  >
    <!-- search, filters etc -->
    <div :class="{ 'p-5 pb-4': !folded }">
      <!-- search -->
      <div
        v-if="!archiveVisible"
        class="flex justify-center w-full gap-1 relative"
      >
        <template v-if="!folded">
          <IconInputText
            class="grow px-4 !h-11"
            :placeholder="$t('search')"
            icon="search"
            icon-side="left"
            theme="secondary"
            v-model="searchQuery"
            text-color="white"
            :loading="searchChats"
            @keydown="searchFilterDebounce"
          />
          <IconButton
            icon="filter"
            class="p-1 w-11 h-11 bg-gray-8 p-3 text-white"
            :icon-size="20"
            @mousedown.stop="filtersVisible = !filtersVisible"
          />
        </template>
        <!-- Filters overlay -->
        <FilterOverlay
          v-model="filters"
          v-model:visible="filtersVisible"
          :class="[
            {
              'top-16 left-4 min-w-96': folded,
            },
          ]"
          @filter="filter"
        />
      </div>
      <!-- Archived -->
      <div
        v-if="!folded && archivedChats.length"
        :class="[
          'h-9 flex items-center gap-3 px-4 py-1 rounded bg-gray-8 mt-1',
          'cursor-pointer select-none active:opacity-80',
        ]"
        @click="archiveVisible = !archiveVisible"
      >
        <IconImage
          v-if="archiveVisible"
          name="angle-left"
          class="w-2 mr-1 text-white"
        />
        <IconImage name="archive" class="w-4 text-white" />
        <p>
          {{ $t('archivedChats') }}:
          {{ archiveCount }}
        </p>
      </div>
      <!-- Selected -->
      <div
        v-if="!folded && chatSelectionMode"
        :class="[
          'h-9 flex items-center gap-3 px-4 py-1 rounded bg-gray-8 mt-1',
        ]"
      >
        <p>
          {{ $t('selected') }}:
          {{ Object.values(selectedChats).filter((s) => s).length }}
        </p>
        <div class="flex ml-auto gap-3 leading-none">
          <span>{{ $t('selectAll') }}</span>
          <Checkbox
            :alternate-style="true"
            v-model="allChatsSelected"
            @click="
              allChatsSelected
                ? finishChatSelection()
                : shownChats.forEach((chat) => (selectedChats[chat.id] = true))
            "
          />
        </div>
      </div>
    </div>
    <!-- Burger -->
    <div v-if="folded" class="py-3 ml-4">
      <Burger
        :menu-model="[
          {
            label: $t('search'),
            icon: 'pi pi-search',
            command: () => (folded = false),
          },
          {
            label: $t('filters'),
            icon: 'pi pi-filter',
            command: () => (filtersVisible = true),
          },
        ]"
      />
    </div>

    <!-- list -->
    <ul
      class="select-none scrollbar overflow-y-auto grow flex column flex-col p-0"
      ref="elChatlistScrollable"
    >
      <!-- border-t-0 first:border-t-0 border-solid -->
      <li
        v-for="chat in shownChats"
        :key="chat.id"
        class="flex cursor-pointer items-center p-4 relative mr-1 border-b border-b-surface-700 chat-list__item"
        :class="{
          'bg-primary-500':
            (!chatSelectionMode && chat.id === openedChatId) ||
            selectedChats[chat.id],
          'hover:bg-white/5':
            chat.id !== openedChatId && !selectedChats[chat.id],
          'hover:opacity-90': chat.id !== openedChatId && chatSelectionMode,
        }"
        @click="selectChat(chat, $event)"
        @contextmenu="onContextMenu($event, chat)"
        v-on-long-press.prevent="onLongPress"
      >
        <div class="min-w-11 relative" :class="[{ 'w-2/12': !folded }]">
          <Avatar :src="chat.avatar" />

          <!-- new messages count -->
          <span
            v-if="folded && chat.newMessages"
            class="indicator absolute bottom-0 -right-1 bg-red-600"
          >
            {{ chat.newMessages }}
          </span>
          <!-- new events circle -->
          <span
            v-if="folded && chat.newEvents"
            class="indicator bg-green-600 absolute top-0 -right-1"
          >
            {{ chat.newEvents }}
          </span>
        </div>
        <div class="w-10/12 pl-2" :class="[{ hidden: folded }]">
          <div
            class="flex items-center gap-2"
            :class="{ 'w-11/12': chatSelectionMode }"
          >
            <span class="grow font-medium truncate">{{ chat.name }}</span>
            <span
              class="text-sm"
              :class="{
                'text-gray-4':
                  chat.id !== openedChatId && !selectedChats[chat.id],
                'w-20': chatSelectionMode,
              }"
            >
              {{ getLastMessageDate(chat) }}
            </span>
          </div>
          <div class="flex grow gap-2 items-center mt-1">
            <p
              class="text-sm truncate m-0"
              :class="{
                'text-gray-4':
                  chat.id !== openedChatId && !selectedChats[chat.id],
              }"
            >
              <template v-if="drafts[chat.id]?.text">
                <span>{{ $t('draft') }}:</span>
                {{ drafts[chat.id].text }}
              </template>
              <template v-else>
                {{ chat.lastMessage }}
              </template>
            </p>
            <div class="flex gap-1 ml-auto items-center">
              <!-- new events circle -->
              <div v-if="chat.newEvents" class="indicator bg-green-600">
                {{ chat.newEvents }}
              </div>
              <!-- your message is unread/read or new messages count -->
              <div
                class="indicator"
                :class="{
                  'bg-red-600': chat.newMessages,
                  'bg-primary-500':
                    !chat.newMessages && chat.id !== openedChatId,
                  'bg-white':
                    (chat.id === openedChatId || selectedChats[chat.id]) &&
                    !chat.newMessages,
                }"
              >
                <span v-if="chat.newMessages">{{ chat.newMessages }}</span>
                <IconImage
                  v-else
                  :name="
                    chat.lastMessageStatus === 0 ? 'check' : 'check-double'
                  "
                  class="size-4"
                  :class="
                    chat.id !== openedChatId && !selectedChats[chat.id]
                      ? 'text-white'
                      : 'text-primary-500'
                  "
                />
              </div>
            </div>
          </div>
        </div>
        <div
          class="flex items-start justify-end absolute top-5 right-3"
          v-if="chatSelectionMode"
        >
          <Checkbox v-model="selectedChats[chat.id]" :alternate-style="true" />
        </div>
      </li>
      <li class="flex justify-center py-4" v-if="fetchingChats">
        <Spinner />
      </li>
    </ul>

    <!-- Chat context menu -->
    <ContextMenu
      :model="[
        ...(!chatSelectionMode
          ? [
              {
                label: $t('select'),
                icon: 'pi pi-check-circle',
                command: () =>
                  (chatSelectionMode = true) &&
                  (selectedChats[chatContextMenuId] = true),
                disabled: true,
              },
            ]
          : []),
        {
          label: $t('openInNewTab'),
          icon: 'pi pi-directions',
          command: () => doCommand('openChatsInNewTab'),
        },
        archiveVisible
          ? {
              label: $t('unarchive'),
              icon: 'pi pi-book',
              command: () => doCommand('unarchive'),
            }
          : {
              label: $t('archive'),
              icon: 'pi pi-book',
              command: () => doCommand('archive'),
            },
        {
          label: $t('read'),
          icon: 'pi pi-eye',
          command: () => doCommand('read'),
        },
        /*{
        label: $t('markUnread'),
        icon: 'pi pi-eye-slash',
        command: () => doCommand('markUnread'),
      },*/
        {
          label: $t('changeFunnels'),
          icon: 'pi pi-filter',
          command: () => doCommand('changeChatFunnels'),
        },
        {
          label: $t('changeAssignee'),
          icon: 'pi pi-user-edit',
          command: () => doCommand('changeChatAssignees'),
        },
        {
          label: $t('delete'),
          icon: 'pi pi-trash',
          command: () => doCommand('delete'),
        },
      ]"
      :event="chatContextMenuEvent"
    />

    <!-- Funnel modal -->
    <Modal v-model:visible="funnelStatusChangeModalVisible">
      <p class="text-lg font-bold text-gray-1 dark:text-gray-400 mb-4">
        {{ $t('changeFunnels') }}
      </p>
      <table class="w-full">
        <tr
          v-for="chatFunnel in chatFunnels"
          class="mb-2"
          :key="chatFunnel.chatId"
        >
          <td>
            <Avatar
              class="w-11 h-11"
              :src="getChat(chatFunnel.chatId)?.avatar"
            />
          </td>
          <td>
            <p>{{ getChat(chatFunnel.chatId)?.name }}</p>
            <p class="text-sm text-gray-2 line-clamp-1">
              {{ getChat(chatFunnel.chatId)?.lastMessage }}
            </p>
          </td>
          <td>
            {{
              funnelStatusOptions?.find((opt) => opt.value === chatFunnel.stage)
                ?.label
            }}
          </td>
          <td class="text-right">
            <Dropdown
              @change="chatFunnelsFormChanged = true"
              class="ml-auto !w-32"
              v-model="chatFunnelsStageId"
              :options="funnelStatusOptions"
              option-label="label"
              option-value="value"
            />
          </td>
        </tr>
      </table>
      <Button
        :disabled="!chatFunnelsFormChanged"
        :label="$t('save')"
        icon="pi pi-save"
        class="w-full justify-center mt-4"
        @click="submitFunnelChanges()"
      />
    </Modal>

    <!-- Assignee modal -->
    <Modal v-model:visible="assigneeChangeModalVisible">
      <p class="text-lg font-bold text-gray-1 dark:text-gray-400 mb-4">
        {{ $t('changeAssignee') }}
      </p>
      <table class="w-full">
        <tr
          v-for="chatAssignee in chatAssignees"
          class="mb-2"
          :key="chatAssignee.chatId"
        >
          <td>
            <Avatar
              class="w-11 h-11"
              :src="getChat(chatAssignee.chatId)?.avatar"
            />
          </td>
          <td>
            <p>{{ getChat(chatAssignee.chatId)?.name }}</p>
            <p class="text-sm text-gray-2 line-clamp-1">
              {{ getChat(chatAssignee.chatId)?.lastMessage }}
            </p>
          </td>
          <td>
            <p>
              {{ chatAssignee.assignee?.name }}
            </p>
            <p>
              {{ chatAssignee.assignee?.username }}
            </p>
          </td>
          <td>
            <Dropdown
              @change="chatAssigneesFormChanged = true"
              class="!w-32"
              v-model="chatAssigneeId"
              :options="userStore.managers"
              option-label="name"
              option-value="id"
              filter
            />
          </td>
        </tr>
      </table>
      <Button
        :disabled="!chatAssigneesFormChanged"
        :label="$t('save')"
        icon="pi pi-save"
        class="w-full justify-center mt-4"
        @click="submitChatAssigneeChanges()"
      />
    </Modal>

    <!-- Delete modal -->
    <ConfirmDialog
      ref="cd_deleteChat"
      :header="$t('dangerZone')"
      :text="$t('deleteChatsConfirmation')"
      :accept="deleteSelectedChats"
      :accept-attrs="{
        label: $t('delete'),
        severity: 'danger',
      }"
      :cancel-attrs="{
        label: $t('cancel'),
        severity: 'secondary',
        outlined: true,
      }"
    />
  </div>
</template>

<style lang="scss" scoped>
.indicator {
  // rounded-full min-w-5 w-fit px-1 h-5 text-xs flex justify-center items-center leading-none
  @apply rounded-full;
  @apply min-w-5;
  @apply w-fit;
  @apply px-1;
  @apply h-5;
  @apply text-xs;
  @apply flex;
  @apply justify-center;
  @apply items-center;
  @apply leading-none;
}
</style>
@/hooks/notify
