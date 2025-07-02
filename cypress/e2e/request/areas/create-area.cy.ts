/// <reference types="cypress" />

import { faker } from '@faker-js/faker';

describe('Create new area - E2E', () => {
  const tenantId = '2DA1FC13-1F87-4A5D-A64C-05823686A111';
  const url = `/en/admin/${tenantId}/configurations/areas/new`;

  const testData = {
    name: faker.commerce.department() + ' ' + faker.number.int({ min: 100, max: 999 }),
    description: faker.lorem.sentence(8),
  };

  before(() => {
    cy.loginIfNeeded();
    cy.visit(url);
  });

  it('should create a new area with all required fields', () => {
    cy.wait(2000);
    // Fill name
    cy.get('input[placeholder="Enter area name"], input[placeholder*="name" i]').first().type(testData.name);
    // Select hierarchy (if not disabled)
    cy.get('div')
      .contains('label', /hierarchy/i)
      .parent()
      .find('.css-11vi78b-control, .react-select__control')
      .then(($el: JQuery<HTMLElement>) => {
        if (!$el.hasClass('is-disabled')) {
          cy.wrap($el).click();
          cy.get('.css-bio7mv-option, .react-select__option').first().click();
        }
      });
    // Fill description
    cy.get('textarea[placeholder*="description" i]').type(testData.description);
    // Toggle Active
    cy.contains('label', /active/i)
      .parents('div.space-y-2')
      .find('button[role="switch"]')
      .click({ force: true });
    // Go to next step (Assignment Category)
    cy.get('button')
      .contains(/next|continue/i)
      .click();
    cy.wait(1000);
    // For simplicity, skip through steps (Assignment Category, Role, User)
    for (let i = 0; i < 3; i++) {
      cy.get('button')
        .contains(/next|continue/i)
        .click();
      cy.wait(500);
    }
    // On Finish step, submit
    cy.get('button')
      .contains(/create|save|finish/i)
      .click();
    // Verify success
    cy.url({ timeout: 15000 }).should('include', `/admin/${tenantId}/configurations/areas`);
    cy.contains(testData.name, { timeout: 10000 }).should('be.visible');
    cy.contains('success', { matchCase: false }).should('be.visible');
  });

  it('should validate required fields', () => {
    cy.visit(url);
    cy.wait(2000);
    // Try to submit without filling required fields
    cy.get('button')
      .contains(/next|continue/i)
      .click();
    // Should show validation error for name
    cy.contains('required', { matchCase: false }).should('be.visible');
  });
});
