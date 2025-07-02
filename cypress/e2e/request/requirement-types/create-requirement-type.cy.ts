import { faker } from '@faker-js/faker';

describe('Create new requirement type - E2E', () => {
  const tenantId = '2DA1FC13-1F87-4A5D-A64C-05823686A111';
  const url = `/en/admin/${tenantId}/configurations/requirement-types/new`;

  const testData = {
    name: faker.commerce.productName(),
    description: faker.lorem.sentence(8),
  };

  before(() => {
    cy.loginIfNeeded();
    cy.visit(url);
  });

  it('should create a new requirement type with all fields', () => {
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

    // Fill requirement type name
    cy.get('input[placeholder="Enter the name"]').should('be.visible').type(testData.name);

    // Fill description
    cy.get('textarea[placeholder="Enter the description"]').should('be.visible').type(testData.description);

    // Toggle switches
    cy.contains('label', 'Active').parents('div.space-y-2').find('button[role="switch"]').click({ force: true });
    cy.contains('label', 'Default').parents('div.space-y-2').find('button[role="switch"]').click({ force: true });

    // Submit form
    cy.get('button')
      .contains(/create/i)
      .click();

    // Verify success - note: the form redirects to priorities page, not requirement-types
    cy.url({ timeout: 15000 }).should('include', `/admin/${tenantId}/configurations/priorities`);
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
  });

  it('should handle form validation for name length', () => {
    cy.visit(url);
    cy.wait(3000);

    // Fill name with more than 100 characters
    const longName = 'a'.repeat(101);
    cy.get('input[placeholder="Enter the name"]').type(longName);

    // Fill description
    cy.get('textarea[placeholder="Enter the description"]').type(testData.description);

    // Should show validation error
    cy.contains('Name must be 100 characters or less').should('be.visible');
  });

  it('should handle form validation for description length', () => {
    cy.visit(url);
    cy.wait(3000);

    // Fill description with more than 500 characters
    const longDescription = 'a'.repeat(501);
    cy.get('textarea[placeholder="Enter the description"]').type(longDescription);

    // Fill name
    cy.get('input[placeholder="Enter the name"]').type(testData.name);

    // Should show validation error
    cy.contains('Description must be 500 characters or less').should('be.visible');
  });

  it('should create requirement type with minimal fields', () => {
    cy.visit(url);
    cy.wait(3000);

    const minimalData = {
      name: faker.commerce.productName(),
    };

    // Fill only required fields
    cy.get('input[placeholder="Enter the name"]').type(minimalData.name);

    // Submit form
    cy.get('button')
      .contains(/create/i)
      .click();

    // Verify success
    cy.url({ timeout: 15000 }).should('include', `/admin/${tenantId}/configurations/priorities`);
    cy.contains('saved successfully', { timeout: 10000 }).should('be.visible');
  });

  it('should test switch toggles functionality', () => {
    cy.visit(url);
    cy.wait(3000);

    // Fill required fields
    cy.get('input[placeholder="Enter the name"]').type(faker.commerce.productName());

    // Test Active switch
    cy.contains('label', 'Active').parents('div.space-y-2').find('button[role="switch"]').click({ force: true });
    cy.contains('label', 'Active').parents('div.space-y-2').find('button[role="switch"]').should('have.attr', 'data-state', 'checked');

    // Test Default switch
    cy.contains('label', 'Default').parents('div.space-y-2').find('button[role="switch"]').click({ force: true });
    cy.contains('label', 'Default').parents('div.space-y-2').find('button[role="switch"]').should('have.attr', 'data-state', 'checked');

    // Toggle them back
    cy.contains('label', 'Active').parents('div.space-y-2').find('button[role="switch"]').click({ force: true });
    cy.contains('label', 'Default').parents('div.space-y-2').find('button[role="switch"]').click({ force: true });

    // Verify they are unchecked
    cy.contains('label', 'Active').parents('div.space-y-2').find('button[role="switch"]').should('have.attr', 'data-state', 'unchecked');
    cy.contains('label', 'Default').parents('div.space-y-2').find('button[role="switch"]').should('have.attr', 'data-state', 'unchecked');
  });

  it('should handle empty description field', () => {
    cy.visit(url);
    cy.wait(3000);

    const testName = faker.commerce.productName();

    // Fill only name (description is optional)
    cy.get('input[placeholder="Enter the name"]').type(testName);

    // Leave description empty
    cy.get('textarea[placeholder="Enter the description"]').should('have.value', '');

    // Submit form
    cy.get('button')
      .contains(/create/i)
      .click();

    // Should succeed without validation errors
    cy.url({ timeout: 15000 }).should('include', `/admin/${tenantId}/configurations/priorities`);
    cy.contains('saved successfully', { timeout: 10000 }).should('be.visible');
  });
});
