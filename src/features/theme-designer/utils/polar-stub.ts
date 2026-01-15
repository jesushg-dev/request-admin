// Stub implementation for Polar SDK
// This is a temporary placeholder until the actual Polar SDK is configured
// Use this only for development/testing when Polar is not yet set up

interface PolarCheckoutParams {
  products: string[];
  customerId?: string;
  successUrl: string;
}

interface PolarCheckoutResponse {
  url: string;
  id: string;
}

interface PolarCustomerParams {
  email: string;
  externalId: string;
  name?: string;
}

interface PolarCustomer {
  id: string;
  email: string;
  externalId: string;
  name?: string;
}

export const polarStub = {
  checkouts: {
    create: async (_params: PolarCheckoutParams): Promise<PolarCheckoutResponse> => {
      console.warn("Polar stub: checkout.create called but Polar SDK is not configured");
      throw new Error("Polar integration not implemented. Please configure the Polar SDK.");
    },
  },
  customers: {
    getExternal: async (_params: { externalId: string }): Promise<PolarCustomer | null> => {
      console.warn("Polar stub: customers.getExternal called but Polar SDK is not configured");
      throw new Error("Polar integration not implemented. Please configure the Polar SDK.");
    },
    create: async (_params: PolarCustomerParams): Promise<PolarCustomer> => {
      console.warn("Polar stub: customers.create called but Polar SDK is not configured");
      throw new Error("Polar integration not implemented. Please configure the Polar SDK.");
    },
  },
};

