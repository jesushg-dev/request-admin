/* eslint-disable */
import { db } from '.';
import { createTRPCRouter } from '../../trpc';
import { procedure } from '../../trpc';
import * as _Schema from '@zenstackhq/runtime/zod/input';
const $Schema: typeof _Schema = (_Schema as any).default ?? _Schema;
import { checkRead, checkMutate } from '../helper';

export default function createRouter() {
  return createTRPCRouter({
    aggregate: procedure.input($Schema.PermissionInputSchema.aggregate).query(({ ctx, input }) => checkRead(db(ctx).permission.aggregate(input as any))),

    createMany: procedure.input($Schema.PermissionInputSchema.createMany.optional()).mutation(async ({ ctx, input }) => checkMutate(db(ctx).permission.createMany(input as any))),

    create: procedure.input($Schema.PermissionInputSchema.create).mutation(async ({ ctx, input }) => checkMutate(db(ctx).permission.create(input as any))),

    deleteMany: procedure.input($Schema.PermissionInputSchema.deleteMany.optional()).mutation(async ({ ctx, input }) => checkMutate(db(ctx).permission.deleteMany(input as any))),

    delete: procedure.input($Schema.PermissionInputSchema.delete).mutation(async ({ ctx, input }) => checkMutate(db(ctx).permission.delete(input as any))),

    findFirst: procedure.input($Schema.PermissionInputSchema.findFirst.optional()).query(({ ctx, input }) => checkRead(db(ctx).permission.findFirst(input as any))),

    findFirstOrThrow: procedure.input($Schema.PermissionInputSchema.findFirst.optional()).query(({ ctx, input }) => checkRead(db(ctx).permission.findFirstOrThrow(input as any))),

    findMany: procedure.input($Schema.PermissionInputSchema.findMany.optional()).query(({ ctx, input }) => checkRead(db(ctx).permission.findMany(input as any))),

    findUnique: procedure.input($Schema.PermissionInputSchema.findUnique).query(({ ctx, input }) => checkRead(db(ctx).permission.findUnique(input as any))),

    findUniqueOrThrow: procedure.input($Schema.PermissionInputSchema.findUnique).query(({ ctx, input }) => checkRead(db(ctx).permission.findUniqueOrThrow(input as any))),

    groupBy: procedure.input($Schema.PermissionInputSchema.groupBy).query(({ ctx, input }) => checkRead(db(ctx).permission.groupBy(input as any))),

    updateMany: procedure.input($Schema.PermissionInputSchema.updateMany).mutation(async ({ ctx, input }) => checkMutate(db(ctx).permission.updateMany(input as any))),

    update: procedure.input($Schema.PermissionInputSchema.update).mutation(async ({ ctx, input }) => checkMutate(db(ctx).permission.update(input as any))),

    upsert: procedure.input($Schema.PermissionInputSchema.upsert).mutation(async ({ ctx, input }) => checkMutate(db(ctx).permission.upsert(input as any))),

    count: procedure.input($Schema.PermissionInputSchema.count.optional()).query(({ ctx, input }) => checkRead(db(ctx).permission.count(input as any))),
  });
}
