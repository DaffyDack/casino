import type { ChatFilter } from '@/views/MessengerView/ChatList/FilterOverlay.types'

export interface ClientsFilters extends ChatFilter {
  search?: string
}
