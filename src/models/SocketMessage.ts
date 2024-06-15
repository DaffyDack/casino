import type { Manager } from '@/stores/chat.store'

export interface SocketMessage {
  id: number
  uuid: string | null
  message?: string
  chat: number
  created_at: string
  text: string
  translate: null
  echo: 'client' | 'manager'
  image: null | string
  message_id: number
  reply: null
  file_type: null
  read: boolean
  author: null | number
  action: 'received' | 'sended' | 'error'
  player: {
    avatar: string
    name: string
    lastMessage: string
    lastMessageDateTime: Date
    lastMessageStatus: number
    newMessages: number
    newEvents: number
    archived: boolean
    stage: number
    assignee: Manager
  }
}
