import { DateTime } from 'luxon'
import { defineStore } from 'pinia'
import { useProfileService } from '@/services/profile.service'
import { ref } from 'vue'
import type { FinanceTransaction, Shift } from '@/models'

export const useProfileStore = defineStore('profile', () => {
  const profileService = useProfileService()
  const financeList = ref<FinanceTransaction[]>([])
  const shiftList = ref<Array<Shift & { textDate: string }>>([])
  const getFinanceList = () => {
    profileService.getFinanceList().then((data) => (financeList.value = data))
  }

  const getShiftsList = () => {
    profileService.getShiftsList().then((data) => {
      const resultShifts = []
      for (const shift of data.shifts) {
        resultShifts.push({
          ...shift,
          textDate: DateTime.fromISO(shift.start_at).toFormat(
            'LLL dd, yyyy - HH:mm',
            { locale: 'ru' },
          ),
        })
      }
      shiftList.value = resultShifts
    })
  }

  return {
    financeList,
    shiftList,
    getFinanceList,
    getShiftsList,
  }
})
