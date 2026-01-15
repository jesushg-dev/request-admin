import { isEqual } from "lodash";

// Deep equality check using lodash isEqual
export function isDeepEqual(a: unknown, b: unknown): boolean {
  return isEqual(a, b);
}
