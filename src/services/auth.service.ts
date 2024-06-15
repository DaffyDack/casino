import axios, { type AxiosInstance, type AxiosResponse } from 'axios'
import { httpService } from '@/services/http.service'

const TOKEN_KEY = 'mvp_access_token'

export class AuthService {
  private static _instance: AuthService

  private _token = localStorage.getItem(TOKEN_KEY) ?? ''

  private _gatewayClient: AxiosInstance

  private constructor() {
    this._gatewayClient = httpService
    const token = new URLSearchParams(location.search).get('token')
    if (token) {
      this.setToken(token)
    }
  }

  static getInstance(): AuthService {
    if (!AuthService._instance) {
      AuthService._instance = new AuthService()
    }
    return AuthService._instance
  }

  getToken() {
    return this._token
  }

  setToken(token: string) {
    this._token = token
    localStorage.setItem(TOKEN_KEY, token)
  }

  clearToken() {
    this._token = ''
    localStorage.removeItem(TOKEN_KEY)
  }

  login(payload: { username: string; password: string }) {
    return this._gatewayClient.post('api/user/login/', payload).then(
      (
        response: AxiosResponse<{
          id: number
          name: string
          email: string
          token: string
        }>,
      ) => {
        this.setToken(response.data.token)
        return response.data
      },
    )
  }

  logout() {
    this.clearToken()
    return Promise.resolve()
  }
}

export function useAuthService() {
  return AuthService.getInstance()
}
