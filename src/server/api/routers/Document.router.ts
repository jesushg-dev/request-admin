/* eslint-disable */
import { db } from '.';
import { createTRPCRouter } from '../../trpc';
import { procedure } from '../../trpc';
import * as _Schema from '@zenstackhq/runtime/zod/input';
const $Schema: typeof _Schema = (_Schema as any).default ?? _Schema;
import { checkRead, checkMutate } from '../helper';

export default function createRouter() {
  return createTRPCRouter({
    aggregate: procedure.input($Schema.DocumentInputSchema.aggregate).query(({ ctx, input }) => checkRead(db(ctx).document.aggregate(input as any))),

    createMany: procedure.input($Schema.DocumentInputSchema.createMany.optional()).mutation(async ({ ctx, input }) => checkMutate(db(ctx).document.createMany(input as any))),

    create: procedure.input($Schema.DocumentInputSchema.create).mutation(async ({ ctx, input }) => checkMutate(db(ctx).document.create(input as any))),

    deleteMany: procedure.input($Schema.DocumentInputSchema.deleteMany.optional()).mutation(async ({ ctx, input }) => checkMutate(db(ctx).document.deleteMany(input as any))),

    delete: procedure.input($Schema.DocumentInputSchema.delete).mutation(async ({ ctx, input }) => checkMutate(db(ctx).document.delete(input as any))),

    findFirst: procedure.input($Schema.DocumentInputSchema.findFirst.optional()).query(({ ctx, input }) => checkRead(db(ctx).document.findFirst(input as any))),

    findFirstOrThrow: procedure.input($Schema.DocumentInputSchema.findFirst.optional()).query(({ ctx, input }) => checkRead(db(ctx).document.findFirstOrThrow(input as any))),

    findMany: procedure.input($Schema.DocumentInputSchema.findMany.optional()).query(({ ctx, input }) => checkRead(db(ctx).document.findMany(input as any))),

    findUnique: procedure.input($Schema.DocumentInputSchema.findUnique).query(({ ctx, input }) => checkRead(db(ctx).document.findUnique(input as any))),

    findUniqueOrThrow: procedure.input($Schema.DocumentInputSchema.findUnique).query(({ ctx, input }) => checkRead(db(ctx).document.findUniqueOrThrow(input as any))),

    groupBy: procedure.input($Schema.DocumentInputSchema.groupBy).query(({ ctx, input }) => checkRead(db(ctx).document.groupBy(input as any))),

    updateMany: procedure.input($Schema.DocumentInputSchema.updateMany).mutation(async ({ ctx, input }) => checkMutate(db(ctx).document.updateMany(input as any))),

    update: procedure.input($Schema.DocumentInputSchema.update).mutation(async ({ ctx, input }) => checkMutate(db(ctx).document.update(input as any))),

    upsert: procedure.input($Schema.DocumentInputSchema.upsert).mutation(async ({ ctx, input }) => checkMutate(db(ctx).document.upsert(input as any))),

    count: procedure.input($Schema.DocumentInputSchema.count.optional()).query(({ ctx, input }) => checkRead(db(ctx).document.count(input as any))),
  });
}
