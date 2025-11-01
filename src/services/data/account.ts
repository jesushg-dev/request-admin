import { getDb } from '@/server/db-client';

export const getAccountByUserId = async (userId: string) => {
  try {
    const db = await getDb();
    const account = await db.account.findFirst({
      where: { userId },
    });

    return account;
  } catch {
    return null;
  }
};
