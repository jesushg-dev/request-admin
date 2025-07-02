import { faker } from '@faker-js/faker';

describe('Create new requirement - E2E', () => {
  const tenantId = '2DA1FC13-1F87-4A5D-A64C-05823686A111';
  const url = `/en/admin/${tenantId}/configurations/requirements/new`;

  const testData = {
    name: faker.commerce.productName(),
    description: faker.lorem.sentence(8),
  };

  before(() => {
    cy.loginIfNeeded();
    cy.visit(url);
  });

  it('should create a new requirement with all fields', () => {
    // Debug: Check current URL
    cy.url().then((url) => {
      cy.log(`Current URL: ${url}`);
    });

    // Wait for page to load
    cy.wait(3000);

    // Debug: Check for form elements
    cy.get('body').then(($body) => {
      cy.log(`Form elements found: ${$body.find('form').length}`);
      cy.log(`Input elements found: ${$body.find('input').length}`);
    });

    // Fill requirement name
    cy.get('input[placeholder="Name"]').should('be.visible').type(testData.name);

    // Fill description
    cy.get('textarea[placeholder="Description"]').should('be.visible').type(testData.description);

    // Select requirement type (assuming there are existing requirement types)
    cy.get('label').contains('Requirement Type').parent().find('.css-11vi78b-control').click();
    cy.get('.css-bio7mv-option').should('be.visible');
    cy.get('.css-bio7mv-option').first().click();

    // Toggle switches
    cy.contains('label', 'Active').parents('div.space-y-2').find('button[role="switch"]').click({ force: true });
    cy.contains('label', 'Mark as one-time required requirement').parents('div.space-y-2').find('button[role="switch"]').click({ force: true });

    // Submit form
    cy.get('button')
      .contains(/create/i)
      .click();

    // Verify success
    cy.url({ timeout: 15000 }).should('include', `/admin/${tenantId}/configurations/requirements`);
    cy.contains(testData.name, { timeout: 10000 }).should('be.visible');
    cy.contains('saved successfully', { timeout: 10000 }).should('be.visible');
  });

  it('should validate required fields', () => {
    cy.visit(url);
    cy.wait(3000);

    // Try to submit without filling required fields
    cy.get('button')
      .contains(/create/i)
      .click();

    // Should show validation errors
    cy.contains('Name is required').should('be.visible');
    cy.contains('Description is required').should('be.visible');
    cy.contains('This field is required').should('be.visible');
  });

  it('should handle form validation for name length', () => {
    cy.visit(url);
    cy.wait(3000);

    // Fill name with more than 200 characters
    const longName = 'a'.repeat(201);
    cy.get('input[placeholder="Name"]').type(longName);

    // Fill other required fields
    cy.get('textarea[placeholder="Description"]').type(testData.description);
    cy.get('label').contains('Requirement Type').parent().find('.css-11vi78b-control').click();
    cy.get('.css-bio7mv-option').first().click();

    // Should show validation error
    cy.contains('Name must be 200 characters or less').should('be.visible');
  });

  it('should handle form validation for description length', () => {
    cy.visit(url);
    cy.wait(3000);

    // Fill description with more than 500 characters
    const longDescription = 'a'.repeat(501);
    cy.get('textarea[placeholder="Description"]').type(longDescription);

    // Fill other required fields
    cy.get('input[placeholder="Name"]').type(testData.name);
    cy.get('label').contains('Requirement Type').parent().find('.css-11vi78b-control').click();
    cy.get('.css-bio7mv-option').first().click();

    // Should show validation error
    cy.contains('Description must be 500 characters or less').should('be.visible');
  });

  it('should create requirement with minimal fields', () => {
    cy.visit(url);
    cy.wait(3000);

    const minimalData = {
      name: faker.commerce.productName(),
      description: faker.lorem.sentence(5),
    };

    // Fill only required fields
    cy.get('input[placeholder="Name"]').type(minimalData.name);
    cy.get('textarea[placeholder="Description"]').type(minimalData.description);

    // Select requirement type
    cy.get('label').contains('Requirement Type').parent().find('.css-11vi78b-control').click();
    cy.get('.css-bio7mv-option').first().click();

    // Submit form
    cy.get('button')
      .contains(/create/i)
      .click();

    // Verify success
    cy.url({ timeout: 15000 }).should('include', `/admin/${tenantId}/configurations/requirements`);
    cy.contains(minimalData.name, { timeout: 10000 }).should('be.visible');
  });
});
