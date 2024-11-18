/* eslint-disable */
import { db } from '.';
import { createTRPCRouter } from '../../trpc';
import { procedure } from '../../trpc';
import * as _Schema from '@zenstackhq/runtime/zod/input';
const $Schema: typeof _Schema = (_Schema as any).default ?? _Schema;
import { checkRead, checkMutate } from '../helper';

export default function createRouter() {
  return createTRPCRouter({
    aggregate: procedure.input($Schema.MemberInputSchema.aggregate).query(({ ctx, input }) => checkRead(db(ctx).member.aggregate(input as any))),

    createMany: procedure.input($Schema.MemberInputSchema.createMany.optional()).mutation(async ({ ctx, input }) => checkMutate(db(ctx).member.createMany(input as any))),

    create: procedure.input($Schema.MemberInputSchema.create).mutation(async ({ ctx, input }) => checkMutate(db(ctx).member.create(input as any))),

    deleteMany: procedure.input($Schema.MemberInputSchema.deleteMany.optional()).mutation(async ({ ctx, input }) => checkMutate(db(ctx).member.deleteMany(input as any))),

    delete: procedure.input($Schema.MemberInputSchema.delete).mutation(async ({ ctx, input }) => checkMutate(db(ctx).member.delete(input as any))),

    findFirst: procedure.input($Schema.MemberInputSchema.findFirst.optional()).query(({ ctx, input }) => checkRead(db(ctx).member.findFirst(input as any))),

    findFirstOrThrow: procedure.input($Schema.MemberInputSchema.findFirst.optional()).query(({ ctx, input }) => checkRead(db(ctx).member.findFirstOrThrow(input as any))),

    findMany: procedure.input($Schema.MemberInputSchema.findMany.optional()).query(({ ctx, input }) => checkRead(db(ctx).member.findMany(input as any))),

    findUnique: procedure.input($Schema.MemberInputSchema.findUnique).query(({ ctx, input }) => checkRead(db(ctx).member.findUnique(input as any))),

    findUniqueOrThrow: procedure.input($Schema.MemberInputSchema.findUnique).query(({ ctx, input }) => checkRead(db(ctx).member.findUniqueOrThrow(input as any))),

    groupBy: procedure.input($Schema.MemberInputSchema.groupBy).query(({ ctx, input }) => checkRead(db(ctx).member.groupBy(input as any))),

    updateMany: procedure.input($Schema.MemberInputSchema.updateMany).mutation(async ({ ctx, input }) => checkMutate(db(ctx).member.updateMany(input as any))),

    update: procedure.input($Schema.MemberInputSchema.update).mutation(async ({ ctx, input }) => checkMutate(db(ctx).member.update(input as any))),

    upsert: procedure.input($Schema.MemberInputSchema.upsert).mutation(async ({ ctx, input }) => checkMutate(db(ctx).member.upsert(input as any))),

    count: procedure.input($Schema.MemberInputSchema.count.optional()).query(({ ctx, input }) => checkRead(db(ctx).member.count(input as any))),
  });
}
