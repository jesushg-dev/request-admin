import { db } from '@/server/db-server';

import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import RequestTypeForm from '@/components/common/request-type/request-type-form';

export default async function NewRequestTypeNew() {
  const hierarchy = await db.hierarchy.findFirst({
    where: { type: 'Request' },
    select: {
      id: true,
      name: true,
      description: true,
      levels: { select: { id: true, name: true, position: true } },
    },
  });

  const requirements = await db.requirement.findMany({
    select: { id: true, name: true, description: true },
  });

  const preparedRequirements = requirements.map((req) => ({ value: req.id, label: req.name }));

  if (!hierarchy) {
    return { notFound: true };
  }

  const levels = hierarchy.levels.sort((a, b) => a.position - b.position);

  return (
    <Card className="flex flex-1 flex-col overflow-y-hidden rounded-sm">
      <CardHeader>
        <CardTitle>Request Category</CardTitle>
        <CardDescription>Create a new request category. A category can have multiple and recursive subcategories according to your business needs.</CardDescription>
      </CardHeader>
      <RequestTypeForm requirements={preparedRequirements} levels={levels} />
    </Card>
  );
}
