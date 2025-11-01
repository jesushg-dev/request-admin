import { NextResponse } from 'next/server';
import { getDb } from '@/server/db-client';

export async function POST(request: Request) {
  const { userId } = (await request.json()) as { userId: string };

  try {
    const db = await getDb();
    const tenants = await db.tenant.findMany({
      select: { id: true },
      where: { userTenants: { some: { userId } } },
    });
    return NextResponse.json({ tenants }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
