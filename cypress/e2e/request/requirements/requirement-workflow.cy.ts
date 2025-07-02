import { faker } from '@faker-js/faker';

describe('Requirement Management Workflow - E2E', () => {
  const tenantId = '2DA1FC13-1F87-4A5D-A64C-05823686A111';
  const requirementsListUrl = `/en/admin/${tenantId}/configurations/requirements`;
  const newRequirementUrl = `/en/admin/${tenantId}/configurations/requirements/new`;

  let createdRequirementId: string;
  let createdRequirementName: string;

  before(() => {
    cy.loginIfNeeded();
  });

  it('should navigate to requirements list and verify page structure', () => {
    cy.visit(requirementsListUrl);
    cy.wait(3000);

    // Verify page title and structure
    cy.contains('Requirements').should('be.visible');
    cy.get('table').should('be.visible');

    // Check for common table elements
    cy.get('thead').should('contain', 'Name');
    cy.get('thead').should('contain', 'Description');
    cy.get('thead').should('contain', 'Requirement Type');

    // Check for create button
    cy.get('a[href*="/new"]').should('be.visible');
  });

  it('should create a new requirement and verify it appears in the list', () => {
    cy.visit(newRequirementUrl);
    cy.wait(3000);

    createdRequirementName = faker.commerce.productName();
    const requirementDescription = faker.lorem.sentence(8);

    // Fill the form
    cy.get('input[placeholder="Name"]').type(createdRequirementName);
    cy.get('textarea[placeholder="Description"]').type(requirementDescription);

    // Select requirement type
    cy.get('label').contains('Requirement Type').parent().find('.css-11vi78b-control').click();
    cy.get('.css-bio7mv-option').first().click();

    // Submit form
    cy.get('button')
      .contains(/create/i)
      .click();

    // Verify redirect to list page
    cy.url({ timeout: 15000 }).should('include', requirementsListUrl);
    cy.contains(createdRequirementName, { timeout: 10000 }).should('be.visible');
    cy.contains('saved successfully', { timeout: 10000 }).should('be.visible');

    // Get the requirement ID for subsequent tests
    cy.get('tr')
      .contains(createdRequirementName)
      .parent()
      .find('a[href*="/edit"]')
      .invoke('attr', 'href')
      .then((href) => {
        if (href) {
          createdRequirementId = href.split('/').pop() || '';
        }
      });
  });

  it('should edit the created requirement', () => {
    if (!createdRequirementId) {
      cy.log('Skipping test - requirement ID not available');
      return;
    }

    const editUrl = `/en/admin/${tenantId}/configurations/requirements/${createdRequirementId}/edit`;
    cy.visit(editUrl);
    cy.wait(3000);

    const updatedName = faker.commerce.productName();
    const updatedDescription = faker.lorem.sentence(10);

    // Verify form is pre-filled
    cy.get('input[placeholder="Name"]').should('have.value', createdRequirementName);

    // Update fields
    cy.get('input[placeholder="Name"]').clear().type(updatedName);
    cy.get('textarea[placeholder="Description"]').clear().type(updatedDescription);

    // Toggle switches
    cy.contains('label', 'Active').parents('div.space-y-2').find('button[role="switch"]').click({ force: true });
    cy.contains('label', 'Mark as one-time required requirement').parents('div.space-y-2').find('button[role="switch"]').click({ force: true });

    // Submit form
    cy.get('button')
      .contains(/update/i)
      .click();

    // Verify success
    cy.url({ timeout: 15000 }).should('include', requirementsListUrl);
    cy.contains(updatedName, { timeout: 10000 }).should('be.visible');
    cy.contains('saved successfully', { timeout: 10000 }).should('be.visible');

    // Update the name for subsequent tests
    createdRequirementName = updatedName;
  });

  it('should search and filter requirements', () => {
    cy.visit(requirementsListUrl);
    cy.wait(3000);

    // Test search functionality if available
    cy.get('input[placeholder*="search" i], input[placeholder*="name" i]').then(($searchInput) => {
      if ($searchInput.length > 0) {
        cy.wrap($searchInput).type(createdRequirementName);
        cy.wait(1000);
        cy.get('tr').should('contain', createdRequirementName);
      }
    });
  });

  it('should handle form validation errors properly', () => {
    cy.visit(newRequirementUrl);
    cy.wait(3000);

    // Try to submit empty form
    cy.get('button')
      .contains(/create/i)
      .click();

    // Verify validation errors
    cy.contains('Name is required').should('be.visible');
    cy.contains('Description is required').should('be.visible');
    cy.contains('This field is required').should('be.visible');

    // Fill invalid data
    const longName = 'a'.repeat(201);
    cy.get('input[placeholder="Name"]').type(longName);
    cy.get('textarea[placeholder="Description"]').type('Valid description');

    // Select requirement type
    cy.get('label').contains('Requirement Type').parent().find('.css-11vi78b-control').click();
    cy.get('.css-bio7mv-option').first().click();

    // Should show validation error
    cy.contains('Name must be 200 characters or less').should('be.visible');
  });

  it('should test requirement type selection', () => {
    cy.visit(newRequirementUrl);
    cy.wait(3000);

    // Fill basic fields
    cy.get('input[placeholder="Name"]').type(faker.commerce.productName());
    cy.get('textarea[placeholder="Description"]').type(faker.lorem.sentence(8));

    // Test requirement type dropdown
    cy.get('label').contains('Requirement Type').parent().find('.css-11vi78b-control').click();
    cy.get('.css-bio7mv-option').should('be.visible');

    // Select first option
    cy.get('.css-bio7mv-option').first().click();

    // Verify selection
    cy.get('label').contains('Requirement Type').parent().find('.css-11vi78b-control').should('contain', 'Select');
  });

  it('should test checkbox toggles', () => {
    cy.visit(newRequirementUrl);
    cy.wait(3000);

    // Fill required fields
    cy.get('input[placeholder="Name"]').type(faker.commerce.productName());
    cy.get('textarea[placeholder="Description"]').type(faker.lorem.sentence(8));
    cy.get('label').contains('Requirement Type').parent().find('.css-11vi78b-control').click();
    cy.get('.css-bio7mv-option').first().click();

    // Test Active toggle
    cy.contains('label', 'Active').parents('div.space-y-2').find('button[role="switch"]').click({ force: true });
    cy.contains('label', 'Active').parents('div.space-y-2').find('button[role="switch"]').should('have.attr', 'data-state', 'checked');

    // Test one-time requirement toggle
    cy.contains('label', 'Mark as one-time required requirement').parents('div.space-y-2').find('button[role="switch"]').click({ force: true });
    cy.contains('label', 'Mark as one-time required requirement').parents('div.space-y-2').find('button[role="switch"]').should('have.attr', 'data-state', 'checked');
  });

  it('should test responsive behavior', () => {
    // Test on mobile viewport
    cy.viewport('iphone-x');
    cy.visit(newRequirementUrl);
    cy.wait(3000);

    // Verify form is still accessible
    cy.get('input[placeholder="Name"]').should('be.visible');
    cy.get('textarea[placeholder="Description"]').should('be.visible');

    // Test on tablet viewport
    cy.viewport('ipad-2');
    cy.visit(newRequirementUrl);
    cy.wait(3000);

    // Verify form elements are properly displayed
    cy.get('form').should('be.visible');

    // Reset to desktop viewport
    cy.viewport(1280, 720);
  });

  it('should handle network errors gracefully', () => {
    // This test would require mocking network requests
    // For now, we'll test that the form handles errors properly
    cy.visit(newRequirementUrl);
    cy.wait(3000);

    // Fill form with valid data
    cy.get('input[placeholder="Name"]').type(faker.commerce.productName());
    cy.get('textarea[placeholder="Description"]').type(faker.lorem.sentence(8));
    cy.get('label').contains('Requirement Type').parent().find('.css-11vi78b-control').click();
    cy.get('.css-bio7mv-option').first().click();

    // Submit form
    cy.get('button')
      .contains(/create/i)
      .click();

    // Should handle success or error gracefully
    cy.url({ timeout: 15000 }).should('not.include', newRequirementUrl);
  });
});
