/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />
/// <reference types="svelte" />

declare module 'virtual:pwa-register/svelte' {
  import type { ComponentType } from 'svelte';
  export const RegisterSW: ComponentType;
}

declare module 'virtual:pwa-register' {
  export interface RegisterSWOptions {
    immediate?: boolean;
    onNeedRefresh?: () => void;
    onOfflineReady?: () => void;
  }
  export function registerSW(options?: RegisterSWOptions): () => void;
}