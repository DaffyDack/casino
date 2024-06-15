import App from './App.vue'
import { createApp, type App as AppType } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import { plugin as VueTippy } from 'vue-tippy'
import 'tippy.js/dist/tippy.css'

const app = createApp(App)
app.use(createPinia())
app.use(router)

app.use(
  VueTippy,
  // optional
  {
    directive: 'tippy', // => v-tippy
    component: 'tippy', // => <tippy/>
    componentSingleton: 'tippy-singleton', // => <tippy-singleton/>,
    defaultProps: {
      placement: 'top',
      allowHTML: true,
    }, // => Global default options * see all props
  },
)

app.directive('ifdev', {
  mounted(el) {
    if (!import.meta.env.DEV) {
      el.parentElement.removeChild(el)
    }
  },
})

import installI18n from './plugins/i18n'
installI18n(app)

import installPrimevue from './plugins/primevue'
installPrimevue(app)

import installVideojs from './plugins/videojs'
installVideojs(app)

// import Vue3TouchEvents from 'vue3-touch-events'
// app.use(Vue3TouchEvents)

import 'vue3-emoji-picker/css'

import './assets/styles/main.scss'

// Register icons globally
const importIconComponents = import.meta.glob('./assets/icons/*.svg')
export const registerComponents = async (
  app: AppType<Element>,
): Promise<void> => {
  const componentConfigs = await Promise.all(
    Object.keys(importIconComponents).map((fileName) =>
      importIconComponents[fileName]().then((config) => ({ fileName, config })),
    ),
  )
  for (const { config, fileName } of componentConfigs) {
    const componentName = ('icon-' +
      fileName
        .split('/')
        .pop()
        ?.replace(/\.\w+$/, '')) as string

    app.component(componentName, (config as any)?.default)
  }
}
registerComponents(app).finally(() => {
  app.mount('#app')
})
