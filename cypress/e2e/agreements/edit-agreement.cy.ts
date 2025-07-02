/// <reference types="cypress" />

import { faker } from '@faker-js/faker';

describe('Edit agreement - E2E', () => {
  const tenantId = '2DA1FC13-1F87-4A5D-A64C-05823686A111';
  const createUrl = `/en/admin/${tenantId}/links-and-documents/agreements/new`;
  let agreementId: string;
  let agreementName: string;

  before(() => {
    cy.loginIfNeeded();
    // Create a new agreement to edit
    agreementName = faker.company.name() + ' Agreement';
    cy.visit(createUrl);
    cy.wait(2000);
    cy.get('input[placeholder*="name" i]').type(agreementName);
    cy.get('textarea[placeholder*="content" i]').type(faker.lorem.sentence(10));
    cy.get('button')
      .contains(/create/i)
      .click();
    cy.url({ timeout: 15000 }).should('include', `/admin/${tenantId}/links-and-documents/agreements`);
    cy.contains(agreementName, { timeout: 10000 }).should('be.visible');
    // Get the agreement ID from the table row or link
    cy.get('tr')
      .contains(agreementName)
      .parent()
      .find('a[href*="/edit"]')
      .invoke('attr', 'href')
      .then((href) => {
        if (href) {
          agreementId = href.split('/').pop() || '';
        }
      });
  });

  it('should edit agreement with all fields', () => {
    const editUrl = `/en/admin/${tenantId}/links-and-documents/agreements/${agreementId}/edit`;
    cy.visit(editUrl);
    cy.wait(2000);
    const updatedData = {
      name: faker.company.name() + ' Updated',
      description: faker.lorem.sentence(10),
      content: faker.lorem.sentence(20),
    };
    cy.get('input[placeholder*="name" i]').clear().type(updatedData.name);
    cy.get('textarea[placeholder*="description" i]').clear().type(updatedData.description);
    cy.get('textarea[placeholder*="content" i]').clear().type(updatedData.content);
    // Toggle requireName
    cy.contains('label', /require name/i)
      .parents('div.space-y-2')
      .find('button[role="switch"]')
      .click({ force: true });
    cy.get('button')
      .contains(/update|save/i)
      .click();
    cy.url({ timeout: 15000 }).should('include', `/admin/${tenantId}/links-and-documents/agreements`);
    cy.contains(updatedData.name, { timeout: 10000 }).should('be.visible');
    cy.contains('success', { matchCase: false }).should('be.visible');
  });

  it('should validate required fields when editing', () => {
    const editUrl = `/en/admin/${tenantId}/links-and-documents/agreements/${agreementId}/edit`;
    cy.visit(editUrl);
    cy.wait(2000);
    cy.get('input[placeholder*="name" i]').clear();
    cy.get('textarea[placeholder*="content" i]').clear();
    cy.get('button')
      .contains(/update|save/i)
      .click();
    cy.contains('Name is required').should('be.visible');
    cy.contains('Content is required').should('be.visible');
  });

  it('should handle form validation for name/content length when editing', () => {
    const editUrl = `/en/admin/${tenantId}/links-and-documents/agreements/${agreementId}/edit`;
    cy.visit(editUrl);
    cy.wait(2000);
    cy.get('input[placeholder*="name" i]').clear().type('a'.repeat(201));
    cy.get('textarea[placeholder*="content" i]').clear().type('a'.repeat(501));
    cy.get('button')
      .contains(/update|save/i)
      .click();
    cy.contains('Name must be 200 characters or less').should('be.visible');
    cy.contains('Content must be 500 characters or less').should('be.visible');
  });

  it('should handle form validation for description length when editing', () => {
    const editUrl = `/en/admin/${tenantId}/links-and-documents/agreements/${agreementId}/edit`;
    cy.visit(editUrl);
    cy.wait(2000);
    cy.get('input[placeholder*="name" i]').clear().type(agreementName);
    cy.get('textarea[placeholder*="description" i]').clear().type('a'.repeat(501));
    cy.get('textarea[placeholder*="content" i]').clear().type(faker.lorem.sentence(10));
    cy.get('button')
      .contains(/update|save/i)
      .click();
    cy.contains('Description must be 500 characters or less').should('be.visible');
  });

  it('should update agreement with minimal required fields', () => {
    const editUrl = `/en/admin/${tenantId}/links-and-documents/agreements/${agreementId}/edit`;
    cy.visit(editUrl);
    cy.wait(2000);
    const minimalData = {
      name: faker.company.name() + ' Agreement',
      content: faker.lorem.sentence(5),
    };
    cy.get('input[placeholder*="name" i]').clear().type(minimalData.name);
    cy.get('textarea[placeholder*="content" i]').clear().type(minimalData.content);
    cy.get('button')
      .contains(/update|save/i)
      .click();
    cy.url({ timeout: 15000 }).should('include', `/admin/${tenantId}/links-and-documents/agreements`);
    cy.contains(minimalData.name, { timeout: 10000 }).should('be.visible');
  });

  it('should test requireName switch when editing', () => {
    const editUrl = `/en/admin/${tenantId}/links-and-documents/agreements/${agreementId}/edit`;
    cy.visit(editUrl);
    cy.wait(2000);
    cy.get('input[placeholder*="name" i]').clear().type(agreementName);
    cy.get('textarea[placeholder*="content" i]').clear().type(faker.lorem.sentence(10));
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

  it('should test form field labels and descriptions when editing', () => {
    const editUrl = `/en/admin/${tenantId}/links-and-documents/agreements/${agreementId}/edit`;
    cy.visit(editUrl);
    cy.wait(2000);
    cy.contains('label', 'Name').should('be.visible');
    cy.contains('label', 'Description').should('be.visible');
    cy.contains('label', 'Content').should('be.visible');
    cy.contains('label', 'Require Name').should('be.visible');
  });
});
