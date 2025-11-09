/// <reference types="vite/client" />

// Viteで定義したグローバル変数の型定義
declare const __APP_VERSION__: string;
declare const __APP_NAME__: string;
declare const __APP_DESCRIPTION__: string;
declare const __APP_AUTHOR__: string;

// 環境変数の型定義
interface ImportMetaEnv {
  readonly VITE_SENTRY_DSN?: string;
  readonly VITE_SUPABASE_URL?: string;
  readonly VITE_SUPABASE_ANON_KEY?: string;
  readonly VITE_STRIPE_PUBLIC_KEY?: string;
  readonly VITE_USE_LEXICAL_EDITOR?: string;
  readonly VITE_ENABLE_CLOUD_SYNC?: string;
  readonly VITE_ENABLE_DEBUG_LOGS?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
