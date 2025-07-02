import { faker } from '@faker-js/faker';

describe('Create new workflow - E2E', () => {
  const tenantId = '2DA1FC13-1F87-4A5D-A64C-05823686A111';
  const url = `/en/admin/${tenantId}/configurations/workflows/new`;

  const testData = {
    name: faker.commerce.productName(),
    description: faker.lorem.sentence(8),
  };

  before(() => {
    cy.loginIfNeeded();
    cy.visit(url);
  });

  it('should create a complete workflow with connected nodes', () => {
    // Debug: Check current URL
    cy.url().then((url) => {
      cy.log(`Current URL: ${url}`);
    });

    // Debug: Check if we're on the right page
    cy.get('body').then(($body) => {
      cy.log(`Page title: ${$body.find('title').text()}`);
      cy.log(`Page content length: ${$body.text().length}`);
    });

    // Step 1: Fill workflow form
    cy.get('input[placeholder="Enter workflow name"]').type(testData.name);
    cy.get('textarea[placeholder="Enter workflow description"]').type(testData.description);

    // Toggle switches
    cy.contains('label', 'Default Workflow').parents('div.space-y-2').find('button[role="switch"]').click({ force: true });
    cy.contains('label', 'Require Comments').parents('div.space-y-2').find('button[role="switch"]').click({ force: true });

    // Next step
    cy.get('button').contains(/next/i).click();

    // Step 2: Add nodes with different types and colors
    cy.addWorkflowNode('Initial', 'Initial', 'Green');
    cy.addWorkflowNode('Default', 'Default', 'Blue');
    cy.addWorkflowNode('Final', 'Final', 'Red');

    // Espera a que los nodos estén visibles
    cy.get('[data-testid="workflow-node-initial"]').should('be.visible');
    cy.get('[data-testid="workflow-node-default"]').should('be.visible');
    cy.get('[data-testid="workflow-node-final"]').should('be.visible');

    // Conectar Initial → Default
    cy.connectNodes('[data-testid="workflow-node-initial"] [data-handlepos="bottom"]', '[data-testid="workflow-node-default"] [data-handlepos="top"]');

    // Conectar Default → Final
    cy.connectNodes('[data-testid="workflow-node-default"] [data-handlepos="bottom"]', '[data-testid="workflow-node-final"] [data-handlepos="top"]');

    // Verifica que las conexiones existan
    cy.get('.react-flow__edge', { timeout: 10000 }).should('have.length', 2);

    // Next step
    cy.get('button')
      .contains(/next|review|finish/i)
      .click();

    // Step 3: Review and submit
    cy.get('button')
      .contains(/create|save|finish/i)
      .click();

    // Verify success
    cy.url({ timeout: 15000 }).should('include', `/admin/${tenantId}/configurations/workflows`);
    cy.contains(testData.name, { timeout: 10000 }).should('be.visible');
    cy.contains('Workflow created successfully').should('be.visible');
  });
});
