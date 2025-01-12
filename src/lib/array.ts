type NestedKey = string;

export function getNestedValue<T>(obj: unknown, path: NestedKey): T | undefined {
  const keys = path.split('.');
  let result: unknown = obj;

  for (const key of keys) {
    if (result && typeof result === 'object' && key in result) {
      result = (result as { [key: string]: unknown })[key];
    } else {
      return undefined;
    }
  }

  return result as T;
}
