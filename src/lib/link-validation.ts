export type ValidationStep = 'password' | 'email' | 'emailVerification' | 'agreement' | 'customFields' | 'complete';

export interface ValidationConfig {
  hasPassword: boolean;
  hasEmailProtection: boolean;
  hasEmailAuthentication: boolean;
  hasAgreement: boolean;
  hasCustomFields: boolean;
}

/**
 * Determines the next step in the validation flow based on the current step and validation requirements
 */
export function getNextStep(currentStep: ValidationStep, config: ValidationConfig): ValidationStep {
  switch (currentStep) {
    case 'password':
      // After password, check email protection
      if (config.hasEmailProtection) {
        return 'email';
      }
      // Then check agreement
      if (config.hasAgreement) {
        return 'agreement';
      }
      // Then check custom fields
      if (config.hasCustomFields) {
        return 'customFields';
      }
      // No more validations needed
      return 'complete';

    case 'email':
      // After email, check agreement
      if (config.hasAgreement) {
        return 'agreement';
      }
      // Then check custom fields
      if (config.hasCustomFields) {
        return 'customFields';
      }
      // No more validations needed
      return 'complete';

    case 'agreement':
      // After agreement, check custom fields
      if (config.hasCustomFields) {
        return 'customFields';
      }
      // No more validations needed
      return 'complete';

    case 'customFields':
      // After custom fields, we're done
      return 'complete';

    case 'complete':
      return 'complete';

    default:
      return 'complete';
  }
}

/**
 * Determines the initial step based on validation requirements
 */
export function getInitialStep(config: ValidationConfig): ValidationStep {
  if (config.hasPassword) {
    return 'password';
  }
  if (config.hasEmailProtection) {
    return 'email';
  }
  if (config.hasAgreement) {
    return 'agreement';
  }
  if (config.hasCustomFields) {
    return 'customFields';
  }
  // No validations needed
  return 'complete';
}
