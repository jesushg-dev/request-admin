/* eslint-disable */
import { db } from '.';
import { createTRPCRouter } from '../../trpc';
import { procedure } from '../../trpc';
import * as _Schema from '@zenstackhq/runtime/zod/input';
const $Schema: typeof _Schema = (_Schema as any).default ?? _Schema;
import { checkRead, checkMutate } from '../helper';

export default function createRouter() {
  return createTRPCRouter({
    aggregate: procedure.input($Schema.FormInputSchema.aggregate).query(({ ctx, input }) => checkRead(db(ctx).form.aggregate(input as any))),

    createMany: procedure.input($Schema.FormInputSchema.createMany.optional()).mutation(async ({ ctx, input }) => checkMutate(db(ctx).form.createMany(input as any))),

    create: procedure.input($Schema.FormInputSchema.create).mutation(async ({ ctx, input }) => checkMutate(db(ctx).form.create(input as any))),

    deleteMany: procedure.input($Schema.FormInputSchema.deleteMany.optional()).mutation(async ({ ctx, input }) => checkMutate(db(ctx).form.deleteMany(input as any))),

    delete: procedure.input($Schema.FormInputSchema.delete).mutation(async ({ ctx, input }) => checkMutate(db(ctx).form.delete(input as any))),

    findFirst: procedure.input($Schema.FormInputSchema.findFirst.optional()).query(({ ctx, input }) => checkRead(db(ctx).form.findFirst(input as any))),

    findFirstOrThrow: procedure.input($Schema.FormInputSchema.findFirst.optional()).query(({ ctx, input }) => checkRead(db(ctx).form.findFirstOrThrow(input as any))),

    findMany: procedure.input($Schema.FormInputSchema.findMany.optional()).query(({ ctx, input }) => checkRead(db(ctx).form.findMany(input as any))),

    findUnique: procedure.input($Schema.FormInputSchema.findUnique).query(({ ctx, input }) => checkRead(db(ctx).form.findUnique(input as any))),

    findUniqueOrThrow: procedure.input($Schema.FormInputSchema.findUnique).query(({ ctx, input }) => checkRead(db(ctx).form.findUniqueOrThrow(input as any))),

    groupBy: procedure.input($Schema.FormInputSchema.groupBy).query(({ ctx, input }) => checkRead(db(ctx).form.groupBy(input as any))),

    updateMany: procedure.input($Schema.FormInputSchema.updateMany).mutation(async ({ ctx, input }) => checkMutate(db(ctx).form.updateMany(input as any))),

    update: procedure.input($Schema.FormInputSchema.update).mutation(async ({ ctx, input }) => checkMutate(db(ctx).form.update(input as any))),

    upsert: procedure.input($Schema.FormInputSchema.upsert).mutation(async ({ ctx, input }) => checkMutate(db(ctx).form.upsert(input as any))),

    count: procedure.input($Schema.FormInputSchema.count.optional()).query(({ ctx, input }) => checkRead(db(ctx).form.count(input as any))),
  });
}
