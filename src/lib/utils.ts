import { clsx, type ClassValue } from 'clsx';
import { format, isToday, isYesterday } from 'date-fns';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const normalizeValue = (value: string | null | undefined) => {
  // Normalize the value to be undefined if it's an empty string or null
  return value === '' || value == null ? undefined : value;
};

export function formatDate(date: Date | string | number, opts: Intl.DateTimeFormatOptions = {}) {
  return new Intl.DateTimeFormat('en-US', {
    month: opts.month ?? 'long',
    day: opts.day ?? 'numeric',
    year: opts.year ?? 'numeric',
    ...opts,
  }).format(new Date(date));
}

export const formatDateLabel = (dateKey: string) => {
  const date = new Date(dateKey + 'T00:00:00');

  if (isToday(date)) return 'Today';
  if (isYesterday(date)) return 'Yesterday';

  return format(date, 'EEEE, MMMM d');
};

export function toSentenceCase(str: string) {
  return str
    .replace(/_/g, ' ')
    .replace(/([A-Z])/g, ' $1')
    .toLowerCase()
    .replace(/^\w/, (c) => c.toUpperCase())
    .replace(/\s+/g, ' ')
    .trim();
}

export function formatBytes(
  bytes: number,
  opts: {
    decimals?: number;
    sizeType?: 'accurate' | 'normal';
  } = {}
) {
  const { decimals = 0, sizeType = 'normal' } = opts;

  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const accurateSizes = ['Bytes', 'KiB', 'MiB', 'GiB', 'TiB'];
  if (bytes === 0) return '0 Byte';
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(decimals)} ${sizeType === 'accurate' ? (accurateSizes[i] ?? 'Bytes') : (sizes[i] ?? 'Bytes')}`;
}

/**
 * @see https://github.com/radix-ui/primitives/blob/main/packages/core/primitive/src/primitive.tsx
 */
export function composeEventHandlers<E>(originalEventHandler?: (event: E) => void, ourEventHandler?: (event: E) => void, { checkForDefaultPrevented = true } = {}) {
  return function handleEvent(event: E) {
    originalEventHandler?.(event);

    if (checkForDefaultPrevented === false || !(event as unknown as Event).defaultPrevented) {
      return ourEventHandler?.(event);
    }
  };
}

export const extractTenantId = (pathname: string, locales: readonly string[]) => {
  // Regex for routes with locales (e.g., /en/admin/[tenantId]/...)
  const tenantIdLocatedRegex = new RegExp(`^/(${locales.join('|')})/admin/([a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12})(/.*|$)`, 'i');

  // Regex for routes without locales (e.g., /admin/[tenantId]/...)
  const tenantIdRegex = new RegExp(`^/admin/([a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12})(/.*|$)`, 'i');

  // Try to extract tenantId from routes with locales
  const tenantIdLocatedMatch = pathname.match(tenantIdLocatedRegex);
  if (tenantIdLocatedMatch) {
    return tenantIdLocatedMatch[2]; // The tenantId is the second captured group
  }

  // Try to extract tenantId from routes without locales
  const tenantIdMatch = pathname.match(tenantIdRegex);
  if (tenantIdMatch) {
    return tenantIdMatch[1]; // The tenantId is the first captured group
  }

  // Return null if no tenantId is found
  return null;
};

/**
 * Converts text to slug format (lowercase, no spaces, only letters, numbers, and hyphens)
 */
export function toSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric characters with hyphens
    .replace(/^-+|-+$/g, ''); // Remove leading and trailing hyphens
}

export const TIME_THRESHOLD = 5;
export const BATCH_SIZE = 20;
