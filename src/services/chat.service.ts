import type { AxiosInstance, AxiosResponse } from 'axios'
import axios from 'axios'
import { useAuthService } from './auth.service'
import { httpService } from '@/services/http.service'
import type { ApiChatResults, UserProfile } from '@/models'
import { makeFormData } from '@/utils/formdata.utils'

interface ChatParams {
  stage?: number[]
  platform?: string[]
  responsible?: string[]
  channel?: number[]
  client_id?: number
  start?: number
  search?: string
  message_filter?: string
  /** Format: "tag1,tag2,tag3". */
  tags?: string
  // dates
  reg_at?: string
  dep_at?: string
  message_last_manager?: string
  message_last_client?: string
  created_at?: string
}

const authService = useAuthService()

class ChatService {
  private static _instance: ChatService

  private _gatewayClient: AxiosInstance
  private _dunbackClient: AxiosInstance
  public dunkBackServer: string = import.meta.env.VITE_APP_DUNKBACK_URL

  private constructor() {
    // Gateway
    this._gatewayClient = httpService
    // Dunkback
    this._dunbackClient = axios.create({
      baseURL: import.meta.env.VITE_APP_DUNKBACK_URL,
    })
    // this._dunbackClient.interceptors.request.use((config) => {
    //   config.headers.Authorization = `${this._token}`
    //   return config
    // })
  }

  setDunkBackUrl(url: string) {
    this.dunkBackServer = url
    this._dunbackClient = axios.create({
      baseURL: url,
    })
  }

  static getInstance(): ChatService {
    if (!ChatService._instance) {
      ChatService._instance = new ChatService()
    }

    return ChatService._instance
  }

  // Chat

  getProfile(): Promise<UserProfile> {
    return this._gatewayClient
      .get<UserProfile>('api/profile/get/')
      .then((response) => {
        if (response.data.dunk.hot_dunk_server) {
          this.setDunkBackUrl(`https://${response.data.dunk.hot_dunk_server}`)
        }
        return response.data
      })
  }

  // TODO: move USER PROFILE TO USER PROFILE STORE
  patchProfile(user: Partial<UserProfile>) {
    return this._gatewayClient
      .patch('/profile/change/', user)
      .then((response) => {
        return response.data
      })
  }

  getChat(params: { client_id: number }): Promise<ChatInfo> {
    return this._gatewayClient
      .get('chat/get/', { params })
      .then((response) => response.data)
  }

  getArchivesFromN(params?: ChatParams) {
    return this._gatewayClient
      .get('chats/get/n/archive/', {
        params,
        paramsSerializer: {
          indexes: null,
        },
      })
      .then((response: AxiosResponse<ApiChatResults>) => response.data)
  }
  getChatsFromN(params?: ChatParams) {
    return this._gatewayClient
      .get('chats/get/n/', {
        params,
        paramsSerializer: {
          indexes: null,
        },
      })
      .then((response: AxiosResponse<ApiChatResults>) => response.data)
  }
  getChats(params?: ChatParams) {
    return this._gatewayClient
      .get('chats/get/', {
        params,
        paramsSerializer: {
          indexes: null,
        },
      })
      .then((response: AxiosResponse<ApiChatResults>) => response.data)
  }

  updateChat(
    chatId: number,
    payload: Partial<{
      archive: boolean
      avatar: string
      stage: number
      tags: string
      resp: number
      playerid: string
      platform: string
      created_at: string
      channel: number
    }>,
  ) {
    return this._gatewayClient.patch(`/api/player/edit/${chatId}/`, payload)
  }

