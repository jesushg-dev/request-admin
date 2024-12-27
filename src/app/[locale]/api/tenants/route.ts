import { NextResponse } from 'next/server';
import { auth } from '@/server/auth';
import { db } from '@/server/db-server';

export const GET = auth(async (req) => {
  if (!req.auth?.user) {
    return NextResponse.json({ error: 'User  is required' }, { status: 400 });
  }

  try {
    const tenants = await db.tenant.findMany({
      select: { id: true },
      where: { userTenants: { some: { userId: req.auth.user.id } } },
    });
    return NextResponse.json({ tenants }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
});
