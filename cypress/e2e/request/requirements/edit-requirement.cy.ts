import { faker } from '@faker-js/faker';

describe('Edit requirement - E2E', () => {
  const tenantId = '2DA1FC13-1F87-4A5D-A64C-05823686A111';

  // This will be set dynamically after creating a requirement
  let requirementId: string;
  let requirementName: string;

  before(() => {
    cy.loginIfNeeded();

    // First, create a requirement to edit
    const createUrl = `/en/admin/${tenantId}/configurations/requirements/new`;
    requirementName = faker.commerce.productName();

    cy.visit(createUrl);
    cy.wait(3000);

    // Create a requirement
    cy.get('input[placeholder="Name"]').type(requirementName);
    cy.get('textarea[placeholder="Description"]').type(faker.lorem.sentence(8));
    cy.get('label').contains('Requirement Type').parent().find('.css-11vi78b-control').click();
    cy.get('.css-bio7mv-option').first().click();
    cy.get('button')
      .contains(/create/i)
      .click();

    // Wait for redirect and get the requirement ID from the URL or page
    cy.url({ timeout: 15000 }).should('include', `/admin/${tenantId}/configurations/requirements`);
    cy.contains(requirementName, { timeout: 10000 }).should('be.visible');

    // Get the requirement ID from the table row or URL
    cy.get('tr')
      .contains(requirementName)
      .parent()
      .find('a[href*="/edit"]')
      .invoke('attr', 'href')
      .then((href) => {
        if (href) {
          requirementId = href.split('/').pop() || '';
        }
      });
  });

  it('should edit requirement with all fields', () => {
    const editUrl = `/en/admin/${tenantId}/configurations/requirements/${requirementId}/edit`;
    cy.visit(editUrl);
    cy.wait(3000);

    const updatedData = {
      name: faker.commerce.productName(),
      description: faker.lorem.sentence(10),
    };

    // Verify form is pre-filled with existing data
    cy.get('input[placeholder="Name"]').should('have.value', requirementName);

    // Update the fields
    cy.get('input[placeholder="Name"]').clear().type(updatedData.name);
    cy.get('textarea[placeholder="Description"]').clear().type(updatedData.description);

    // Toggle switches
    cy.contains('label', 'Active').parents('div.space-y-2').find('button[role="switch"]').click({ force: true });
    cy.contains('label', 'Mark as one-time required requirement').parents('div.space-y-2').find('button[role="switch"]').click({ force: true });

    // Submit form
    cy.get('button')
      .contains(/update/i)
      .click();

    // Verify success
    cy.url({ timeout: 15000 }).should('include', `/admin/${tenantId}/configurations/requirements`);
    cy.contains(updatedData.name, { timeout: 10000 }).should('be.visible');
    cy.contains('saved successfully', { timeout: 10000 }).should('be.visible');
  });

  it('should validate required fields when editing', () => {
    const editUrl = `/en/admin/${tenantId}/configurations/requirements/${requirementId}/edit`;
    cy.visit(editUrl);
    cy.wait(3000);

    // Clear required fields
    cy.get('input[placeholder="Name"]').clear();
    cy.get('textarea[placeholder="Description"]').clear();

    // Try to submit
    cy.get('button')
      .contains(/update/i)
      .click();

    // Should show validation errors
    cy.contains('Name is required').should('be.visible');
    cy.contains('Description is required').should('be.visible');
  });

  it('should handle form validation for name length when editing', () => {
    const editUrl = `/en/admin/${tenantId}/configurations/requirements/${requirementId}/edit`;
    cy.visit(editUrl);
    cy.wait(3000);

    // Fill name with more than 200 characters
    const longName = 'a'.repeat(201);
    cy.get('input[placeholder="Name"]').clear().type(longName);

    // Should show validation error
    cy.contains('Name must be 200 characters or less').should('be.visible');
  });

  it('should handle form validation for description length when editing', () => {
    const editUrl = `/en/admin/${tenantId}/configurations/requirements/${requirementId}/edit`;
    cy.visit(editUrl);
    cy.wait(3000);

    // Fill description with more than 500 characters
    const longDescription = 'a'.repeat(501);
    cy.get('textarea[placeholder="Description"]').clear().type(longDescription);

    // Should show validation error
    cy.contains('Description must be 500 characters or less').should('be.visible');
  });

  it('should update requirement with minimal changes', () => {
    const editUrl = `/en/admin/${tenantId}/configurations/requirements/${requirementId}/edit`;
    cy.visit(editUrl);
    cy.wait(3000);

    const minimalUpdate = {
      name: faker.commerce.productName(),
    };

    // Only update the name
    cy.get('input[placeholder="Name"]').clear().type(minimalUpdate.name);

    // Submit form
    cy.get('button')
      .contains(/update/i)
      .click();

    // Verify success
    cy.url({ timeout: 15000 }).should('include', `/admin/${tenantId}/configurations/requirements`);
    cy.contains(minimalUpdate.name, { timeout: 10000 }).should('be.visible');
  });

  it('should handle non-existent requirement ID', () => {
    const nonExistentId = '00000000-0000-0000-0000-000000000000';
    const editUrl = `/en/admin/${tenantId}/configurations/requirements/${nonExistentId}/edit`;

    cy.visit(editUrl);

    // Should show error or redirect to requirements list
    cy.url().should('include', `/admin/${tenantId}/configurations/requirements`);
  });
});
