import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string | number, opts: Intl.DateTimeFormatOptions = {}) {
  return new Intl.DateTimeFormat('en-US', {
    month: opts.month ?? 'long',
    day: opts.day ?? 'numeric',
    year: opts.year ?? 'numeric',
    ...opts,
  }).format(new Date(date));
}

export function toSentenceCase(str: string) {
  return str
    .replace(/_/g, ' ')
    .replace(/([A-Z])/g, ' $1')
    .toLowerCase()
    .replace(/^\w/, (c) => c.toUpperCase())
    .replace(/\s+/g, ' ')
    .trim();
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
