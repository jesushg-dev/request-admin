'use client';

import { useFindManyRequirement } from '@/services/api/hooks';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import EmptyState from '@/components/shared/empty-state';

interface RequirementProgressProps {
  tenantId: string;
  requirementCompliances?: Record<string, boolean>;
}

export default function RequirementProgress({ tenantId, requirementCompliances }: RequirementProgressProps) {
  const { data, isLoading } = useFindManyRequirement(
    {
      select: { id: true, name: true },
      where: { id: { in: Object.keys(requirementCompliances || {}) }, tenantId },
    },
    { enabled: !!requirementCompliances }
  );

  if (isLoading) {
    return <Skeleton className="h-40" />;
  }

  if (!data || !requirementCompliances) {
    return <EmptyState title="No requirements available" description="No requirements found for this request." />;
  }

  const requirements = data.map((requirement) => ({
    id: requirement.id,
    description: requirement.name,
    completed: requirementCompliances?.[requirement.id] || false,
  }));
  const completedRequirements = data.filter((requirement) => requirementCompliances[requirement.id]).length;
  const progress = (completedRequirements / data.length) * 100;

  return (
    <Card className="flex-1 flex flex-col">
      <CardHeader>
        <CardTitle>
          Total Requirements ({completedRequirements}/{data.length})
        </CardTitle>
        <CardDescription>Track the progress of request requirements</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex-col flex">
        <Progress value={progress} className="mb-4" />
        <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-2">
          {requirements.map((requirement) => (
            <div key={requirement.id} className="flex items-center space-x-2">
              <Checkbox id={`requirement-${requirement.id}`} checked={requirement.completed} />
              <label htmlFor={`requirement-${requirement.id}`} className="text-sm">
                {requirement.description}
              </label>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
