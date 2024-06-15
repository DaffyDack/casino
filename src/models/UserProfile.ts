import type { ProfileLine } from '@/models/ProfileLine'

export interface UserProfile {
  id: number
  name: string
  email: string
  avatar?: string
  role?: string
  balance?: number
  lines: ProfileLine[]
  plan: string
  telegram: string
  theme: string
  code: number
  menu: {
    header: string
    pages: {
      icon: string
      label: string
      path: string | null
      link: string | null
    }[]
  }[]
  dunk: {
    hot_dunk_server?: string
  }
  shift: null | {
    date: string
  }
  status: boolean
}
