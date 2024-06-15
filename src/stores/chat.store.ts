import { reactive, ref, toRaw } from 'vue'
import { defineStore } from 'pinia'
import { type ChatInfo, useChatService } from '@/services/chat.service'
import { useChatSocketService } from '@/services/chat-socket.service'
import { useNotify } from '@/hooks/notify'
import type { ChatMessage } from '@/models'
import { sortChats } from '@/utils/sortChats'

export interface SimpleChat {
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
export const useChatStore = defineStore('chat', () => {
  const chatService = useChatService()
  const chatSocketService = useChatSocketService()

  const chats = ref<Record<number, Chat>>({})
  const tasks = reactive<Record<number, Task[]>>({})
  const notify = useNotify()

  const chatsList = ref<SimpleChat[]>([])
  const archivedList = ref<SimpleChat[]>([])

  let fetchChatPromise = null as Promise<Chat> | null

  function updateChatList(newList: SimpleChat[]) {
    chatsList.value = newList
  }

  function updateArchivedChatList(newList: SimpleChat[]) {
    archivedList.value = newList
  }
  function fetchChat(id: number, { cached = true } = {}) {
    if (cached && (fetchChatPromise ?? chats.value[id])) {
      return fetchChatPromise ?? Promise.resolve(chats.value[id])
    }
    fetchChatPromise = chatService
      .getChat({ client_id: id })
      .then((data) => {
        data = {
          ...data,
          avatar: `${import.meta.env.VITE_APP_DUNKBACK_URL}/${data.avatar}`,
        }
        chats.value[id] = data
        console.log(`Chat #${id}:`, chats.value[id])
        return chats.value[id]
      })
      .finally(() => {
        fetchChatPromise = null
      })
    return fetchChatPromise
  }

  let fetchTasksPomise = null as Promise<Task[]> | null
  function fetchChatTasks(id: number, { cached = true } = {}) {
    if (cached && (fetchTasksPomise ?? tasks[id])) {
      return fetchTasksPomise ?? Promise.resolve(tasks[id])
    }
    fetchTasksPomise = chatService
      .getTasks(id)
      .then((_tasks) => {
        tasks[id] = _tasks.map((task) => ({
          id: task.id,
          dueDate: new Date(task.end_date),
          status: task.status as TaskStatuses,
          author: task.author.id,
          chatId: task.player.id,
          text: task.text,
          assignees: task.users.map((u) => u.id),
        }))

        console.log(`Tasks of chat #${id}:`, tasks[id])
        return tasks[id]
      })
      .finally(() => {
        fetchTasksPomise = null
      })
    return fetchTasksPomise
  }

  // Chat draft messages
  const CHAT_DRAFT_MESSAGES_KEY = 'chat-message-drafts'
  const drafts = ref<Record<number, MessageDraft>>({})

  function restoreDrafts() {
    drafts.value = getStorageData()
  }

  function getStorageData(): Record<number, MessageDraft> {
    const storageRawData = localStorage.getItem(CHAT_DRAFT_MESSAGES_KEY)
    if (storageRawData) {
      try {
        return JSON.parse(storageRawData)
      } catch {
        return {}
      }
    }
    return {}
  }

  function deleteDraftFromStorage(chatId: number) {
    delete drafts.value[chatId]
    const storageData = getStorageData()
    delete storageData[chatId]
    localStorage.setItem(CHAT_DRAFT_MESSAGES_KEY, JSON.stringify(storageData))
  }
  function saveDraftToStorage(chatId: number, draft: MessageDraft) {
    const storageData = getStorageData()
    storageData[chatId] = draft
    localStorage.setItem(CHAT_DRAFT_MESSAGES_KEY, JSON.stringify(storageData))
  }
  // Messages
  const archivedChats = reactive<Record<number, ChatInfo | undefined>>({})
  function setSavedChat(chatId: number, chatInfo: ChatInfo) {
    archivedChats[chatId] = chatInfo
  }
  function emptySavedChats() {
    Object.keys(archivedChats).forEach((chatId) => {
      archivedChats[Number(chatId)] = undefined
    })
  }
  function getOrFetchArchivedChat(chatId: number, { cached = true } = {}) {
    return (
      cached &&
      chatSocketService.getReadyState() === WebSocket.OPEN &&
      archivedChats[chatId]
        ? Promise.resolve(archivedChats[chatId]!)
        : fetchChat(chatId, { cached: false }).then((r) => {
            setSavedChat(chatId, r)
            return toRaw(archivedChats[chatId]!)
          })
    ).then((r) => toRaw(r))
  }

  function createComment(chatId: number, text: string) {
    chatService
      .createComment(chatId, text)
      .then((data) => {
        chats.value = {
          ...chats,
          [chatId]: { ...chats.value[chatId], commentaries: data.commentaries },
        }
        notify('Комментарий добавлен', 'success')
      })
      .catch((e) => {
        notify('Ошибка добавления комментария', 'error')
      })
  }

  function removeComment(chatId: number, id: number) {
    chatService
      .removeComment(id)
      .then((data) => {
        chats.value = {
          ...chats.value,
          [chatId]: { ...chats.value[chatId], commentaries: data.commentaries },
        }
        console.log('=>(chat.store.ts:117) data.comment', data.commentaries)
        notify('Комментарий удален', 'success')
      })
      .catch((e) => {
        console.log('=>(chat.store.ts:119) e', e)
        notify('Ошибка удаления комментария', 'error')
      })
  }

  function updateChatMessage(chatId: number, message: ChatMessage) {
    const chat = chatsList.value.find((v) => v.id === chatId)
    if (!chat || !message.text) return
    chat.lastMessage = message.text
    chat.lastMessageDateTime = message.datetime
    chat.lastMessageStatus = message.status || 1
    chat.newMessages = 0
    chatsList.value = sortChats(chatsList.value)
  }

  chatSocketService.subscribe('message', (message) => {
    if (message.action === 'received' || message.action === 'sended') {
      const savedChat = archivedChats[message.chat]
      if (savedChat) {
        const savedChatMessageList = savedChat.messages
        if (
          savedChatMessageList[savedChatMessageList.length - 1].message_id !==
          message.message_id
        ) {
          archivedChats[message.chat]?.messages.splice(0, 0, message)
        }
      }
    }
  })
  chatSocketService.subscribe('_close', (message) => {
    emptySavedChats()
  })

  return {
    fetchChat,
    fetchChatTasks,
    createComment,
    removeComment,
    saveDraftToStorage,
    deleteDraftFromStorage,
    restoreDrafts,
    updateChatMessage,
    // Draft
    drafts,
    chats,
    archivedList,
    chatsList,
    updateArchivedChatList,
    updateChatList,

    // Messages
    archivedChats,
    getOrFetchArchivedChat,
  }
})

export type Chat = ChatInfo

export interface Task {
  id: number
  dueDate: Date
  status: TaskStatuses
  text: string
  author: number
  chatId: number
  assignees: number[]
}

export interface Channel {
  id: number
  name: string
}

export interface Manager {
  id: number
  name: string
  username: string
}

export interface Platform {
  name: string
}

export interface Stage {
  id: number
  ignore: boolean
  standart: boolean
  title: string
}

export interface MessageDraft {
  text: string
  replyTargetMessageId?: number
  dateTime: string
}

export enum TaskStatuses {
  New = 'new',
  Done = 'done',
}
