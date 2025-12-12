const { defineConfig } = require('cypress')

module.exports = defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
    baseUrl: 'http://localhost:5173', // Assuming the frontend runs on this port
    supportFile: false, // Disable support file
  },
  component: {
    devServer: {
      framework: 'react',
      bundler: 'vite',
    },
  },
})