export interface FontInfo {
    family: string;
    category: string;
    variants: string[];
    subsets?: string[];
    variable?: boolean;
}

export interface GoogleFont {
    family: string;
    category: string;
    variants: string[];
}

export interface GoogleFontsAPIResponse {
    items: GoogleFont[];
}

export type FontCategory = "serif" | "sans-serif" | "display" | "handwriting" | "monospace";

export interface PaginatedFontsResponse {
  fonts: FontInfo[];
  total: number;
  page: number;
  perPage: number;
  hasMore?: boolean;
  offset?: number;
  limit?: number;
}
