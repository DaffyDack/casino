import { httpService } from '@/services/http.service'
import type { ClientsData } from '@/models/ClientsData'
import type {
  ClientsFilters,
  ClientsStage,
  ClientsStatusResponse,
  Player,
  ProfileLine,
} from '@/models'

export interface LineResponse {
  count: number
  line: ClientsData
}
class ClientsService {
  private static _instance: ClientsService

  // Stages
  updatePlayer(playerId: number, payload: Partial<Player>): Promise<any> {
    return httpService.patch(`/api/player/edit/${playerId}/`, payload)
  }

  removePlayer(id: number) {
    return httpService
      .get<ClientsStatusResponse>(`/api/player/remove/${id}/`)
      .then((resp) => resp.data)
  }

  setShift() {
    return httpService.get('/shift/').then((res) => {
      console.log('=>(clients.service.ts:23) res', res)
    })
  }
  createStage(params: { line: number } & Partial<ClientsStage>) {
    return httpService
      .post<LineResponse>('business/api/stage/create/', params)
      .then((res) => res.data)
  }

  removeStage(stageId: number) {
    return httpService
      .delete<
        LineResponse | ClientsStatusResponse
      >(`business/api/stage/remove/${stageId}/`)
      .then((response) => response.data)
  }

  updateStage(stageId: number, data: Partial<ClientsStage>) {
    return httpService
      .patch<LineResponse>(`business/stage/edit/${stageId}/`, data)
      .then((res) => res.data)
  }
  formatDate = (d: Date) => new Intl.DateTimeFormat('en-GB').format(d)

  getLine(
    line: ProfileLine,
    filters: null | ClientsFilters = null,
    max_page: number = 1,
  ): Promise<LineResponse> {
    let params = null
    // TODO: refactor
    if (filters) {
      params = {
        search: filters?.search,
        stage: filters.stages,
        platform: filters.platforms,
        responsible: filters.assignees,
        channel: filters.channels,
        tags: filters.tags?.join(','),
        reg_at: filters.regDate?.map(this.formatDate).join('-'),
        dep_at: filters.depositDate?.map(this.formatDate).join('-'),
        message_last_manager: filters.lastManagerMessageDate
          ?.map(this.formatDate)
          .join('-'),
        message_last_client: filters.lastClientMessageDate
          ?.map(this.formatDate)
          .join('-'),
        created_at: filters.created?.map(this.formatDate).join('-'),
      }
    }
    return httpService
      .get(`players/kanban/get/${line.id}/`, {
        params: { ...params, max_page },
        paramsSerializer: { indexes: null },
      })
      .then((response) => {
        return response.data
      })
  }

  static getInstance(): ClientsService {
    if (!ClientsService._instance) {
      ClientsService._instance = new ClientsService()
    }

    return ClientsService._instance
  }
}

export function useClientsService() {
  return ClientsService.getInstance()
}
