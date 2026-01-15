export interface SubscriptionStatus {
  isSubscribed: boolean;
  requestsRemaining: number;
  plan?: string;
}

export interface SubscriptionCheck {
  hasSubscription: boolean;
  requestsRemaining: number;
  canProceed?: boolean;
  requestsUsed?: number;
  error?: string;
}

