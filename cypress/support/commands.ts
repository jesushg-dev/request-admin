/// <reference types="cypress" />
import '@4tw/cypress-drag-drop';

// Handle uncaught exceptions
Cypress.on('uncaught:exception', (err, runnable) => {
  // returning false here prevents Cypress from failing the test
  if (err.message.includes("Cannot read properties of undefined (reading 'document')")) {
    return false;
  }
  // return true to fail the test on other errors
  return true;
});

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
      connectNodes(sourceSelector: string, targetSelector: string): Chainable<void>;
      addWorkflowNode(name: string, type: string, color?: string): Chainable<void>;
      moveWorkflowNode(name: string, offset: { x: number; y: number }): Chainable<void>;
      debugNodes(): Chainable<void>;
    }
  }
}

Cypress.Commands.add('loginIfNeeded', () => {
  cy.log('Starting login process...');
  cy.visit('/en/auth/login');
  cy.url().then((url) => {
    cy.log(`Current URL after visiting login: ${url}`);
    if (url.includes('/auth/login')) {
      cy.log('Login page detected, proceeding with login...');
      cy.get('input[type="email"]').type(Cypress.env('TEST_USER_EMAIL'));
      cy.get('input[type="password"]').type(Cypress.env('TEST_USER_PASSWORD'));
      cy.get('button[type="submit"]').click();
      cy.url().should('not.include', '/auth/login');
      cy.log('Login completed successfully');
    } else {
      cy.log('Already logged in or redirected');
    }
  });
});

Cypress.Commands.add('selectReactSelectOption', (selector: string, optionText: string) => {
  cy.get(selector).click().find('input').first().type(optionText, { force: true }).type('{enter}', { force: true });
});

Cypress.Commands.add('connectNodes', (sourceSelector, targetSelector) => {
  cy.get(sourceSelector).then(($source) => {
    const sourceRect = $source[0].getBoundingClientRect();
    const sourceX = sourceRect.x + sourceRect.width / 2;
    const sourceY = sourceRect.y + sourceRect.height / 2;

    cy.get(targetSelector).then(($target) => {
      const targetRect = $target[0].getBoundingClientRect();
      const targetX = targetRect.x + targetRect.width / 2;
      const targetY = targetRect.y + targetRect.height / 2;

      cy.wrap($source)
        .trigger('mousedown', {
          button: 0,
          clientX: sourceX,
          clientY: sourceY,
          force: true,
        })
        .trigger('mousemove', {
          button: 0,
          clientX: sourceX,
          clientY: sourceY,
          force: true,
        });

      cy.wrap($target)
        .trigger('mousemove', {
          button: 0,
          clientX: targetX,
          clientY: targetY,
          force: true,
        })
        .trigger('mouseup', { force: true });
    });
  });
});

Cypress.Commands.add('addWorkflowNode', (name, type, color = 'Gray') => {
  cy.log(`Adding workflow node: ${name} of type: ${type} and color: ${color}`);

  // If the add-state form is already open, skip clicking the add button
  cy.get('input[placeholder="Enter state name"]', { timeout: 2000 }).then(($in) => {
    if ($in.length) {
      cy.log('Add state form already open, skipping add button click');
    } else {
      // Try multiple ways to open the add-state form: test id, visible '+' button, or controls
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="add-node-button"]').length) {
          cy.get('[data-testid="add-node-button"]').click({ force: true });
        } else if ($body.find('button[aria-label*="add"]').length) {
          cy.get('button[aria-label*="add"]').first().click({ force: true });
        } else if ($body.find('button').filter((i, el) => el.innerText && el.innerText.trim() === '+').length) {
          cy.get('button')
            .filter((i, el) => el.innerText && el.innerText.trim() === '+')
            .first()
            .click({ force: true });
        } else if ($body.find('.react-flow__controls button').length) {
          cy.get('.react-flow__controls button').first().click({ force: true });
        } else {
          // Last resort: try clicking any small circle plus-looking control
          cy.get('button').then(($btns) => {
            const plus = Array.from($btns).find((b) => b.innerText && b.innerText.trim() === '+');
            if (plus) {
              cy.wrap(plus).click({ force: true });
            } else {
              throw new Error('Could not find add-node control to open the add state form');
            }
          });
        }
      });
    }
  });

  // Wait for the form to appear
  cy.get('input[placeholder="Enter state name"]').should('be.visible').clear().type(name);

  // Select the type
  cy.contains('label', 'Type').parent().find('.css-11vi78b-control').click();
  cy.get('.css-bio7mv-option').should('be.visible');
  cy.get('.css-bio7mv-option').contains(type).click();

  // Select the color
  cy.contains('label', 'Color').parent().find('.css-11vi78b-control').click();
  cy.get('.css-bio7mv-option').should('be.visible');
  cy.get('.css-bio7mv-option').contains(color).click();

  // Save the node
  cy.get('button')
    .contains(/^Save$/)
    .click();
  cy.get('input[placeholder="Enter state name"]').should('not.exist');
  cy.get(`[data-testid="workflow-node-${name.toLowerCase()}"]`, { timeout: 15000 }).should('exist');
  cy.get(`[data-testid="workflow-node-${name.toLowerCase()}"]`).should('be.visible');
  cy.log(`Successfully added node: ${name}`);
});

Cypress.Commands.add('moveWorkflowNode', (name, offset) => {
  cy.get(`[data-testid="workflow-node-${name.toLowerCase()}"]`).then(($node) => {
    const rect = $node[0].getBoundingClientRect();
    const centerX = rect.x + rect.width / 2;
    const centerY = rect.y + rect.height / 2;

    cy.wrap($node)
      .trigger('mousedown', {
        button: 0,
        clientX: centerX,
        clientY: centerY,
        force: true,
      })
      .trigger('mousemove', {
        button: 0,
        clientX: centerX + offset.x,
        clientY: centerY + offset.y,
        force: true,
      })
      .trigger('mouseup', { force: true });
  });
});

Cypress.Commands.add('debugNodes', () => {
  cy.log('=== Debugging Nodes ===');
  cy.get('[data-testid^="workflow-node-"]').then(($nodes) => {
    cy.log(`Found ${$nodes.length} nodes with workflow-node data-testid`);
    $nodes.each((index, node) => {
      cy.log(`Node ${index}: ${node.getAttribute('data-testid')}`);
    });
  });

  // Also check for any React Flow nodes
  cy.get('[data-testid^="rf__node-"]').then(($rfNodes) => {
    cy.log(`Found ${$rfNodes.length} React Flow nodes`);
    $rfNodes.each((index, node) => {
      cy.log(`RF Node ${index}: ${node.getAttribute('data-testid')}`);
    });
  });
});

export {};
