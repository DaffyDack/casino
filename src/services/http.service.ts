import axios, { type AxiosError } from 'axios'
import { AuthService } from './auth.service'
import router, { RouteNames } from '@/router'

export const httpService = axios.create({
  baseURL: import.meta.env.VITE_APP_GATEWAY_URL,
})

httpService.interceptors.request.use((config) => {
  config.headers.Authorization = AuthService.getInstance().getToken()
  return config
})

httpService.interceptors.response.use(null, (error: AxiosError) => {
  // TODO: replace 403 with 401
  /**
   * Since 401 is used for UNAUTHORIZED and 403 is used for "NO ACCESS" (like admin panel and etc)
   * Attempt to change data, instances and other, u don't have any rights to change/access
   */
  if (error.response && error.response.status === 403) {
    // Go to login page
    // TODO: add refresh token logic
    return router.push({ name: RouteNames.Login })
  }
})
