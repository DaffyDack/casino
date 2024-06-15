import { createI18n } from 'vue-i18n'
import { ru } from '@/locales/ru'
import type { App } from 'vue'

type MessageSchema = typeof ru

export const i18n = createI18n<[MessageSchema], 'ru'>({
  legacy: false,
  globalInjection: true,
  locale: 'ru',
  messages: {
    ru,
  },
})

export default function (app: App) {
  app.use(i18n)
}
