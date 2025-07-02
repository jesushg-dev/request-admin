import { faker } from '@faker-js/faker';

describe('Create new form - E2E', () => {
  const baseUrl = 'https://request-admin.vercel.app';
  const tenantId = '2DA1FC13-1F87-4A5D-A64C-05823686A111';
  const url = `${baseUrl}/admin/${tenantId}/form-designer/new`;

  // Generate test data
  const testData = {
    name: faker.commerce.productName(),
    description: faker.lorem.sentence(8),
  };

  before(() => {
    cy.loginIfNeeded();
  });

  it('should create a new form and redirect to the form builder', () => {
    cy.visit(url);

    // Fill in the name
    cy.get('input').first().type(testData.name);

    // Fill in the description
    cy.get('textarea').first().type(testData.description);

    // Toggle the public form checkbox
    cy.contains('Is public form').parent().find('input[type="checkbox"]').check({ force: true });

    // Submit the form
    cy.get('button').contains(/save/i).should('be.visible').click();

    // Should redirect to the form builder/editor
    cy.url({ timeout: 10000 }).should('match', new RegExp(`/admin/${tenantId}/form-designer/.+/edit`));

    // Check that the form name appears in the builder header
    cy.contains(testData.name).should('be.visible');
  });
});
