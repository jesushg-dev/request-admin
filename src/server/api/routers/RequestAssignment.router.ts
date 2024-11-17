/* eslint-disable */
import { db } from '.';
import { createTRPCRouter } from '../../trpc';
import { procedure } from '../../trpc';
import * as _Schema from '@zenstackhq/runtime/zod/input';
const $Schema: typeof _Schema = (_Schema as any).default ?? _Schema;
import { checkRead, checkMutate } from '../helper';

export default function createRouter() {
  return createTRPCRouter({
    aggregate: procedure.input($Schema.RequestAssignmentInputSchema.aggregate).query(({ ctx, input }) => checkRead(db(ctx).requestAssignment.aggregate(input as any))),

    createMany: procedure
      .input($Schema.RequestAssignmentInputSchema.createMany.optional())
      .mutation(async ({ ctx, input }) => checkMutate(db(ctx).requestAssignment.createMany(input as any))),

    create: procedure.input($Schema.RequestAssignmentInputSchema.create).mutation(async ({ ctx, input }) => checkMutate(db(ctx).requestAssignment.create(input as any))),

    deleteMany: procedure
      .input($Schema.RequestAssignmentInputSchema.deleteMany.optional())
      .mutation(async ({ ctx, input }) => checkMutate(db(ctx).requestAssignment.deleteMany(input as any))),

    delete: procedure.input($Schema.RequestAssignmentInputSchema.delete).mutation(async ({ ctx, input }) => checkMutate(db(ctx).requestAssignment.delete(input as any))),

    findFirst: procedure.input($Schema.RequestAssignmentInputSchema.findFirst.optional()).query(({ ctx, input }) => checkRead(db(ctx).requestAssignment.findFirst(input as any))),

    findFirstOrThrow: procedure
      .input($Schema.RequestAssignmentInputSchema.findFirst.optional())
      .query(({ ctx, input }) => checkRead(db(ctx).requestAssignment.findFirstOrThrow(input as any))),

    findMany: procedure.input($Schema.RequestAssignmentInputSchema.findMany.optional()).query(({ ctx, input }) => checkRead(db(ctx).requestAssignment.findMany(input as any))),

    findUnique: procedure.input($Schema.RequestAssignmentInputSchema.findUnique).query(({ ctx, input }) => checkRead(db(ctx).requestAssignment.findUnique(input as any))),

    findUniqueOrThrow: procedure
      .input($Schema.RequestAssignmentInputSchema.findUnique)
      .query(({ ctx, input }) => checkRead(db(ctx).requestAssignment.findUniqueOrThrow(input as any))),

    groupBy: procedure.input($Schema.RequestAssignmentInputSchema.groupBy).query(({ ctx, input }) => checkRead(db(ctx).requestAssignment.groupBy(input as any))),

    updateMany: procedure
      .input($Schema.RequestAssignmentInputSchema.updateMany)
      .mutation(async ({ ctx, input }) => checkMutate(db(ctx).requestAssignment.updateMany(input as any))),

    update: procedure.input($Schema.RequestAssignmentInputSchema.update).mutation(async ({ ctx, input }) => checkMutate(db(ctx).requestAssignment.update(input as any))),

    upsert: procedure.input($Schema.RequestAssignmentInputSchema.upsert).mutation(async ({ ctx, input }) => checkMutate(db(ctx).requestAssignment.upsert(input as any))),

    count: procedure.input($Schema.RequestAssignmentInputSchema.count.optional()).query(({ ctx, input }) => checkRead(db(ctx).requestAssignment.count(input as any))),
  });
}
