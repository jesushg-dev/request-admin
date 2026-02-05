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

    // Toggle the public form checkbox (robust lookup with fallbacks)
    cy.contains(/Is public form/i, { timeout: 10000 }).then(($label) => {
      // Try common placements: input inside same parent, inside a label, or nearby
      const $parent = $label.parent();
      let $checkbox = $parent.find('input[type="checkbox"]');
      if ($checkbox.length) {
        cy.wrap($checkbox).check({ force: true });
        return;
      }

      // Try closest label ancestor
      $checkbox = $label.closest('label').find('input[type="checkbox"]');
      if ($checkbox.length) {
        cy.wrap($checkbox).check({ force: true });
        return;
      }

      // Try scanning the form for a checkbox with nearby text
      cy.get('form').then(($form) => {
        const $near = $form.find('input[type="checkbox"]').filter((i, el) => {
          // prefer checkboxes whose label text contains our phrase
          const id = el.getAttribute('id');
          if (!id) return false;
          const lbl = $form.find(`label[for="${id}"]`);
          return lbl.length && /Is public form/i.test(lbl.text());
        });
        if ($near.length) {
          cy.wrap($near.first()).check({ force: true });
          return;
        }

        // Fallback: check the first checkbox on the page (last resort)
        cy.get('input[type="checkbox"]')
          .first()
          .then(($fb) => {
            if ($fb.length) {
              cy.wrap($fb).check({ force: true });
            } else {
              // If no checkbox found, fail with helpful message
              throw new Error('Could not find the "Is public form" checkbox');
            }
          });
      });
    });

    // Submit the form
    cy.get('button').contains(/save/i).should('be.visible').click();

    // Should redirect to the form builder/editor
    cy.url({ timeout: 10000 }).should('match', new RegExp(`/admin/${tenantId}/form-designer/.+/edit`));

    // Check that the form name appears in the builder header
    cy.contains(testData.name).should('be.visible');
  });
});
