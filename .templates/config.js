// config.js

import { readFileSync, existsSync, unlinkSync, writeFileSync, mkdirSync } from 'fs';
import { dirname, join } from 'path';

const prismaScalarTypes = new Set(['String', 'Boolean', 'Int', 'BigInt', 'Float', 'Decimal', 'DateTime', 'Json', 'Bytes']);
const templatesDir = '.templates/templ';
const schemaPath = 'prisma/schema.prisma';
const appDir = 'src/app/[locale]/(protected)/admin';
const schema = /** @type {string} */ (readFileSync(schemaPath, 'utf8'));
const fieldsIgnore = ['createdAt', 'updatedAt', 'deletedAt', 'modifiedBy', 'tenantId'];
const excludeModels = [
  'Account',
  'Authenticator',
  'CategoryRequirement',
  'DocumentAssignment',
  'FormSubmission',
  'PasswordResetToken',
  'Permission',
  'RequestAssignment',
  'RequestState',
  'RequirementComplianceTracking',
  'RequirementServiceTypeAssociation',
  'RolePermission',
  'Session',
  'SubCategory',
  'TwoFactorConfirmation',
  'TwoFactorToken',
  'UserRole',
  'VerificationToken',
];

/** @type {(str: string) => string} */
const convertToCamelCase = (str) => str.charAt(0).toLowerCase() + str.slice(1);

/** @type {(str: string) => string} */
const convertToKebabCase = (str) => str.replace(/(.)([A-Z])/g, '$1-$2').toLowerCase();

/** @type {(str: string) => string} */
const convertToPascalCase = (str) => str.charAt(0).toUpperCase() + str.slice(1);

/** @type {(filePath: string, content: string | NodeJS.ArrayBufferView) => void} */
const writeFileSafely = (filePath, content) => {
  const directory = dirname(filePath);
  if (!existsSync(directory)) mkdirSync(directory, { recursive: true });
  if (existsSync(filePath)) unlinkSync(filePath);
  writeFileSync(filePath, content);
};

/** @type {(templateName: string) => string} */
const loadTemplate = (templateName) => {
  const templatePath = join(templatesDir, `${templateName}.templ`);
  return readFileSync(templatePath, 'utf8');
};

/** @type {(template: string, replacements: Record<string, string>) => string} */
const applyTemplate = (template, replacements) => {
  let output = template;
  for (const [key, value] of Object.entries(replacements)) {
    const regex = new RegExp(`\\$\\{${key}\\}`, 'g');
    output = output.replace(regex, value);
  }
  return output;
};

/**
 * Extracts fields from a Prisma model, excluding relations.
 * @param {string} modelName - The model name to extract fields from.
 * @returns {Array<{ fieldName: string, type: string, required: boolean }>}
 */
const extractModelFields = (modelName) => {
  const modelRegex = new RegExp(`model ${modelName} {([^}]*)}`, 's');
  const fieldRegex = /^\s*(\w+)\s+(\w+)(\?)?\s*(.*)$/gm;

  const modelMatch = modelRegex.exec(schema);
  if (!modelMatch) return [];

  const fields = [];
  let fieldMatch;

  while ((fieldMatch = fieldRegex.exec(modelMatch[1])) !== null) {
    const [, fieldName, type, optional, attributes] = fieldMatch;

    // Exclude fields that are relations: non-scalar types or those with @relation or []
    if (!prismaScalarTypes.has(type) || attributes.includes('@relation') || attributes === '[]' || fieldsIgnore.includes(fieldName)) continue;

    fields.push({ fieldName, type, required: !optional });
  }

  return fields;
};

/** Generates <ColumnDirective /> content based on model fields */
const generateColumnDirectives = (fields) => {
  return fields.map(({ fieldName }) => `<ColumnDirective field="${fieldName}" width="150" textAlign="Left" headerText={t('columns.${fieldName}.header')} />`).join('\n    ');
};

/** Generates <Input /> components content based on model fields */
const generateFormInputs = (fields) => {
  return fields
    .map((field) => {
      const { fieldName, type, required } = field;
      const inputType = type === 'Int' ? 'number' : 'text';
      return `<Input name="${fieldName}" type="${inputType}" register={register} formState={formState} label={t('inputs.${fieldName}.label')} placeholder={t('inputs.${fieldName}.placeholder')} ${required ? 'required' : ''} />`;
    })
    .join('\n    ');
};

/** Creates files for a given model */
const createFilesForModel = (modelName) => {
  const camelCaseName = convertToCamelCase(modelName);
  const kebabCaseName = convertToKebabCase(modelName);
  const pascalCaseName = convertToPascalCase(modelName);

  // Extract fields for the model
  const fields = extractModelFields(modelName);

  // Generate column directives and form inputs based on fields
  const columnsDirectiveContent = generateColumnDirectives(fields);
  const fieldsContent = generateFormInputs(fields);

  // Load templates and apply replacements
  const mainPageTemplate = loadTemplate('main-page');
  const newPageTemplate = loadTemplate('new-page');
  const updatePageTemplate = loadTemplate('update-page');

  const replacements = {
    modelName,
    camelCaseName,
    kebabCaseName,
    pascalCaseName,
    columnsDirectiveContent,
    fieldsContent,
  };

  const mainPageContent = applyTemplate(mainPageTemplate, replacements);
  const newPageContent = applyTemplate(newPageTemplate, replacements);
  const updatePageContent = applyTemplate(updatePageTemplate, replacements);

  writeFileSafely(`${appDir}/${kebabCaseName}/page.tsx`, mainPageContent);
  writeFileSafely(`${appDir}/${kebabCaseName}/new/page.tsx`, newPageContent);
  writeFileSafely(`${appDir}/${kebabCaseName}/[slug]/page.tsx`, updatePageContent);
};

// Extract model names from schema or command-line arguments
const tablesFromParam = /** @type {string[]} */ (process.argv.slice(2));
const modelNames = tablesFromParam.length > 0 ? tablesFromParam : /** @type {string[]} */ (schema.match(/model (\w+)/g)?.map((line) => line.split(' ')[1]) || []);

// Generate files for each model
modelNames.filter((modelName) => !excludeModels.includes(modelName)).forEach(createFilesForModel);
