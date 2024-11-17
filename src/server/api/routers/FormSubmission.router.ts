/* eslint-disable */
import { db } from '.';
import { createTRPCRouter } from '../../trpc';
import { procedure } from '../../trpc';
import * as _Schema from '@zenstackhq/runtime/zod/input';
const $Schema: typeof _Schema = (_Schema as any).default ?? _Schema;
import { checkRead, checkMutate } from '../helper';

export default function createRouter() {
  return createTRPCRouter({
    aggregate: procedure.input($Schema.FormSubmissionInputSchema.aggregate).query(({ ctx, input }) => checkRead(db(ctx).formSubmission.aggregate(input as any))),

    createMany: procedure
      .input($Schema.FormSubmissionInputSchema.createMany.optional())
      .mutation(async ({ ctx, input }) => checkMutate(db(ctx).formSubmission.createMany(input as any))),

    create: procedure.input($Schema.FormSubmissionInputSchema.create).mutation(async ({ ctx, input }) => checkMutate(db(ctx).formSubmission.create(input as any))),

    deleteMany: procedure
      .input($Schema.FormSubmissionInputSchema.deleteMany.optional())
      .mutation(async ({ ctx, input }) => checkMutate(db(ctx).formSubmission.deleteMany(input as any))),

    delete: procedure.input($Schema.FormSubmissionInputSchema.delete).mutation(async ({ ctx, input }) => checkMutate(db(ctx).formSubmission.delete(input as any))),

    findFirst: procedure.input($Schema.FormSubmissionInputSchema.findFirst.optional()).query(({ ctx, input }) => checkRead(db(ctx).formSubmission.findFirst(input as any))),

    findFirstOrThrow: procedure
      .input($Schema.FormSubmissionInputSchema.findFirst.optional())
      .query(({ ctx, input }) => checkRead(db(ctx).formSubmission.findFirstOrThrow(input as any))),

    findMany: procedure.input($Schema.FormSubmissionInputSchema.findMany.optional()).query(({ ctx, input }) => checkRead(db(ctx).formSubmission.findMany(input as any))),

    findUnique: procedure.input($Schema.FormSubmissionInputSchema.findUnique).query(({ ctx, input }) => checkRead(db(ctx).formSubmission.findUnique(input as any))),

    findUniqueOrThrow: procedure.input($Schema.FormSubmissionInputSchema.findUnique).query(({ ctx, input }) => checkRead(db(ctx).formSubmission.findUniqueOrThrow(input as any))),

    groupBy: procedure.input($Schema.FormSubmissionInputSchema.groupBy).query(({ ctx, input }) => checkRead(db(ctx).formSubmission.groupBy(input as any))),

    updateMany: procedure.input($Schema.FormSubmissionInputSchema.updateMany).mutation(async ({ ctx, input }) => checkMutate(db(ctx).formSubmission.updateMany(input as any))),

    update: procedure.input($Schema.FormSubmissionInputSchema.update).mutation(async ({ ctx, input }) => checkMutate(db(ctx).formSubmission.update(input as any))),

    upsert: procedure.input($Schema.FormSubmissionInputSchema.upsert).mutation(async ({ ctx, input }) => checkMutate(db(ctx).formSubmission.upsert(input as any))),

    count: procedure.input($Schema.FormSubmissionInputSchema.count.optional()).query(({ ctx, input }) => checkRead(db(ctx).formSubmission.count(input as any))),
  });
}
