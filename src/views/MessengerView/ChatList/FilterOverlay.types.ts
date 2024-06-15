export interface ChatFilter {
  stages?: number[]
  assignees?: string[]
  channels?: number[]
  platforms?: string[]
  regDate?: Date[]
  created?: Date[]
  lastManagerMessageDate?: Date[]
  lastClientMessageDate?: Date[]
  edgeAssignee?: string
  depositDate?: Date[]
  tags?: string[]
}
