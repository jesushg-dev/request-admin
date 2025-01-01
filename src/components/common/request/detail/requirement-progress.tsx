import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';

interface TaskProgressProps {
  tasks: { id: number; description: string; completed: boolean }[];
}

export default function TaskProgress({ tasks }: TaskProgressProps) {
  const completedTasks = tasks.filter((task) => task.completed).length;
  const progress = (completedTasks / tasks.length) * 100;

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          Total Tasks ({completedTasks}/{tasks.length})
        </CardTitle>
        <CardDescription>Track the progress of project tasks</CardDescription>
      </CardHeader>
      <CardContent>
        <Progress value={progress} className="mb-4" />
        <div className="space-y-2">
          {tasks.map((task) => (
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
