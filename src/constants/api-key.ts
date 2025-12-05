const ONE_DAY_SECONDS = 60 * 60 * 24;

export const API_KEY_EXPIRATION_SECONDS = {
  '7d': ONE_DAY_SECONDS * 7,
  '30d': ONE_DAY_SECONDS * 30,
  '90d': ONE_DAY_SECONDS * 90,
  '1y': ONE_DAY_SECONDS * 365,
  never: undefined,
} as const;

export type ApiKeyExpirationOption = keyof typeof API_KEY_EXPIRATION_SECONDS;

export const resolveExpiresInSeconds = (option: ApiKeyExpirationOption) => {
  const value = API_KEY_EXPIRATION_SECONDS[option];
  if (typeof value === 'number') {
    return Math.max(value, ONE_DAY_SECONDS);
  }
  return undefined;
};

export const normalizeRecord = <T extends Record<string, unknown> | null | undefined>(value: T) => {
  if (!value) return undefined;
  if (Object.keys(value).length === 0) return undefined;
  return value;
};

export const normalizeNumber = (value?: number | null) => {
  if (typeof value !== 'number' || Number.isNaN(value)) return undefined;
  return value;
};
