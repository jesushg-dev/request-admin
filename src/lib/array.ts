type NestedKey = string;

export function getNestedValue<T>(obj: any, path: NestedKey): T | undefined {
  const keys = path.split('.');
  let result: any = obj;

  for (const key of keys) {
    if (result && typeof result === 'object' && key in result) {
      result = result[key];
    } else {
      return undefined;
    }
  }

  return result as T;
}
