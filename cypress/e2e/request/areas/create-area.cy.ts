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
    cy.get('input[placeholder="Enter your name"], input[placeholder*="name" i]').first().type(testData.name);

    // Check if hierarchy field is enabled and interact with it if so
    cy.get('div')
      .contains('label', /hierarchy/i)
      .parent()
      .find('.css-11vi78b-control, .react-select__control')
      .then(($el: JQuery<HTMLElement>) => {
        // Check if the control is not disabled
        if (!$el.hasClass('is-disabled') && !$el.attr('aria-disabled')) {
          cy.wrap($el).click();
          cy.get('.css-bio7mv-option, .react-select__option').first().click();
        } else {
          // If disabled, just log that we're skipping it
          cy.log('Hierarchy field is disabled, skipping selection');
        }
      });

    // Fill description
    cy.get('textarea[placeholder*="description" i]').type(testData.description);

    // Toggle Active (if not already active)
    cy.get('button[role="switch"]').then(($switch) => {
      const isChecked = $switch.attr('aria-checked') === 'true';
      if (!isChecked) {
        cy.wrap($switch).click({ force: true });
      }
    });

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
    // Ensure we're logged in before visiting the page
    cy.loginIfNeeded();
    cy.visit(url);
    cy.wait(2000);

    // Verify we're on the correct page
    cy.url().should('include', '/configurations/areas/new');
    cy.contains('Area Details').should('be.visible');

    // Try to submit without filling required fields
    cy.get('button[type="submit"]')
      .contains(/next|continue/i)
      .click();

    // Should show validation error for name
    cy.contains('required', { matchCase: false }).should('be.visible');
  });
});
