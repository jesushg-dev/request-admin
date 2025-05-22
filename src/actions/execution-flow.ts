'use server';

import { currentSession } from '@/server/auth-server';
//import { db } from '@/server/db-server';
import { ExecutionFlowValues } from '@/services/schemas/execution-flow';

import { UserNotFoundErr } from '@/lib/error';

//todo, this is not upsert anymore, since we don't modify the flow instead we create a new one one
export async function upsertExecutionFlow(processFlow: ExecutionFlowValues, requestCategoryId: string) {
  console.log('🚀 ~ upsertExecutionFlow ~ processFlow:', processFlow);
  console.log('🚀 ~ upsertExecutionFlow ~ requestCategoryId:', requestCategoryId);
  const session = await currentSession();
  if (!session) throw new UserNotFoundErr();
}
