import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    baseUrl: 'https://request-admin.vercel.app',
    setupNodeEvents(on, config) {
      // implement node event listeners here
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      return config;
    },
    env: {
      TEST_USER_EMAIL: 'jess232016@gmail.com',
      TEST_USER_PASSWORD: 'Lamisma123*',
      // Theme for Cypress Test Runner: 'dark' | 'light' | 'colorblind'
      theme: 'light',
    },
    viewportWidth: 1920,
    viewportHeight: 1080,
    defaultCommandTimeout: 10000,
    video: false,
    screenshotOnRunFailure: true,
    retries: {
      runMode: 1,
      openMode: 0,
    },
    // Handle uncaught exceptions
    experimentalModifyObstructiveThirdPartyCode: true,
  },
});
