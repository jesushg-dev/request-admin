import { faker } from '@faker-js/faker';

describe('Create new request - E2E', () => {
  const tenantId = '2DA1FC13-1F87-4A5D-A64C-05823686A111';
  const url = `/admin/${tenantId}/requests/new`;

  // Generate test data
  const testData = {
    issueSubject: faker.lorem.sentence(3),
    description: faker.lorem.paragraph(2),
  };

  before(() => {
    cy.loginIfNeeded();
  });

  it('complete flow for creating a request', () => {
    cy.visit(url);

    // Step 1: Classification - dynamic selects
    cy.get('[id$="-form-item"] .css-11vi78b-control').should('exist');

    const selectOption = (index) => {
      cy.get('[id$="-form-item"] .css-11vi78b-control').filter(':not([aria-disabled="true"])').eq(index).should('be.visible').click();
      cy.get('.css-100ebu3-menu', { timeout: 10000 }).should('be.visible');
      cy.get('.css-100ebu3-menu', { timeout: 10000 }).should('not.contain', 'Loading...');
      cy.get('.css-100ebu3-menu .css-bio7mv-option:not([aria-disabled="true"])', { timeout: 10000 }).should('exist');
      cy.get('.css-100ebu3-menu').within(() => {
        cy.get('.css-bio7mv-option').not('[aria-disabled="true"]').first().click();
      });
    };

    for (let i = 0; i < 6; i++) {
      selectOption(i);
      cy.wait(1000);
    }

    cy.get('button').contains(/next/i).should('be.visible').should('not.be.disabled').click();

    // Step 2: Compliance
    cy.contains('Compliance').should('exist');
    cy.get('button')
      .contains(/select all/i)
      .click({ force: true });
    cy.get('button').contains(/next/i).click();

    // Step 3: Details
    cy.contains('Request Information').should('exist');
    cy.get('input[name="issueSubject"]').type(testData.issueSubject);
    cy.get('textarea[name="description"]').type(testData.description);

    cy.get('[id$="-form-item"] .css-11vi78b-control').filter(':not([aria-disabled="true"])').should('be.visible').click();
    cy.get('.css-100ebu3-menu', { timeout: 10000 }).should('be.visible');
    cy.get('.css-100ebu3-menu', { timeout: 10000 }).should('not.contain', 'Loading...');
    cy.get('.css-100ebu3-menu .css-bio7mv-option:not([aria-disabled="true"])', { timeout: 10000 }).should('exist');
    cy.get('.css-100ebu3-menu').within(() => {
      cy.get('.css-bio7mv-option').not('[aria-disabled="true"]').first().click();
    });

    cy.get('button').contains(/next/i).click();

    // Step 4: Attachments
    cy.contains('Attach Documents').should('exist');
    cy.get('button').contains(/next/i).click();

    // Step 5: Forms
    cy.get('body').then(($body) => {
      if ($body.text().includes('Forms')) {
        cy.contains('Forms').should('exist');
        cy.get('button')
          .contains(/next|finish/i)
          .click();
      }
    });

    // Step 6: Summary
    cy.contains('Summary').should('exist');
    cy.get('button')
      .contains(/Finish/i)
      .click();
    cy.url({ timeout: 300000 }).should('not.eq', url);
  });
});
