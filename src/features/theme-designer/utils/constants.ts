export const AI_PROMPT_CHARACTER_LIMIT = 500;

export const DEBOUNCE_DELAY = 50;

export const AI_REQUEST_FREE_TIER_LIMIT = 5;

export const MAX_IMAGE_FILES = 2;
export const MAX_IMAGE_FILE_SIZE = 4 * 1024 * 1024; // 4MB
export const MAX_SVG_FILE_SIZE = 1 * 1024 * 1024; // 1MB

export const MAX_FREE_THEMES = 10;

type Feature = {
  description: string;
  status: "done" | "pending";
};

export const FREE_SUB_FEATURES: Feature[] = [
  { description: "Full theme customization", status: "done" },
  { description: `${AI_REQUEST_FREE_TIER_LIMIT} AI generated themes`, status: "done" },
  { description: `Save and share up to ${MAX_FREE_THEMES} themes`, status: "done" },
  { description: "Import theme using CSS variables", status: "done" },
  { description: "Export theme via CSS variables", status: "done" },
  { description: "Export theme via Shadcn Registry Command", status: "done" },
  { description: "Contrast checker", status: "done" },
];

export const PRO_SUB_FEATURES: Feature[] = [
  { description: "Save and share unlimited themes", status: "done" },
  { description: "Unlimited AI generated themes", status: "done" },
  { description: "Generate themes from images using AI", status: "done" },
  { description: "Priority support", status: "done" },
  { description: "Save your own fonts and colors", status: "pending" },
];