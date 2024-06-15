/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_GATEWAY_URL: string
  readonly VITE_APP_DUNKBACK_URL: string
  // more env variables...
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
