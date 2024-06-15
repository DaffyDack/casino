import 'video.js/dist/video-js.css'
window.HELP_IMPROVE_VIDEOJS = false
import VueVideoPlayer from '@videojs-player/vue'
import type { App } from 'vue'

export default function (app: App) {
  app.use(VueVideoPlayer)
}
