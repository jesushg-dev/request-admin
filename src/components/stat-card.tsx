import Link from 'next/link';
import { PlusCircleIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import { Skeleton } from './ui/skeleton';

interface StatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  addLink?: string;
  viewLink?: string;
  icon?: React.ReactNode;
  loading?: boolean;
}

function StatCard({ loading, title, value, description, icon, addLink, viewLink }: StatsCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4 pb-0">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent className="p-4">
        <div className="flex items-end justify-between">
          <div className="flex flex-col">
            <div className="text-2xl font-bold">
              {loading && (
                <Skeleton>
                  <span className="opacity-0">0</span>
                </Skeleton>
              )}
              {!loading && value}
            </div>

            {viewLink ? (
              <Link href={viewLink} className="text-muted-foreground text-xs hover:underline">
                {description}
              </Link>
            ) : (
              description && <span className="text-muted-foreground text-xs">{description}</span>
            )}
          </div>
          {addLink && (
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" asChild>
              <Link href={addLink}>
                <PlusCircleIcon className="h-4 w-4" />
                <span className="sr-only">Add</span>
              </Link>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default StatCard;
