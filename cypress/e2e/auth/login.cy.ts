describe('Login Page', () => {
  beforeEach(() => {
    cy.visit('/auth/login');
  });

  it('should display login form', () => {
    cy.get('form').should('exist');
    cy.get('input[type="email"]').should('exist');
    cy.get('input[type="password"]').should('exist');
    cy.get('button[type="submit"]').should('exist');
  });

  it('should show validation errors for empty fields', () => {
    cy.get('button[type="submit"]').click();
    cy.contains('Invalid email').should('be.visible');
    cy.contains('Password is required').should('be.visible');
  });

  it('should not submit the form or make a request for invalid email', () => {
    cy.intercept('POST', '/api/auth/login').as('loginRequest');

    cy.get('input[type="email"]').should('not.be.disabled').type('invalid-email');
    cy.get('button[type="submit"]').click();

    cy.wait(500);
    cy.get('@loginRequest.all').should('have.length', 0);
  });

  it('should show error message for invalid credentials', () => {
    cy.get('input[type="email"]').should('not.be.disabled').type('test@example.com');
    cy.get('input[type="password"]').should('not.be.disabled').type('wrongpassword');
    cy.get('button[type="submit"]').click();
    cy.contains('An error occurred:').should('be.visible');
  });

  it('should successfully login with valid credentials', () => {
    const testEmail = Cypress.env('TEST_USER_EMAIL');
    const testPassword = Cypress.env('TEST_USER_PASSWORD');

    cy.get('input[type="email"]').type(testEmail);
    cy.get('input[type="password"]').type(testPassword);
    cy.get('button[type="submit"]').click();

    cy.url().should('not.include', '/auth/login');
  });

  it('should navigate to forgot password page', () => {
    cy.get('a[href="/auth/reset"]').click();
    cy.url().should('include', '/auth/reset');
  });

  it('should navigate to register page', () => {
    cy.contains("Don't have an account?").click();
    cy.url().should('include', '/auth/register');
  });

  it('should remember user when remember me is checked', () => {
    const testEmail = Cypress.env('TEST_USER_EMAIL');
    const testPassword = Cypress.env('TEST_USER_PASSWORD');

    cy.get('input[type="email"]').type(testEmail);
    cy.get('input[type="password"]').type(testPassword);
    cy.get('button#remember').click();
    cy.get('button[type="submit"]').click();

    // After successful login, refresh the page
    cy.reload();

    // Add assertion to verify user is still logged in
    cy.url().should('not.include', '/auth/login');
  });
});
