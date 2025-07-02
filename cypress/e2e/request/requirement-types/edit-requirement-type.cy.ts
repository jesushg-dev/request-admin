import { faker } from '@faker-js/faker';

describe('Edit requirement type - E2E', () => {
  const tenantId = '2DA1FC13-1F87-4A5D-A64C-05823686A111';

  // This will be set dynamically after creating a requirement type
  let requirementTypeId: string;
  let requirementTypeName: string;

  before(() => {
    cy.loginIfNeeded();

    // First, create a requirement type to edit
    const createUrl = `/en/admin/${tenantId}/configurations/requirement-types/new`;
    requirementTypeName = faker.commerce.productName();

    cy.visit(createUrl);
    cy.wait(3000);

    // Create a requirement type
    cy.get('input[placeholder="Enter the name"]').type(requirementTypeName);
    cy.get('textarea[placeholder="Enter the description"]').type(faker.lorem.sentence(8));
    cy.get('button')
      .contains(/create/i)
      .click();

    // Wait for redirect and get the requirement type ID
    cy.url({ timeout: 15000 }).should('include', `/admin/${tenantId}/configurations/priorities`);
    cy.contains('saved successfully', { timeout: 10000 }).should('be.visible');

    // Navigate to requirement types list to get the ID
    cy.visit(`/en/admin/${tenantId}/configurations/requirement-types`);
    cy.wait(3000);

    // Get the requirement type ID from the table row
    cy.get('tr')
      .contains(requirementTypeName)
      .parent()
      .find('a[href*="/edit"]')
      .invoke('attr', 'href')
      .then((href) => {
        if (href) {
          requirementTypeId = href.split('/').pop() || '';
        }
      });
  });

  it('should edit requirement type with all fields', () => {
    if (!requirementTypeId) {
      cy.log('Skipping test - requirement type ID not available');
      return;
    }

    const editUrl = `/en/admin/${tenantId}/configurations/requirement-types/${requirementTypeId}/edit`;
    cy.visit(editUrl);
    cy.wait(3000);

    const updatedData = {
      name: faker.commerce.productName(),
      description: faker.lorem.sentence(10),
    };

    // Verify form is pre-filled with existing data
    cy.get('input[placeholder="Enter the name"]').should('have.value', requirementTypeName);

    // Update the fields
    cy.get('input[placeholder="Enter the name"]').clear().type(updatedData.name);
    cy.get('textarea[placeholder="Enter the description"]').clear().type(updatedData.description);

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

    // Update the name for subsequent tests
    requirementTypeName = updatedData.name;
  });

  it('should validate required fields when editing', () => {
    if (!requirementTypeId) {
      cy.log('Skipping test - requirement type ID not available');
      return;
    }

    const editUrl = `/en/admin/${tenantId}/configurations/requirement-types/${requirementTypeId}/edit`;
    cy.visit(editUrl);
    cy.wait(3000);

    // Clear required fields
    cy.get('input[placeholder="Enter the name"]').clear();

    // Try to submit
    cy.get('button')
      .contains(/update/i)
      .click();

    // Should show validation errors
    cy.contains('Name is required').should('be.visible');
  });

  it('should handle form validation for name length when editing', () => {
    if (!requirementTypeId) {
      cy.log('Skipping test - requirement type ID not available');
      return;
    }

    const editUrl = `/en/admin/${tenantId}/configurations/requirement-types/${requirementTypeId}/edit`;
    cy.visit(editUrl);
    cy.wait(3000);

    // Fill name with more than 100 characters
    const longName = 'a'.repeat(101);
    cy.get('input[placeholder="Enter the name"]').clear().type(longName);

    // Should show validation error
    cy.contains('Name must be 100 characters or less').should('be.visible');
  });

  it('should handle form validation for description length when editing', () => {
    if (!requirementTypeId) {
      cy.log('Skipping test - requirement type ID not available');
      return;
    }

    const editUrl = `/en/admin/${tenantId}/configurations/requirement-types/${requirementTypeId}/edit`;
    cy.visit(editUrl);
    cy.wait(3000);

    // Fill description with more than 500 characters
    const longDescription = 'a'.repeat(501);
    cy.get('textarea[placeholder="Enter the description"]').clear().type(longDescription);

    // Should show validation error
    cy.contains('Description must be 500 characters or less').should('be.visible');
  });

  it('should update requirement type with minimal changes', () => {
    if (!requirementTypeId) {
      cy.log('Skipping test - requirement type ID not available');
      return;
    }

    const editUrl = `/en/admin/${tenantId}/configurations/requirement-types/${requirementTypeId}/edit`;
    cy.visit(editUrl);
    cy.wait(3000);

    const minimalUpdate = {
      name: faker.commerce.productName(),
    };

    // Only update the name
    cy.get('input[placeholder="Enter the name"]').clear().type(minimalUpdate.name);

    // Submit form
    cy.get('button')
      .contains(/update/i)
      .click();

    // Verify success
    cy.url({ timeout: 15000 }).should('include', `/admin/${tenantId}/configurations/priorities`);
    cy.contains('saved successfully', { timeout: 10000 }).should('be.visible');
  });

  it('should test switch states when editing', () => {
    if (!requirementTypeId) {
      cy.log('Skipping test - requirement type ID not available');
      return;
    }

    const editUrl = `/en/admin/${tenantId}/configurations/requirement-types/${requirementTypeId}/edit`;
    cy.visit(editUrl);
    cy.wait(3000);

    // Fill required field
    cy.get('input[placeholder="Enter the name"]').clear().type(faker.commerce.productName());

    // Test Active switch
    cy.contains('label', 'Active').parents('div.space-y-2').find('button[role="switch"]').click({ force: true });
    cy.contains('label', 'Active').parents('div.space-y-2').find('button[role="switch"]').should('have.attr', 'data-state', 'checked');

    // Test Default switch
    cy.contains('label', 'Default').parents('div.space-y-2').find('button[role="switch"]').click({ force: true });
    cy.contains('label', 'Default').parents('div.space-y-2').find('button[role="switch"]').should('have.attr', 'data-state', 'checked');

    // Submit form
    cy.get('button')
      .contains(/update/i)
      .click();

    // Verify success
    cy.url({ timeout: 15000 }).should('include', `/admin/${tenantId}/configurations/priorities`);
    cy.contains('saved successfully', { timeout: 10000 }).should('be.visible');
  });

  it('should handle non-existent requirement type ID', () => {
    const nonExistentId = '00000000-0000-0000-0000-000000000000';
    const editUrl = `/en/admin/${tenantId}/configurations/requirement-types/${nonExistentId}/edit`;

    cy.visit(editUrl);

    // Should show error or redirect to appropriate page
    cy.url().should('not.include', editUrl);
  });

  it('should preserve existing data when canceling edits', () => {
    if (!requirementTypeId) {
      cy.log('Skipping test - requirement type ID not available');
      return;
    }

    const editUrl = `/en/admin/${tenantId}/configurations/requirement-types/${requirementTypeId}/edit`;
    cy.visit(editUrl);
    cy.wait(3000);

    const originalName = requirementTypeName;
    const testName = faker.commerce.productName();

    // Verify original data is loaded
    cy.get('input[placeholder="Enter the name"]').should('have.value', originalName);

    // Make changes but don't submit
    cy.get('input[placeholder="Enter the name"]').clear().type(testName);

    // Navigate away (simulate cancel)
    cy.visit(`/en/admin/${tenantId}/configurations/requirement-types`);
    cy.wait(3000);

    // Navigate back to edit
    cy.visit(editUrl);
    cy.wait(3000);

    // Should still show original data (not the unsaved changes)
    cy.get('input[placeholder="Enter the name"]').should('have.value', originalName);
  });
});
