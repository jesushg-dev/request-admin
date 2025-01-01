import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface ProjectActivitiesProps {
  activities: { id: number; date: string; title: string; description: string }[];
}

export default function ProjectActivities({ activities }: ProjectActivitiesProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Project Activities</CardTitle>
        <CardDescription>Recent activities and updates</CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="relative space-y-4 before:absolute before:bottom-2 before:left-2 before:top-2 before:w-0.5 before:bg-gray-200">
          {activities.map((activity) => (
            <li
              key={activity.id}
              className="relative ml-6 flex flex-col space-y-1 before:absolute before:left-[-1.625rem] before:top-2 before:h-3 before:w-3 before:rounded-full before:border-2 before:border-gray-300 before:bg-white">
              <span className="text-sm text-muted-foreground">{activity.date}</span>
              <span className="font-medium">{activity.title}</span>
              <p className="text-sm text-muted-foreground">{activity.description}</p>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
