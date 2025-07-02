# Requirement & Requirement Type E2E Tests

This directory contains comprehensive end-to-end tests for the requirement and requirement type management functionality.

## Test Files

### Requirements Tests

#### 1. `create-requirement.cy.ts`

Tests for creating new requirements:

- ✅ Create requirement with all fields
- ✅ Validate required fields
- ✅ Form validation for name length (max 200 chars)
- ✅ Form validation for description length (max 500 chars)
- ✅ Create requirement with minimal fields
- ✅ Test switch toggles functionality
- ✅ Handle empty description field

#### 2. `edit-requirement.cy.ts`

Tests for editing existing requirements:

- ✅ Edit requirement with all fields
- ✅ Validate required fields when editing
- ✅ Form validation for name length when editing
- ✅ Form validation for description length when editing
- ✅ Update requirement with minimal changes
- ✅ Handle non-existent requirement ID
- ✅ Preserve existing data when canceling edits

#### 3. `requirement-workflow.cy.ts`

Comprehensive workflow tests:

- ✅ Navigate to requirements list and verify page structure
- ✅ Create requirement and verify it appears in list
- ✅ Edit created requirement
- ✅ Search and filter requirements
- ✅ Handle form validation errors
- ✅ Test requirement type selection
- ✅ Test checkbox toggles (Active, One-time required)
- ✅ Test responsive behavior
- ✅ Handle network errors gracefully

### Requirement Types Tests

#### 4. `create-requirement-type.cy.ts`

Tests for creating new requirement types:

- ✅ Create requirement type with all fields
- ✅ Validate required fields
- ✅ Form validation for name length (max 100 chars)
- ✅ Form validation for description length (max 500 chars)
- ✅ Create requirement type with minimal fields
- ✅ Test switch toggles functionality
- ✅ Handle empty description field

#### 5. `edit-requirement-type.cy.ts`

Tests for editing existing requirement types:

- ✅ Edit requirement type with all fields
- ✅ Validate required fields when editing
- ✅ Form validation for name length when editing
- ✅ Form validation for description length when editing
- ✅ Update requirement type with minimal changes
- ✅ Handle non-existent requirement type ID
- ✅ Test switch states when editing
- ✅ Preserve existing data when canceling edits

#### 6. `requirement-type-workflow.cy.ts`

Comprehensive workflow tests for requirement types:

- ✅ Navigate to requirement types list and verify page structure
- ✅ Create requirement type and verify it appears in list
- ✅ Edit created requirement type
- ✅ Search and filter requirement types
- ✅ Handle form validation errors
- ✅ Test switch toggles functionality
- ✅ Test responsive behavior
- ✅ Handle network errors gracefully
- ✅ Test optional description field
- ✅ Test form field descriptions and labels
- ✅ Test form submission with different switch combinations

## Prerequisites

1. **Environment Setup**: Ensure your Cypress environment is properly configured
2. **Test Data**: The tests require existing requirement types in the database for requirement tests
3. **Authentication**: Tests use the `loginIfNeeded()` command from `cypress/support/commands.ts`
4. **Tenant ID**: Tests use a specific tenant ID (`2DA1FC13-1F87-4A5D-A64C-05823686A111`)

## Running the Tests

### Run all requirement and requirement type tests:

```bash
npx cypress run --spec "cypress/e2e/request/*requirement*.cy.ts"
```

### Run specific test categories:

```bash
# Requirement tests only
npx cypress run --spec "cypress/e2e/request/create-requirement.cy.ts,cypress/e2e/request/edit-requirement.cy.ts,cypress/e2e/request/requirement-workflow.cy.ts"

# Requirement type tests only
npx cypress run --spec "cypress/e2e/request/create-requirement-type.cy.ts,cypress/e2e/request/edit-requirement-type.cy.ts,cypress/e2e/request/requirement-type-workflow.cy.ts"
```

### Run specific test file:

```bash
# Create requirement tests
npx cypress run --spec "cypress/e2e/request/create-requirement.cy.ts"

# Edit requirement tests
npx cypress run --spec "cypress/e2e/request/edit-requirement.cy.ts"

# Workflow tests
npx cypress run --spec "cypress/e2e/request/requirement-workflow.cy.ts"

# Create requirement type tests
npx cypress run --spec "cypress/e2e/request/create-requirement-type.cy.ts"

# Edit requirement type tests
npx cypress run --spec "cypress/e2e/request/edit-requirement-type.cy.ts"

# Requirement type workflow tests
npx cypress run --spec "cypress/e2e/request/requirement-type-workflow.cy.ts"
```

