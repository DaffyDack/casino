import { MINUTE_MS, SECOND_MS } from '@/const/time.const'
import { type Message, useChatService } from './chat.service'
import { useAuthService } from './auth.service'

const authService = useAuthService()

class ChatSocketService {
  private static _instance: ChatSocketService

  private _socket: WebSocket | null = null

  private _subscribers: Record<EventType, ((data: any) => void)[]> = {
    message: [],
    _error: [],
    _open: [],
    _close: [],
    _idlein: [],
    _idleout: [],
  }

  private constructor() {
    // Init
    const dunkServer = useChatService().dunkBackServer
    const url = `${dunkServer.replace('https', 'wss')}/ws/${authService.getToken()}`
    let openSocketOnClose = false
    const isSocketClosed = () => {
      return (
        this._socket === null ||
        this._socket?.readyState === WebSocket.CLOSED ||
        this._socket?.readyState === WebSocket.CLOSING
      )
    }
    const openSocket = () => {
      console.log('Opening socket...')
      this._socket?.close()
      this._socket = null // вроде бы удаляет предыдущий экземпляр сокета
      this._socket = new WebSocket(url)

      // Event handlers
      this._socket.onopen = (e) => {
        console.log('Connected to the socket')
        this._notifySubscribers('_open', e)
      }
      this._socket.onclose = (e) => {
        console.log('Socket closed')
        this._notifySubscribers('_close', e)
        // For reopenSocket function.
        if (openSocketOnClose) {
          openSocket()
        }
      }
      this._socket.onerror = (error) => {
        console.error('Socket error:', error)
        this._notifySubscribers('_error', error)
        // Reopening in few seconds.
        const TIMEOUT_S = 5 as const
        console.log(`Trying to reopen socket in ${TIMEOUT_S} seconds...`)
        setTimeout(() => {
          reopenSocket()
        }, TIMEOUT_S * SECOND_MS)
      }
      this._socket.onmessage = (e: MessageEvent<string>) => {
        console.log('Socket message:', e)
        const data = JSON.parse(e.data) as {
          event: EventType
          data: any
        }
        this._notifySubscribers(data.event, data.data)
      }
    }
    const closeSoket = () => {
      console.log('Closing socket...')
      this._socket?.close()
      this._socket = null
    }
    const reopenSocket = () => {
      console.log('Reopening socket...')
      if (!isSocketClosed()) {
        this._socket?.close()
        openSocketOnClose = true
      } else {
        openSocket()
      }
    }

    // Listeners

    // Window idle handling
    let idleTimeout = 0
    let idle = false
    const startIdleTimer = () => {
      const TIMEOUT_M = 5 as const
      idleTimeout = setTimeout(() => {
        idle = true
        this._notifySubscribers('_idlein', null)
        closeSoket()
      }, TIMEOUT_M * MINUTE_MS)
    }
    if (!window.document.hasFocus()) {
      startIdleTimer()
    }
    window.addEventListener('blur', () => {
      console.log('Window blured')
      startIdleTimer()
    })
    window.addEventListener('focus', () => {
      console.log('Window focused')
      if (idle) {
        idle = false
        this._notifySubscribers('_idleout', null)
        if (isSocketClosed()) {
          openSocket()
        }
      } else {
        clearTimeout(idleTimeout)
      }
    })

    //
    openSocket()
  }

  static getInstance(): ChatSocketService {
    if (!ChatSocketService._instance) {
      ChatSocketService._instance = new ChatSocketService()
    }

    return ChatSocketService._instance
  }

  private _notifySubscribers(event: EventType, data: any) {
    if (event in this._subscribers) {
      for (const callback of this._subscribers[event]) {
        callback(data)
      }
    }
  }

  subscribe(e: EventType, cb: (data: any) => void): () => void
  subscribe(e: 'message', cb: (data: MessageEventData) => void): () => void
  subscribe(e: EventType, cb: (data: any) => void): () => void {
    this._subscribers[e].push(cb)
    return () => {
      this._subscribers[e] = this._subscribers[e].filter((cb) => cb !== cb)
    }
  }

  getReadyState() {
    return this._socket?.readyState ?? WebSocket.CLOSED
  }
}

export function useChatSocketService() {
  return ChatSocketService.getInstance()
}

type EventType =
  | 'message'
  | '_error'
  | '_open'
  | '_close'
  | '_idlein'
  | '_idleout'

interface MessageEventData extends Message {
  action: 'sended' | 'received' | 'error'
  chat: number
  message?: string
}
