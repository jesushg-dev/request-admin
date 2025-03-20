import { type ReactNode } from 'react';
import { type LucideIcon } from 'lucide-react';

import { Hint } from '../hint';
import { Badge } from '../ui/badge';

export const TruncatedText = ({ text, maxLength }: { text?: string; maxLength: number }) => (
  <Hint label={text || ''}>
    <div className="text-sm truncate">{text && text.length > maxLength ? `${text.slice(0, maxLength)}...` : text}</div>
  </Hint>
);

export const MetricBadge = ({ icon: Icon, value }: { icon: LucideIcon; value: ReactNode }) => (
  <Badge variant="outline" className="gap-1">
    <Icon className="h-4 w-4" />
    {value}
  </Badge>
);
