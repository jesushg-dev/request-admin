/* eslint-disable */
import { db } from '.';
import { createTRPCRouter } from '../../trpc';
import { procedure } from '../../trpc';
import * as _Schema from '@zenstackhq/runtime/zod/input';
const $Schema: typeof _Schema = (_Schema as any).default ?? _Schema;
import { checkRead, checkMutate } from '../helper';

export default function createRouter() {
  return createTRPCRouter({
    aggregate: procedure.input($Schema.AreaInputSchema.aggregate).query(({ ctx, input }) => checkRead(db(ctx).area.aggregate(input as any))),

    createMany: procedure.input($Schema.AreaInputSchema.createMany.optional()).mutation(async ({ ctx, input }) => checkMutate(db(ctx).area.createMany(input as any))),

    create: procedure.input($Schema.AreaInputSchema.create).mutation(async ({ ctx, input }) => checkMutate(db(ctx).area.create(input as any))),

    deleteMany: procedure.input($Schema.AreaInputSchema.deleteMany.optional()).mutation(async ({ ctx, input }) => checkMutate(db(ctx).area.deleteMany(input as any))),

    delete: procedure.input($Schema.AreaInputSchema.delete).mutation(async ({ ctx, input }) => checkMutate(db(ctx).area.delete(input as any))),

    findFirst: procedure.input($Schema.AreaInputSchema.findFirst.optional()).query(({ ctx, input }) => checkRead(db(ctx).area.findFirst(input as any))),

    findFirstOrThrow: procedure.input($Schema.AreaInputSchema.findFirst.optional()).query(({ ctx, input }) => checkRead(db(ctx).area.findFirstOrThrow(input as any))),

    findMany: procedure.input($Schema.AreaInputSchema.findMany.optional()).query(({ ctx, input }) => checkRead(db(ctx).area.findMany(input as any))),

    findUnique: procedure.input($Schema.AreaInputSchema.findUnique).query(({ ctx, input }) => checkRead(db(ctx).area.findUnique(input as any))),

    findUniqueOrThrow: procedure.input($Schema.AreaInputSchema.findUnique).query(({ ctx, input }) => checkRead(db(ctx).area.findUniqueOrThrow(input as any))),

    groupBy: procedure.input($Schema.AreaInputSchema.groupBy).query(({ ctx, input }) => checkRead(db(ctx).area.groupBy(input as any))),

    updateMany: procedure.input($Schema.AreaInputSchema.updateMany).mutation(async ({ ctx, input }) => checkMutate(db(ctx).area.updateMany(input as any))),

    update: procedure.input($Schema.AreaInputSchema.update).mutation(async ({ ctx, input }) => checkMutate(db(ctx).area.update(input as any))),

    upsert: procedure.input($Schema.AreaInputSchema.upsert).mutation(async ({ ctx, input }) => checkMutate(db(ctx).area.upsert(input as any))),

    count: procedure.input($Schema.AreaInputSchema.count.optional()).query(({ ctx, input }) => checkRead(db(ctx).area.count(input as any))),
  });
}