  sendMessage(payload: {
    /** File type. */
    file_type?: FileType
    file?: File
    /** Chat id. Format: 00000000. */
    chat_id: number
    /** Message text. */
    text?: string
    /** Text language. Default: 'NO'. */
    language?: string
    /** Id of replied message. */
    reply?: number
    /** Id of replied message. */
    reply_text?: number
    uuid?: string
  }) {
    ;(payload as any).token = authService.getToken()
    const formData = new FormData()
    for (const [key, value] of Object.entries(payload)) {
      if (value !== undefined) {
        formData.append(key, value instanceof File ? value : value.toString())
      }
    }
    return this._dunbackClient
      .post('message/send/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then((response) => response.data)
  }

  readChat(payload: { chat_id: number }) {
    const formData = new FormData()
    formData.append('chat_id', payload.chat_id.toString())
    return this._dunbackClient.post('message/read/', formData)
  }

  deleteMessage(payload: { chat: number; message: number }) {
    return this._dunbackClient.post(
      'message/remove/',
      makeFormData({ ...payload, token: authService.getToken() }),
    )
  }

  getArchivedChats(params?: ChatParams) {
    return this._gatewayClient
      .get('chats/get/archive/', {
        params,
        paramsSerializer: {
          indexes: null,
        },
      })
      .then((response: AxiosResponse<ApiChatResults>) => response.data)
  }

  changeStage() {}

  // Player

  changePlayerTags() {}

  updatePlayerId() {}

  deletePlayer(id: number) {
    return this._gatewayClient.get(`api/player/remove/${id}/`)
  }

  // Utils

  translate(params: { message_id: number }) {
    return this._gatewayClient.get('message/translate/', { params }).then(
      (
        response: AxiosResponse<{
          text: string
        }>,
      ) => response.data,
    )
  }

  // Tasks

  getTasks(chatId: number) {
    return this._gatewayClient.get(`/api/tasks/list/${chatId}/`).then(
      (
        response: AxiosResponse<{
          tasks: {
            id: number
            end_date: string
            status: string
            text: string
            author: Manager
            player: {
              id: number
              first_name: string
              username: string
            }
            users: Manager[]
          }[]
        }>,
      ) => response.data.tasks,
    )
  }

  addTask(payload: TaskAddPayload) {
    return this._gatewayClient
      .post('/api/tasks/add/', payload)
      .then((response: AxiosResponse<{ id: number }>) => response.data)
  }

  editTask(
    taskId: number,
    payload: {
      /** Текст задачи. */
      text: string
      /** Дедлайн. */
      end_date: string
      /** ID игрока (чата). */
      player: number
      /** ID ответственных. */
      users: number[]
      /** Статус задачи. */
      status: string
    },
  ) {
    return this._gatewayClient
      .patch(`/api/tasks/edit/${taskId}/`, payload)
      .then((response: AxiosResponse<{ id: number }>) => response.data)
  }

  createComment(playerId: number, text: string) {
    const formData = new FormData()
    formData.append('player_id', `${playerId}`)
    formData.append('text', text)

    return this._gatewayClient
      .post('/user/api/commentary/create/', formData)
      .then((response) => response.data)
  }

  removeComment(commentId: number) {
    return this._gatewayClient
      .get(`/user/api/commentary/remove/${commentId}/`)
      .then((response) => response.data)
  }
  deleteTask(taskId: number) {
    return this._gatewayClient.get(`/api/tasks/remove/${taskId}/`)
  }
}

export function useChatService() {
  return ChatService.getInstance()
}

// Types (do not export)

export interface TaskAddPayload {
  /** Текст задачи. */
  text: string
  /** Дедлайн. */
  end_date: string
  /** ID игрока (чата) */
  player: number
  /** ID ответственных. */
  users: number[]
}
export interface ChatInfo {
  commentaries: {
    id: number
    user: {
      id: number
      username: string
    }
    created_on: string
    text: string
  }[]
  avatar: string
  channel: {
    id: number
    title: string
  } | null
  country: string | null
  dep_date: string | null
  deposit_amount: number
  deposit_count: number
  id: number
  line: string
  link_to_deal: string
  messages: Message[]
  name: string
  platform: string | null
  player_id: string | null
  resp: {
    id: number
    username: string
  } | null
  created_at: string
  reg_date: string | null
  reg_link: string
  stage: number
  tags: string[]
  username: string
}

export interface Message {
  author: string
  uuid?: string
  created_at: string
  echo: 'manager' | 'client' | 'system'
  file_type: FileType | null
  id: number
  image: string | null
  message_id: number
  read: boolean
  reply: RepliedMessage | null
  text: string
  translate: string | null
}
export interface RepliedMessage {
  id: number
  echo: 'manager' | 'client'
  created_at: string
  author: string | null
  file_type: FileType | null
  /** File url. */
  image: string | null
  text: string | null
}

interface Manager {
  first_name: string
  id: number
  username: string
}

export type FileType =
  | 'image'
  | 'video'
  | 'audio'
  | 'video_file'
  | 'audio_file'
  | 'image_file'
