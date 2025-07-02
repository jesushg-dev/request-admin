/// <reference types="cypress" />

import { faker } from '@faker-js/faker';

describe('Create new agreement - E2E', () => {
  const tenantId = '2DA1FC13-1F87-4A5D-A64C-05823686A111';
  const url = `/en/admin/${tenantId}/links-and-documents/agreements/new`;

  const testData = {
    name: faker.company.name() + ' Agreement',
    description: faker.lorem.sentence(8),
    content: faker.lorem.paragraph(2),
  };

  before(() => {
    cy.loginIfNeeded();
    cy.visit(url);
  });

  it('should create a new agreement with all fields', () => {
    cy.wait(2000);
    cy.get('input[placeholder*="name" i]').type(testData.name);
    cy.get('textarea[placeholder*="description" i]').type(testData.description);
    cy.get('textarea[placeholder*="content" i]').type(testData.content);
    // Toggle requireName
    cy.contains('label', /require name/i)
      .parents('div.space-y-2')
      .find('button[role="switch"]')
      .click({ force: true });
    // Submit form
    cy.get('button')
      .contains(/create/i)
      .click();
    // Verify success
    cy.url({ timeout: 15000 }).should('include', `/admin/${tenantId}/links-and-documents/agreements`);
    cy.contains(testData.name, { timeout: 10000 }).should('be.visible');
    cy.contains('success', { matchCase: false }).should('be.visible');
  });

  it('should validate required fields', () => {
    cy.visit(url);
    cy.wait(2000);
    cy.get('button')
      .contains(/create/i)
      .click();
    cy.contains('Name is required').should('be.visible');
    cy.contains('Content is required').should('be.visible');
  });

  it('should handle form validation for name/content length', () => {
    cy.visit(url);
    cy.wait(2000);
    cy.get('input[placeholder*="name" i]').type('a'.repeat(201));
    cy.get('textarea[placeholder*="content" i]').type('a'.repeat(501));
    cy.get('button')
      .contains(/create/i)
      .click();
    cy.contains('Name must be 200 characters or less').should('be.visible');
    cy.contains('Content must be 500 characters or less').should('be.visible');
  });

  it('should handle form validation for description length', () => {
    cy.visit(url);
    cy.wait(2000);
    cy.get('input[placeholder*="name" i]').type(testData.name);
    cy.get('textarea[placeholder*="description" i]').type('a'.repeat(501));
    cy.get('textarea[placeholder*="content" i]').type(testData.content);
    cy.get('button')
      .contains(/create/i)
      .click();
    cy.contains('Description must be 500 characters or less').should('be.visible');
  });

  it('should create agreement with minimal required fields', () => {
    cy.visit(url);
    cy.wait(2000);
    const minimalData = {
      name: faker.company.name() + ' Agreement',
      content: faker.lorem.sentence(5),
    };
    cy.get('input[placeholder*="name" i]').type(minimalData.name);
    cy.get('textarea[placeholder*="content" i]').type(minimalData.content);
    cy.get('button')
      .contains(/create/i)
      .click();
    cy.url({ timeout: 15000 }).should('include', `/admin/${tenantId}/links-and-documents/agreements`);
    cy.contains(minimalData.name, { timeout: 10000 }).should('be.visible');
  });

  it('should test requireName switch', () => {
    cy.visit(url);
    cy.wait(2000);
    cy.get('input[placeholder*="name" i]').type(testData.name);
    cy.get('textarea[placeholder*="content" i]').type(testData.content);
    // Toggle requireName on and off
    cy.contains('label', /require name/i)
      .parents('div.space-y-2')
      .find('button[role="switch"]')
      .click({ force: true });
    cy.contains('label', /require name/i)
      .parents('div.space-y-2')
      .find('button[role="switch"]')
      .should('have.attr', 'data-state', 'checked');
    cy.contains('label', /require name/i)
      .parents('div.space-y-2')
      .find('button[role="switch"]')
      .click({ force: true });
    cy.contains('label', /require name/i)
      .parents('div.space-y-2')
      .find('button[role="switch"]')
      .should('have.attr', 'data-state', 'unchecked');
  });

  it('should test form field labels and descriptions', () => {
    cy.visit(url);
    cy.wait(2000);
    cy.contains('label', 'Name').should('be.visible');
    cy.contains('label', 'Description').should('be.visible');
    cy.contains('label', 'Content').should('be.visible');
    cy.contains('label', 'Require Name').should('be.visible');
  });
});
