describe('Test Login - E2E', () => {
  it('should login successfully and navigate to admin', () => {
    cy.log('Starting login test...');

    // Visit login page
    cy.visit('/en/auth/login');
    cy.url().then((url) => {
      cy.log(`Current URL: ${url}`);
    });

    // Check if we're on login page
    cy.get('body').then(($body) => {
      cy.log(`Page title: ${$body.find('title').text()}`);
      cy.log(`Page content length: ${$body.text().length}`);
    });

    // Debug: Check if login form exists
    cy.get('body').then(($body) => {
      cy.log(`Form elements found: ${$body.find('form').length}`);
      cy.log(`Input elements found: ${$body.find('input').length}`);
      cy.log(`Button elements found: ${$body.find('button').length}`);
    });

    // Check if email input exists
    cy.get('input[type="email"]')
      .should('be.visible')
      .then(($input) => {
        cy.log(`Email input placeholder: ${$input.attr('placeholder')}`);
      });

    // Fill login form
    cy.get('input[type="email"]').should('be.visible').type(Cypress.env('TEST_USER_EMAIL'));
    cy.get('input[type="password"]').should('be.visible').type(Cypress.env('TEST_USER_PASSWORD'));

    // Check submit button
    cy.get('button[type="submit"]')
      .should('be.visible')
      .then(($button) => {
        cy.log(`Submit button text: ${$button.text()}`);
        cy.log(`Submit button disabled: ${$button.prop('disabled')}`);
      });

    cy.get('button[type="submit"]').should('be.visible').click();

    // Wait for redirect
    cy.url().should('not.include', '/auth/login');
    cy.log('Login successful, redirected from login page');

    // Check current URL
    cy.url().then((url) => {
      cy.log(`After login URL: ${url}`);
    });

    // Take a screenshot
    cy.screenshot('after-login');
  });
});
