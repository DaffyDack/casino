import { type Player } from './Player'

export interface ClientsStage {
  id: number
  title?: string
  color: string
  default: boolean
  ignore: boolean
  archive: boolean
  order?: null | number
  players: Player[]
  robots: string
}
