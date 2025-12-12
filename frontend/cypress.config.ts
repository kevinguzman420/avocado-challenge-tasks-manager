import { defineConfig } from 'cypress'

export default defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
    baseUrl: 'http://localhost:5173', // Assuming the frontend runs on this port
  },
  component: {
    devServer: {
      framework: 'react',
      bundler: 'vite',
    },
  },
})
