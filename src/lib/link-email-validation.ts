/**
 * Utility functions for email validation in link access
 * These are pure functions and don't need to be Server Actions
 */

export function parseEmailList(listString: string): string[] {
  if (!listString || listString.trim() === '') return [];
  try {
    // Try parsing as JSON first
    const parsed = JSON.parse(listString);
    if (Array.isArray(parsed)) {
      return parsed;
    }
  } catch {
    // If not JSON, treat as comma-separated
    return listString
      .split(',')
      .map((item) => item.trim())
      .filter((item) => item.length > 0);
  }
  return [];
}

function extractDomain(email: string): string {
  return email.split('@')[1]?.toLowerCase() || '';
}

export function isEmailAllowed(email: string, allowList: string[], denyList: string[]): { allowed: boolean; reason?: string } {
  const emailLower = email.toLowerCase();
  const domain = extractDomain(email);

  // Check deny list first
  for (const denied of denyList) {
    const deniedLower = denied.toLowerCase();
    // Check if email or domain is denied
    if (deniedLower === emailLower || deniedLower === `@${domain}` || deniedLower === domain) {
      return { allowed: false, reason: 'Your email or domain is not allowed to access this link' };
    }
  }

  // If allow list is empty, allow all (unless denied)
  if (allowList.length === 0) {
    return { allowed: true };
  }

  // Check allow list
  for (const allowed of allowList) {
    const allowedLower = allowed.toLowerCase();
    // Check if email or domain is allowed
    if (allowedLower === emailLower || allowedLower === `@${domain}` || allowedLower === domain) {
      return { allowed: true };
    }
  }

  return { allowed: false, reason: 'Your email or domain is not in the allowed list' };
}
