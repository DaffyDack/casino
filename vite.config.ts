import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import svgLoader from 'vite-svg-loader'
import checker from 'vite-plugin-checker'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig(({ command }) => {
  const plugins = [
    vue(),
    vueJsx(),
    svgLoader(),
    VitePWA({
      registerType: 'autoUpdate',
      devOptions: {
        enabled: true,
      },
    }),
  ]

  // FIXME: delete when types would be fixed
  if (command !== 'build') {
    plugins.push(checker({ vueTsc: { tsconfigPath: './tsconfig.app.json' } }))
  }

  return {
    // We use only app.json check since node is for configs
    // tsconfig.app.json has allowJs option since we have .js presets
    plugins,
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
        '@icons': fileURLToPath(new URL('./src/assets/icons', import.meta.url)),
      },
    },
    server: {
      host: '0.0.0.0',
    },
  }
})
