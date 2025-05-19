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
    cy.get('form').contains('Required').should('be.visible');
  });

  it('should show validation error for invalid email', () => {
    cy.get('input[type="email"]').type('invalid-email');
    cy.get('button[type="submit"]').click();
    cy.get('form').contains('Invalid email').should('be.visible');
  });

  it('should show error message for invalid credentials', () => {
    cy.get('input[type="email"]').type('test@example.com');
    cy.get('input[type="password"]').type('wrongpassword');
    cy.get('button[type="submit"]').click();
    cy.get('[role="alert"]').should('be.visible');
  });

  it('should successfully login with valid credentials', () => {
    // Replace these with your test user credentials
    const testEmail = Cypress.env('TEST_USER_EMAIL');
    const testPassword = Cypress.env('TEST_USER_PASSWORD');

    cy.get('input[type="email"]').type(testEmail);
    cy.get('input[type="password"]').type(testPassword);
    cy.get('button[type="submit"]').click();

    // Add assertion for successful login
    // This will depend on your application's behavior after successful login
    cy.url().should('not.include', '/auth/login');
  });

  it('should navigate to forgot password page', () => {
    cy.contains('Forgot password?').click();
    cy.url().should('include', '/auth/reset');
  });

  it('should navigate to register page', () => {
    cy.contains('No account?').click();
    cy.url().should('include', '/auth/register');
  });

  it('should remember user when remember me is checked', () => {
    const testEmail = Cypress.env('TEST_USER_EMAIL');
    const testPassword = Cypress.env('TEST_USER_PASSWORD');

    cy.get('input[type="email"]').type(testEmail);
    cy.get('input[type="password"]').type(testPassword);
    cy.get('input[type="checkbox"]').check();
    cy.get('button[type="submit"]').click();

    // After successful login, refresh the page
    cy.reload();

    // Add assertion to verify user is still logged in
    cy.url().should('not.include', '/auth/login');
  });
});
