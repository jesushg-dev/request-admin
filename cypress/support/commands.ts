/// <reference types="cypress" />
// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })
//
// declare global {
//   namespace Cypress {
//     interface Chainable {
//       login(email: string, password: string): Chainable<void>
//       drag(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
//       dismiss(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
//       visit(originalFn: CommandOriginalFn, url: string, options: Partial<VisitOptions>): Chainable<Element>
//     }
//   }
// }

declare global {
  namespace Cypress {
    interface Chainable {
      loginIfNeeded(): void;
      selectReactSelectOption(selector: string, optionText: string): Chainable<void>;
    }
  }
}

Cypress.Commands.add('loginIfNeeded', () => {
  cy.visit('/auth/login');
  cy.url().then((url) => {
    if (url.includes('/auth/login')) {
      cy.get('input[type="email"]').type(Cypress.env('TEST_USER_EMAIL'));
      cy.get('input[type="password"]').type(Cypress.env('TEST_USER_PASSWORD'));
      cy.get('button[type="submit"]').click();
      cy.url().should('not.include', '/auth/login');
    }
  });
});

Cypress.Commands.add('selectReactSelectOption', (selector: string, optionText: string) => {
  cy.get(selector).click().find('input').first().type(optionText, { force: true }).type('{enter}', { force: true });
});

export {};
