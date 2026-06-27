// @ts-check
import {defineConfig} from 'astro/config'
import tailwindcss from '@tailwindcss/vite'
import {fileURLToPath} from 'url'
import path from 'path'
import {loadEnv} from 'vite'
import sanity from '@sanity/astro'

const __dirname = fileURLToPath(new URL('.', import.meta.url))

const {PUBLIC_SANITY_PROJECT_ID, PUBLIC_SANITY_DATASET} = loadEnv(
  process.env.NODE_ENV ?? 'development',
  process.cwd(),
  '',
)

export default defineConfig({
  i18n: {
    defaultLocale: 'es',
    locales: ['es', 'en'],
  },
  integrations: [
    sanity({
      projectId: PUBLIC_SANITY_PROJECT_ID,
      dataset: PUBLIC_SANITY_DATASET,
      apiVersion: '2025-01-01',
      useCdn: false,
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
      },
    },
  },
})
