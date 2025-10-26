/// <reference types="vite/client" />

declare namespace NodeJS {
  interface ProcessEnv {
    readonly NODE_ENV: 'development' | 'production' | 'test'
    readonly PUBLIC_URL: string
    readonly REACT_APP_VERSION?: string
    readonly VITE_APP_VERSION?: string
    // 他の環境変数がある場合はここに追加
  }
}

interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string
  readonly NODE_ENV: 'development' | 'production' | 'test'
  // 他のVite環境変数がある場合はここに追加
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}