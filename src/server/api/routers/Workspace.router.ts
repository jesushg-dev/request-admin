/* eslint-disable */
import { db } from '.';
import { createTRPCRouter } from '../../trpc';
import { procedure } from '../../trpc';
import * as _Schema from '@zenstackhq/runtime/zod/input';
const $Schema: typeof _Schema = (_Schema as any).default ?? _Schema;
import { checkRead, checkMutate } from '../helper';

export default function createRouter() {
  return createTRPCRouter({
    aggregate: procedure.input($Schema.WorkspaceInputSchema.aggregate).query(({ ctx, input }) => checkRead(db(ctx).workspace.aggregate(input as any))),

    createMany: procedure.input($Schema.WorkspaceInputSchema.createMany.optional()).mutation(async ({ ctx, input }) => checkMutate(db(ctx).workspace.createMany(input as any))),

    create: procedure.input($Schema.WorkspaceInputSchema.create).mutation(async ({ ctx, input }) => checkMutate(db(ctx).workspace.create(input as any))),

    deleteMany: procedure.input($Schema.WorkspaceInputSchema.deleteMany.optional()).mutation(async ({ ctx, input }) => checkMutate(db(ctx).workspace.deleteMany(input as any))),

    delete: procedure.input($Schema.WorkspaceInputSchema.delete).mutation(async ({ ctx, input }) => checkMutate(db(ctx).workspace.delete(input as any))),

    findFirst: procedure.input($Schema.WorkspaceInputSchema.findFirst.optional()).query(({ ctx, input }) => checkRead(db(ctx).workspace.findFirst(input as any))),

    findFirstOrThrow: procedure.input($Schema.WorkspaceInputSchema.findFirst.optional()).query(({ ctx, input }) => checkRead(db(ctx).workspace.findFirstOrThrow(input as any))),

    findMany: procedure.input($Schema.WorkspaceInputSchema.findMany.optional()).query(({ ctx, input }) => checkRead(db(ctx).workspace.findMany(input as any))),

    findUnique: procedure.input($Schema.WorkspaceInputSchema.findUnique).query(({ ctx, input }) => checkRead(db(ctx).workspace.findUnique(input as any))),

    findUniqueOrThrow: procedure.input($Schema.WorkspaceInputSchema.findUnique).query(({ ctx, input }) => checkRead(db(ctx).workspace.findUniqueOrThrow(input as any))),

    groupBy: procedure.input($Schema.WorkspaceInputSchema.groupBy).query(({ ctx, input }) => checkRead(db(ctx).workspace.groupBy(input as any))),

    updateMany: procedure.input($Schema.WorkspaceInputSchema.updateMany).mutation(async ({ ctx, input }) => checkMutate(db(ctx).workspace.updateMany(input as any))),

    update: procedure.input($Schema.WorkspaceInputSchema.update).mutation(async ({ ctx, input }) => checkMutate(db(ctx).workspace.update(input as any))),

    upsert: procedure.input($Schema.WorkspaceInputSchema.upsert).mutation(async ({ ctx, input }) => checkMutate(db(ctx).workspace.upsert(input as any))),

    count: procedure.input($Schema.WorkspaceInputSchema.count.optional()).query(({ ctx, input }) => checkRead(db(ctx).workspace.count(input as any))),
  });
}
