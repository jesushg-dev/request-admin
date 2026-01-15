import "server-only";

import { logError } from "@/features/theme-designer/utils/shared";
import { Customer } from "@polar-sh/sdk/models/components/customer.js";
import { User } from "better-auth";

export const getOrCreateCustomer = async (user: User) => {
  // TODO: Replace with actual Polar SDK import when configured
  // import { polar } from "@/lib/polar";
  const { polarStub: polar } = await import("@/features/theme-designer/utils/polar-stub");
  
  let customer: Customer | null = null;

  try {
    customer = await polar.customers.getExternal({ externalId: user.id });
  } catch (_e) {
    customer = null;
  }

  if (customer) return customer;

  try {
    const newCustomer = await polar.customers.create({
      email: user.email,
      externalId: user.id,
      name: user.name,
    });

    return newCustomer;
  } catch (err) {
    logError(err as Error, { action: "createCustomer", user });
  }

  return null;
};
