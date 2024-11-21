import { db } from '@/server/db-server';
import { getToken } from 'next-auth/jwt';

import { NextRequest, NextResponse } from 'next/server';

//https://spin.atomicobject.com/api-route-handlers-app-router/
//https://ej2.syncfusion.com/documentation/data/adaptors#custom-data-adaptor

export async function GET(req: NextRequest) {
  const token = await getToken({ req });
  //protect
  if (!token) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const filterParam = req.nextUrl.searchParams.get('$filter');
  if (!filterParam) {
    return NextResponse.json({ error: 'Filter parameter is required' });
  }

  // Use a regular expression to extract the GUID from the filter parameter
  const match = filterParam.match(/guid'([^']+)'/);
  const serviceTypeId = match ? match[1] : null;

  if (!serviceTypeId) {
    return NextResponse.json({ error: 'Invalid serviceTypeId' });
  }

  // Use the extracted serviceTypeId to filter subCategories
  const subCategories = await db.requirement.findMany({
    where: {
      requirementServiceTypeAssociation: {
        some: {
          serviceTypeId: serviceTypeId, // Use the serviceTypeId in your query
        },
      },
    },
    select: {
      id: true,
      name: true,
      description: true,
    },
  });

  return NextResponse.json({
    result: subCategories,
    count: subCategories.length,
  });
}
