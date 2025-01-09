import { v4 as uuidv4 } from 'uuid';

export const generateUuid = (): string => {
  return uuidv4();
};

export const UNSTABLE_TENANT_ID = '2DA1FC13-1F87-4A5D-A64C-05823686A111';

// Define the input type for assignation categories
export type AssignationCategoryInput = {
  name: string;
  description?: string;
  subcategories?: AssignationCategoryInput[];
};
