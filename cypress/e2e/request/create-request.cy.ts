import { faker } from '@faker-js/faker';

describe('Crear nueva solicitud - E2E', () => {
  const baseUrl = 'http://127.0.0.1:3000';
  const tenantId = '2DA1FC13-1F87-4A5D-A64C-05823686A111';
  const url = `${baseUrl}/admin/${tenantId}/requests/new`;

  // Generate test data
  const testData = {
    issueSubject: faker.lorem.sentence(3),
    description: faker.lorem.paragraph(2),
  };

  before(() => {
    cy.loginIfNeeded();
  });

  it('flujo completo de creación de solicitud', () => {
    cy.visit(url);

    // Paso 1: Classification - manejo dinámico de selects
    // Esperar a que los selects estén disponibles
    cy.get('[id$="-form-item"] .css-11vi78b-control').should('exist');

    // Función mejorada para seleccionar una opción en un select específico
    const selectOption = (index) => {
      cy.get('[id$="-form-item"] .css-11vi78b-control').filter(':not([aria-disabled="true"])').eq(index).should('be.visible').click();

      cy.get('.css-100ebu3-menu', { timeout: 10000 }).should('be.visible');
      cy.get('.css-100ebu3-menu', { timeout: 10000 }).should('not.contain', 'Loading...');
      cy.get('.css-100ebu3-menu .css-bio7mv-option:not([aria-disabled="true"])', { timeout: 10000 }).should('exist');

      cy.get('.css-100ebu3-menu').within(() => {
        cy.get('.css-bio7mv-option').not('[aria-disabled="true"]').first().click();
      });
    };

    // Seleccionar cada uno de los 6 selectores en orden
    for (let i = 0; i < 6; i++) {
      selectOption(i);
      cy.wait(1000); // Esperar entre selecciones
    }

    // Verificar que el botón Next está habilitado antes de continuar
    cy.get('button').contains(/next/i).should('be.visible').should('not.be.disabled').click();

    // Paso 2: Compliance
    cy.contains('Compliance').should('exist');
    cy.get('button')
      .contains(/select all/i)
      .click({ force: true });
    cy.get('button').contains(/next/i).click();

    // Paso 3: Details
    cy.contains('Request Information').should('exist');
    cy.get('input[name="issueSubject"]').type(testData.issueSubject);
    cy.get('textarea[name="description"]').type(testData.description);

    // Seleccionar prioridad usando la misma lógica mejorada
    cy.get('[id$="-form-item"] .css-11vi78b-control').filter(':not([aria-disabled="true"])').should('be.visible').click();
    cy.get('.css-100ebu3-menu', { timeout: 10000 }).should('be.visible');
    cy.get('.css-100ebu3-menu', { timeout: 10000 }).should('not.contain', 'Loading...');
    cy.get('.css-100ebu3-menu .css-bio7mv-option:not([aria-disabled="true"])', { timeout: 10000 }).should('exist');
    cy.get('.css-100ebu3-menu').within(() => {
      cy.get('.css-bio7mv-option').not('[aria-disabled="true"]').first().click();
    });

    cy.get('button').contains(/next/i).click();

    // Paso 4: Attachments (opcional, puede saltarse si no es obligatorio)
    cy.contains('Attach Documents').should('exist');
    cy.get('button').contains(/next/i).click();

    // Paso 5: Forms - esperar a que se complete automáticamente si no hay formularios
    cy.get('body').then(($body) => {
      if ($body.text().includes('Forms')) {
        // Si hay formularios, esperar a que se complete el paso
        cy.contains('Forms').should('exist');
        // Esperar a que el paso se complete automáticamente o hacer click en Next si es necesario
        cy.get('button')
          .contains(/next|finish/i)
          .click();
      }
    });

    // Paso 6: Summary
    cy.contains('Summary').should('exist');

    cy.get('button')
      .contains(/Finish/i)
      .click();

    // Esperar a que la URL cambie (redirección), con timeout extendido
    cy.url({ timeout: 300000 }).should('not.eq', url);
  });
});