### Run tests in interactive mode:

```bash
npx cypress open
# Then select the test files from the Cypress Test Runner
```

## Test Data

The tests use `@faker-js/faker` to generate realistic test data:

- **Names**: Generated using `faker.commerce.productName()`
- **Descriptions**: Generated using `faker.lorem.sentence()`
- **IDs**: Generated using `faker.string.uuid()` when needed

## Form Fields Tested

### Requirements Form:

#### Required Fields:

- **Name**: Text input (max 200 characters)
- **Description**: Textarea (max 500 characters)
- **Requirement Type**: Dropdown selection

#### Optional Fields:

- **Active**: Toggle switch
- **Mark as one-time required requirement**: Toggle switch

### Requirement Types Form:

#### Required Fields:

- **Name**: Text input (max 100 characters)

#### Optional Fields:

- **Description**: Textarea (max 500 characters)
- **Active**: Toggle switch
- **Default**: Toggle switch

## Validation Rules Tested

### Requirements:

1. **Required Field Validation**:
   - Name is required
   - Description is required
   - Requirement Type is required

2. **Length Validation**:
   - Name: 1-200 characters
   - Description: 1-500 characters

### Requirement Types:

1. **Required Field Validation**:
   - Name is required

2. **Length Validation**:
   - Name: 1-100 characters
   - Description: 0-500 characters (optional)

3. **Form Submission**:
   - Success redirects to appropriate list page
   - Error messages are displayed appropriately

## Page URLs Tested

### Requirements:

- **List Page**: `/en/admin/{tenantId}/configurations/requirements`
- **Create Page**: `/en/admin/{tenantId}/configurations/requirements/new`
- **Edit Page**: `/en/admin/{tenantId}/configurations/requirements/{id}/edit`

### Requirement Types:

- **List Page**: `/en/admin/{tenantId}/configurations/requirement-types`
- **Create Page**: `/en/admin/{tenantId}/configurations/requirement-types/new`
- **Edit Page**: `/en/admin/{tenantId}/configurations/requirement-types/{id}/edit`

## Important Notes

### Requirement Type Form Redirect Issue

The requirement type form currently redirects to the priorities page instead of the requirement types page after successful submission. This is noted in the tests and should be addressed in the application code.

### Switch Components

Both forms use Switch components for boolean fields. The tests verify the `data-state` attribute to ensure proper functionality.

## Common Issues and Solutions

### 1. Requirement Type Not Found

**Issue**: Tests fail because no requirement types exist in the database
**Solution**: Ensure requirement types are seeded in the test database

### 2. Authentication Issues

**Issue**: Tests fail due to login problems
**Solution**: Check that `Cypress.env('TEST_USER_EMAIL')` and `Cypress.env('TEST_USER_PASSWORD')` are set

### 3. Slow Loading

**Issue**: Tests timeout waiting for page elements
**Solution**: Increase `cy.wait()` times or add more specific element waits

### 4. Switch Component Issues

**Issue**: Switch toggles not working as expected
**Solution**: The tests use `data-state` attribute verification - update if the component library changes

### 5. Redirect Issues

**Issue**: Requirement type form redirects to wrong page
**Solution**: Update the form's success redirect logic in the application code

## Maintenance

### Updating Selectors

If the UI components change, update the following selectors:

#### Requirements:

- Input placeholders: `"Name"`, `"Description"`
- Button text: `/create/i`, `/update/i`
- Label text: `"Active"`, `"Mark as one-time required requirement"`
- React Select classes: `.css-11vi78b-control`, `.css-bio7mv-option`

#### Requirement Types:

- Input placeholders: `"Enter the name"`, `"Enter the description"`
- Button text: `/create/i`, `/update/i`
- Label text: `"Active"`, `"Default"`
- Switch attributes: `data-state="checked"`, `data-state="unchecked"`

### Adding New Tests

When adding new tests:

1. Follow the existing naming convention
2. Use faker for test data generation
3. Include proper error handling
4. Add appropriate timeouts for async operations
5. Document any new validation rules or form fields
6. Test both success and error scenarios

## Dependencies

- `@faker-js/faker`: For generating test data
- `@4tw/cypress-drag-drop`: For drag and drop functionality (if needed)
- Custom commands from `cypress/support/commands.ts`
