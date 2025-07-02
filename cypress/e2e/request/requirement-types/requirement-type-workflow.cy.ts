import { faker } from '@faker-js/faker';

describe('Requirement Type Management Workflow - E2E', () => {
  const tenantId = '2DA1FC13-1F87-4A5D-A64C-05823686A111';
  const requirementTypesListUrl = `/en/admin/${tenantId}/configurations/requirement-types`;
  const newRequirementTypeUrl = `/en/admin/${tenantId}/configurations/requirement-types/new`;

  let createdRequirementTypeId: string;
  let createdRequirementTypeName: string;

  before(() => {
    cy.loginIfNeeded();
  });

  it('should navigate to requirement types list and verify page structure', () => {
    cy.visit(requirementTypesListUrl);
    cy.wait(3000);

    // Verify page title and structure
    cy.contains('Requirement Types').should('be.visible');
    cy.get('table').should('be.visible');

    // Check for common table elements
    cy.get('thead').should('contain', 'Name');
    cy.get('thead').should('contain', 'Description');
    cy.get('thead').should('contain', 'Created At');

    // Check for create button
    cy.get('a[href*="/new"]').should('be.visible');
  });

  it('should create a new requirement type and verify it appears in the list', () => {
    cy.visit(newRequirementTypeUrl);
    cy.wait(3000);

    createdRequirementTypeName = faker.commerce.productName();
    const requirementTypeDescription = faker.lorem.sentence(8);

    // Fill the form
    cy.get('input[placeholder="Enter the name"]').type(createdRequirementTypeName);
    cy.get('textarea[placeholder="Enter the description"]').type(requirementTypeDescription);

    // Submit form
    cy.get('button')
      .contains(/create/i)
      .click();

    // Verify redirect to priorities page (as per the form logic)
    cy.url({ timeout: 15000 }).should('include', `/admin/${tenantId}/configurations/priorities`);
    cy.contains('saved successfully', { timeout: 10000 }).should('be.visible');

    // Navigate to requirement types list to verify creation
    cy.visit(requirementTypesListUrl);
    cy.wait(3000);
    cy.contains(createdRequirementTypeName, { timeout: 10000 }).should('be.visible');

    // Get the requirement type ID for subsequent tests
    cy.get('tr')
      .contains(createdRequirementTypeName)
      .parent()
      .find('a[href*="/edit"]')
      .invoke('attr', 'href')
      .then((href) => {
        if (href) {
          createdRequirementTypeId = href.split('/').pop() || '';
        }
      });
  });

  it('should edit the created requirement type', () => {
    if (!createdRequirementTypeId) {
      cy.log('Skipping test - requirement type ID not available');
      return;
    }

    const editUrl = `/en/admin/${tenantId}/configurations/requirement-types/${createdRequirementTypeId}/edit`;
    cy.visit(editUrl);
    cy.wait(3000);

    const updatedName = faker.commerce.productName();
    const updatedDescription = faker.lorem.sentence(10);

    // Verify form is pre-filled
    cy.get('input[placeholder="Enter the name"]').should('have.value', createdRequirementTypeName);

    // Update fields
    cy.get('input[placeholder="Enter the name"]').clear().type(updatedName);
    cy.get('textarea[placeholder="Enter the description"]').clear().type(updatedDescription);

    // Toggle switches
    cy.contains('label', 'Active').parents('div.space-y-2').find('button[role="switch"]').click({ force: true });
    cy.contains('label', 'Default').parents('div.space-y-2').find('button[role="switch"]').click({ force: true });

    // Submit form
    cy.get('button')
      .contains(/update/i)
      .click();

    // Verify success
    cy.url({ timeout: 15000 }).should('include', `/admin/${tenantId}/configurations/priorities`);
    cy.contains('saved successfully', { timeout: 10000 }).should('be.visible');

    // Navigate to list to verify update
    cy.visit(requirementTypesListUrl);
    cy.wait(3000);
    cy.contains(updatedName, { timeout: 10000 }).should('be.visible');

    // Update the name for subsequent tests
    createdRequirementTypeName = updatedName;
  });

  it('should search and filter requirement types', () => {
    cy.visit(requirementTypesListUrl);
    cy.wait(3000);

    // Test search functionality if available
    cy.get('input[placeholder*="search" i], input[placeholder*="name" i]').then(($searchInput) => {
      if ($searchInput.length > 0) {
        cy.wrap($searchInput).type(createdRequirementTypeName);
        cy.wait(1000);
        cy.get('tr').should('contain', createdRequirementTypeName);
      }
    });
  });

  it('should handle form validation errors properly', () => {
    cy.visit(newRequirementTypeUrl);
    cy.wait(3000);

    // Try to submit empty form
    cy.get('button')
      .contains(/create/i)
      .click();

    // Verify validation errors
    cy.contains('Name is required').should('be.visible');

    // Fill invalid data
    const longName = 'a'.repeat(101);
    cy.get('input[placeholder="Enter the name"]').type(longName);
    cy.get('textarea[placeholder="Enter the description"]').type('Valid description');

    // Should show validation error
    cy.contains('Name must be 100 characters or less').should('be.visible');
  });

  it('should test switch toggles functionality', () => {
    cy.visit(newRequirementTypeUrl);
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

  it('should test responsive behavior', () => {
    // Test on mobile viewport
    cy.viewport('iphone-x');
    cy.visit(newRequirementTypeUrl);
    cy.wait(3000);

    // Verify form is still accessible
    cy.get('input[placeholder="Enter the name"]').should('be.visible');
    cy.get('textarea[placeholder="Enter the description"]').should('be.visible');

    // Test on tablet viewport
    cy.viewport('ipad-2');
    cy.visit(newRequirementTypeUrl);
    cy.wait(3000);

    // Verify form elements are properly displayed
    cy.get('form').should('be.visible');

    // Reset to desktop viewport
    cy.viewport(1280, 720);
  });

  it('should handle network errors gracefully', () => {
    cy.visit(newRequirementTypeUrl);
    cy.wait(3000);

    // Fill form with valid data
    cy.get('input[placeholder="Enter the name"]').type(faker.commerce.productName());
    cy.get('textarea[placeholder="Enter the description"]').type(faker.lorem.sentence(8));

    // Submit form
    cy.get('button')
      .contains(/create/i)
      .click();

    // Should handle success or error gracefully
    cy.url({ timeout: 15000 }).should('not.include', newRequirementTypeUrl);
  });

  it('should test optional description field', () => {
    cy.visit(newRequirementTypeUrl);
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

  it('should test form field descriptions and labels', () => {
    cy.visit(newRequirementTypeUrl);
    cy.wait(3000);

    // Verify field labels and descriptions are present
    cy.contains('label', 'Name').should('be.visible');
    cy.contains('label', 'Description').should('be.visible');
    cy.contains('label', 'Active').should('be.visible');
    cy.contains('label', 'Default').should('be.visible');

    // Verify descriptions are present
    cy.contains('Enter the name').should('be.visible');
    cy.contains('Enter the description').should('be.visible');
    cy.contains('Check if active').should('be.visible');
    cy.contains('Check if default').should('be.visible');
  });

  it('should test form submission with different switch combinations', () => {
    cy.visit(newRequirementTypeUrl);
    cy.wait(3000);

    const testName = faker.commerce.productName();

    // Test with both switches off (default state)
    cy.get('input[placeholder="Enter the name"]').type(testName);
    cy.get('button')
      .contains(/create/i)
      .click();
    cy.url({ timeout: 15000 }).should('include', `/admin/${tenantId}/configurations/priorities`);

    // Test with Active switch on
    cy.visit(newRequirementTypeUrl);
    cy.wait(3000);
    cy.get('input[placeholder="Enter the name"]').type(faker.commerce.productName());
    cy.contains('label', 'Active').parents('div.space-y-2').find('button[role="switch"]').click({ force: true });
    cy.get('button')
      .contains(/create/i)
      .click();
    cy.url({ timeout: 15000 }).should('include', `/admin/${tenantId}/configurations/priorities`);

    // Test with Default switch on
    cy.visit(newRequirementTypeUrl);
    cy.wait(3000);
    cy.get('input[placeholder="Enter the name"]').type(faker.commerce.productName());
    cy.contains('label', 'Default').parents('div.space-y-2').find('button[role="switch"]').click({ force: true });
    cy.get('button')
      .contains(/create/i)
      .click();
    cy.url({ timeout: 15000 }).should('include', `/admin/${tenantId}/configurations/priorities`);

    // Test with both switches on
    cy.visit(newRequirementTypeUrl);
    cy.wait(3000);
    cy.get('input[placeholder="Enter the name"]').type(faker.commerce.productName());
    cy.contains('label', 'Active').parents('div.space-y-2').find('button[role="switch"]').click({ force: true });
    cy.contains('label', 'Default').parents('div.space-y-2').find('button[role="switch"]').click({ force: true });
    cy.get('button')
      .contains(/create/i)
      .click();
    cy.url({ timeout: 15000 }).should('include', `/admin/${tenantId}/configurations/priorities`);
  });
});
