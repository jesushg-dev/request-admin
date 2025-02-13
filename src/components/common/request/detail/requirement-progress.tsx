import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';

interface RequirementProgressProps {
  isLoading?: boolean;
  requirements: { id: string; description: string; completed: boolean }[];
}

export default function RequirementProgress({ requirements, isLoading }: RequirementProgressProps) {
  const completedRequirements = requirements.filter((task) => task.completed).length;
  const progress = (completedRequirements / requirements.length) * 100;

  if (isLoading) {
    return <Skeleton className="h-40" />;
  }

  return (
    <Card className="flex-1">
      <CardHeader>
        <CardTitle>
          Total Requirements ({completedRequirements}/{requirements.length})
        </CardTitle>
        <CardDescription>Track the progress of request requirements</CardDescription>
      </CardHeader>
      <CardContent>
        <Progress value={progress} className="mb-4" />
        <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-2">
          {requirements.map((task) => (
            <div key={task.id} className="flex items-center space-x-2">
              <Checkbox id={`task-${task.id}`} checked={task.completed} />
              <label htmlFor={`task-${task.id}`} className="text-sm">
                {task.description}
              </label>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
