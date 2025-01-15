import Link from 'next/link';
import { ArrowDownIcon, ArrowRightIcon, ArrowUpIcon, PlusCircleIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface StatsCardProps {
  title: string;
  value: string;
  description: string;
  trend?: 'increase' | 'decrease' | 'no-change';
  trendValue?: string;
  addLink: string;
  viewLink: string;
}

export function StatsCard({ title, value, description, trend, trendValue, addLink, viewLink }: StatsCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4 pb-0">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {trend === 'increase' && <ArrowUpIcon className="h-4 w-4 text-green-500" />}
        {trend === 'decrease' && <ArrowDownIcon className="h-4 w-4 text-red-500" />}
        {trend === 'no-change' && <ArrowRightIcon className="h-4 w-4 text-yellow-500" />}
      </CardHeader>
      <CardContent className="p-4">
        <div className="flex items-end justify-between">
          <div className="flex flex-col">
            <div className="text-2xl font-bold">{value}</div>
            <Link href={viewLink} className="text-xs text-muted-foreground hover:underline">
              {description}
            </Link>
            {trendValue && (
              <p className={`mt-1 text-xs ${trend === 'increase' ? 'text-green-500' : trend === 'decrease' ? 'text-red-500' : 'text-yellow-500'}`}>
                {trend === 'increase' ? '+' : trend === 'decrease' ? '-' : ''}
                {trendValue} from last period
              </p>
            )}
          </div>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" asChild>
            <Link href={addLink}>
              <PlusCircleIcon className="h-4 w-4" />
              <span className="sr-only">Add</span>
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
