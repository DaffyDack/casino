import { i18n } from '@/plugins/i18n'
import { TaskStatuses } from '@/stores/chat.store'

export const TASK_STATUSES = [
  {
    value: TaskStatuses.New,
    label: i18n.global.t('taskStatusNew'),
  },
  {
    value: TaskStatuses.Done,
    label: i18n.global.t('taskStatusDone'),
  },
]
