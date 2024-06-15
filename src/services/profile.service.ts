import { httpService } from '@/services/http.service'
import type {
  ChannelsModel,
  FinanceTransaction,
  ManagerModel,
  Shift,
} from '@/models'

class ProfileService {
  private static _instance: ProfileService

  getStages(): Promise<
    {
      id: number
      ignore: boolean
      standart: boolean
      title: string
      robots: {
        id: number
        if_condition: string
        line_to_id: string
        message: string | null
        then_condition: string
      }[]
    }[]
  > {
    return httpService.get('api/stages/get/').then((response) => response.data)
  }

  getFilters(): Promise<{
    channels: ChannelsModel[]
    platforms: string[]
    responsible: ManagerModel[]
  }> {
    return httpService.get('api/filters/get/').then((response) => response.data)
  }

  getFinanceList() {
    return httpService
      .get<{ transactions: FinanceTransaction[] }>('/profile/finance/list/')
      .then((response) => response.data.transactions)
  }

  createPayment(amount: number) {
    return httpService
      .get<{ url: string }>('/profile/create/payment/', { params: { amount } })
      .then((res) => {
        return res.data
      })
  }

  updateCode() {
    return httpService
      .get<{ code: number }>('/profile/code/update/')
      .then((response) => {
        return response.data
      })
  }

  getShiftsList() {
    return httpService
      .get<{ shifts: Shift[] }>('/profile/shift/list/')
      .then((response) => {
        return response.data
      })
  }

  closeShift(shiftId: number) {
    return httpService.get(`/profile/shift/${shiftId}/disable/`)
  }

  static getInstance(): ProfileService {
    if (!ProfileService._instance) {
      ProfileService._instance = new ProfileService()
    }

    return ProfileService._instance
  }
}

export function useProfileService() {
  return ProfileService.getInstance()
}
