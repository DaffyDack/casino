import type { SimpleChat } from '@/stores/chat.store'
import { orderBy } from 'lodash'

export const sortChats = (chats: SimpleChat[]) => {
  const withMessagesArray = []
  const withoutMessagesArray = []
  for (const item of chats) {
    if (item.newMessages && item.newMessages > 0) {
      withMessagesArray.push(item)
    } else {
      withoutMessagesArray.push(item)
    }
  }
  return [
    ...orderBy(withMessagesArray, ['date'], ['asc']),
    ...orderBy(withoutMessagesArray, ['date'], ['asc']),
  ]
}
