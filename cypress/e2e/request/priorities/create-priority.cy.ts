import { faker } from '@faker-js/faker';

function hexToRgb(hex: string) {
  const h = hex.replace('#', '');
  const bigint = parseInt(h, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgb(${r}, ${g}, ${b})`;
}

describe('Create new priority - E2E', () => {
  const tenantId = '2DA1FC13-1F87-4A5D-A64C-05823686A111';
  const url = `/en/admin/${tenantId}/configurations/priorities/new`;

  const testData = {
    name: faker.commerce.productName(),
    description: faker.lorem.sentence(8),
    level: faker.number.int({ min: 1, max: 10 }).toString(),
  };

  before(() => {
    cy.loginIfNeeded();
    cy.visit(url);
  });

  it('should create a new priority with all fields', () => {
    // Debug: Check current URL
    cy.url().then((url) => {
      cy.log(`Current URL: ${url}`);
    });

    // Debug: Check if we're on the right page
    cy.get('body').then(($body) => {
      cy.log(`Page title: ${$body.find('title').text()}`);
      cy.log(`Page content length: ${$body.text().length}`);
      cy.log(`Page HTML: ${$body.html().substring(0, 500)}`);
    });

    // Wait a bit for page to load
    cy.wait(3000);

    // Debug: Check for form elements
    cy.get('body').then(($body) => {
      cy.log(`Form elements found: ${$body.find('form').length}`);
      cy.log(`Input elements found: ${$body.find('input').length}`);
      cy.log(
        `All input placeholders: ${$body
          .find('input[placeholder]')
          .map((i, el) => el.getAttribute('placeholder'))
          .get()
          .join(', ')}`
      );
    });

    // Fill priority name
    cy.get('input[placeholder="Enter priority name"]').type(testData.name);

    // Fill description
    cy.get('textarea[placeholder="Enter priority description"]').type(testData.description);

    // Select color
    cy.get('input[type="color"]').invoke('val', '#ff0000').trigger('change');

    // Fill level
    cy.get('input[placeholder="Enter priority level"]').type(testData.level);

    // Toggle switches
    cy.contains('label', 'Default Priority').parents('div.space-y-2').find('button[role="switch"]').click({ force: true });
    cy.contains('label', 'Active').parents('div.space-y-2').find('button[role="switch"]').click({ force: true });

    // Submit form
    cy.get('button')
      .contains(/create|save/i)
      .click();

    // Verify success
    cy.url({ timeout: 15000 }).should('include', `/admin/${tenantId}/configurations/priorities`);
    cy.contains(testData.name, { timeout: 10000 }).should('be.visible');
    cy.contains('Priority created successfully').should('be.visible');
  });
});
