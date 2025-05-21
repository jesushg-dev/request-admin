import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    baseUrl: 'http://127.0.0.1:3000',
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
    env: {
      TEST_USER_EMAIL: 'jess232016@gmail.com',
      TEST_USER_PASSWORD: 'Lamisma123*',
    },
  },
});
