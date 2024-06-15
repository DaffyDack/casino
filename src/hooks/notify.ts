import { SECOND_MS } from '@/const/time.const'
import { useToast } from 'primevue/usetoast'

export function useNotify() {
  const toast = useToast()

  const notify = (
    messageTitle: string,
    type: 'success' | 'info' | 'warn' | 'error' = 'success',
    { life = 3 * SECOND_MS, messageDetails = '' } = {},
  ) => {
    toast.add({
      severity: type,
      summary: messageTitle,
      detail: messageDetails,
      life,
    })
  }

  return notify
}
