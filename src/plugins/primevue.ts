import PrimeVue from 'primevue/config'
import 'primeicons/primeicons.css'
import ToastService from 'primevue/toastservice'
import ConfirmationService from 'primevue/confirmationservice'
import Wind from '@/presets/wind'
import Tooltip from 'primevue/tooltip'
import FocusTrap from 'primevue/focustrap'

// Source: https://github.com/primefaces/primelocale/blob/main/ru.json
import { ru } from '@/locales/primevue_ru.json'

// Primevue FilterService
import { FilterService } from 'primevue/api'
import Fuse from 'fuse.js'
import CyrillicToTranslit from 'cyrillic-to-translit-js'
import type { App } from 'vue'
const cyrillicToTranslit = CyrillicToTranslit()
const fuse = new Fuse([''], { getFn: (item) => item })
FilterService.register(
  'multilanguage-contains',
  (value?: string, filter?: string): boolean => {
    if (filter === undefined || filter === null || filter.trim() === '') {
      return true
    }
    if (value === undefined || value === null) {
      return false
    }

    fuse.setCollection([cyrillicToTranslit.transform(value)])
    return fuse.search(cyrillicToTranslit.transform(filter)).length > 0
  },
)

export default function (app: App) {
  app.use(PrimeVue, { unstyled: true, pt: Wind, locale: ru })
  app.use(ToastService)
  app.use(ConfirmationService)
  app.directive('tooltip', Tooltip)
  app.directive('focustrap', FocusTrap)
}
