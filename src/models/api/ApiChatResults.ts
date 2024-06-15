export interface ApiChatResults {
  chats: {
    avatar: string
    count_read: number
    first_name: string
    id: number
    message_last__created_at: string
    message_last__text: string
    archive: boolean
    stage: number
    line: number
    resp__id: number | null
  }[]
  pages_count: number
  chats_count?: number
}
