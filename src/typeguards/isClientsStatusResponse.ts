import type { ClientsStatusResponse, KanbanData } from '@/models'

export const isClientsStatusResponse = (
  data: KanbanData | ClientsStatusResponse,
): data is ClientsStatusResponse => {
  return 'status' in data && typeof data.status !== 'undefined'
}
