export { usePlanInfoSchema, createPlanInfoSchema, getPlanInfoSchema, type TPlanInfoSchema } from './plan-info.schema';
export { usePlanFeatureSchema, createPlanFeatureSchema, getPlanFeatureSchema, type TPlanFeatureSchema } from './plan-feature.schema';

// Plan branding schema type
export type TPlanBrandingSchema = {
  primaryColor?: string;
  secondaryColor?: string;
};

// Plan selection schema type
export type TPlanSelectionSchema = {
  planId?: string;
};
