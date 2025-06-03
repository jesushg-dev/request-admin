import { useFormatter, useNow } from 'next-intl';

// Custom hook that returns both now and format
export function useFormatTime() {
  const now = useNow();
  const format = useFormatter();
  return { now, format };
}
