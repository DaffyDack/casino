export interface Player {
  id: number
  username: string
  name: string
  avatar: string
  deposit_amount: number
  deposit_count: number
  platform: string | null
  reg_link: string
  stage: number
  first_name: string
  order: number | null
  resp: {
    id: number
    username: string
    first_name: string
  } | null
  // Tags via ,
  tags: string
  reg_date: string | null
  dep_date: string | null
  channel: {
    id: number
    title: string
  } | null
  line: string
  country: string | null
  archive: boolean
  created_at: string
}

export interface ExpandedClientsPlayer extends Player {
  playerStageIndex: number
  createdDateText: string
}
