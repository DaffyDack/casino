import type { StageFilter } from '@/models/StageFilter'
import type { Channel, Manager } from '@/stores/chat.store'

export interface LineFilters {
  stages: StageFilter[]
  managers: Manager[]
  channels: Channel[]
  platforms: string[]
  tags: string[]
}
