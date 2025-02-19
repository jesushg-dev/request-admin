import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface RequestActivitiesProps {
  activities: { id: number; date: string; title: string; description: string }[];
}

export default function RequestActivities({ activities }: RequestActivitiesProps) {
  return (
    <Card className="flex-1 flex flex-col">
      <CardHeader>
        <CardTitle>Project Activities</CardTitle>
        <CardDescription>Recent activities and updates</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex-col flex">
        <ul className="relative space-y-4 before:absolute before:top-2 before:bottom-2 before:left-2 before:w-0.5 before:bg-gray-200">
          {activities.map((activity) => (
            <li
              key={activity.id}
              className="relative ml-6 flex flex-col space-y-1 before:absolute before:top-2 before:left-[-1.625rem] before:h-3 before:w-3 before:rounded-full before:border-2 before:border-gray-300 before:bg-white">
              <span className="text-muted-foreground text-sm">{activity.date}</span>
              <span className="font-medium">{activity.title}</span>
              <p className="text-muted-foreground text-sm">{activity.description}</p>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
