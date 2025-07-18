// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-05-15',
  devtools: { enabled: true },
  ssr: false,
  css: ['~/assets/css/main.css'],
  modules: ['@nuxt/ui'],
  ui: {
    colorMode: false
  },
  runtimeConfig: {
    public: {
      tileBaseUrl: process.env.TILE_BASE_URL
    }
  },
  nitro: {
    devProxy: {
      "/tiles": 'http://localhost:3001/tiles'
    }
  }
})