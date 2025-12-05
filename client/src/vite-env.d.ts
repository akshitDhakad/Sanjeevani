/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE: string;
  readonly VITE_ENV: string;
  readonly VITE_ENABLE_TELECONSULT: string;
  readonly VITE_ENABLE_IOT_MONITORING: string;
  readonly VITE_ANALYTICS_ENABLED: string;
  readonly VITE_ANALYTICS_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

