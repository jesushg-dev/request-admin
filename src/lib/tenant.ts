import { cookies } from 'next/headers';

function getBaseUrl() {
  if (typeof window !== 'undefined') return window.location.origin;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return `http://localhost:${process.env.PORT ?? 3000}`;
}

async function getCookies() {
  const _cookies = await cookies();
  return _cookies?.toString() ?? '';
}

export async function getTenantsForUser() {
  const response = await fetch(`${getBaseUrl()}/api/tenants`, {
    method: 'GET',
    headers: {
      Cookie: await getCookies(), // Forward cookies to the API
    },
  });

  if (!response.ok) {
    throw new Error('Failed to get tenants for user');
  }

  const data = await response.json();
  return data.tenants;
}

export async function validateTenantId(tenantId: string | undefined): Promise<boolean> {
  if (!tenantId) return false;

  const response = await fetch(`${getBaseUrl()}/api/tenants/validate`, {
    method: 'POST',
    body: JSON.stringify({ tenantId }),
    headers: {
      Cookie: await getCookies(), // Forward cookies to the API
    },
  });

  if (!response.ok) {
    return false;
  }

  const data = await response.json();
  return data.isValid;
}
