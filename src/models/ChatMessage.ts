import type { FileType } from '@/services/chat.service'

export enum MessageStatuses {
  Sent = 1,
  Delivered = 2,
  Read = 3,
  Error = -1,
}
export interface ChatMessage {
  id: number
  echo?: 'client' | 'manager' | 'system'
  actionData?: { color: string; text: string; id: string }[]
  uuid?: string
  messengerId?: number
  author: string
  myMessage: boolean
  datetime: Date
  fileType?: FileType
  status?: MessageStatuses
  fileUrl?: string | null
  text?: string
  transationText?: string
  audio?: string
  duration?: number
  replyTo?: Pick<
    ChatMessage,
    'id' | 'datetime' | 'author' | 'fileType' | 'fileUrl' | 'text'
  >
}
