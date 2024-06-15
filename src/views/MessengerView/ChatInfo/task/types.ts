import type { TaskStatuses } from '@/stores/chat.store'

export interface TaskCardCreateEvent {
  value: TaskCardTask
}

export interface TaskCardEditEvent {
  value: TaskCardTask
}

export interface TaskCardTask {
  id: number
  chatId: number
  text: string
  dueDate: Date
  assignees: number[]
  status: TaskStatuses
}
