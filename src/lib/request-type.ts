import { Prisma } from '@prisma/client';

import { RequestCategoryValues } from '@/components/common/request-type/category-form';

export function buildRequestCategoryUpsertArgs(category: RequestCategoryValues, tenantId: string, hierarchyId: string): Prisma.RequestCategoryUpsertArgs {
  // Extract form and requirement IDs from the incoming data.
  // If the arrays are undefined, treat them as empty arrays (which will delete existing nested records).

  const formIds = category.forms?.map((f) => String(f.value)) || [];
  const requirementIds = category.requirements?.map((r) => String(r.value)) || [];

  return {
    where: { id: category.id },
    create: {
      id: category.id,
      name: category.name,
      description: category.description,
      isActive: category.isActive,
      isEligibleForNewClients: category.isEligibleForNewClients,
      tenantId,
      // Set parentCategoryId to the provided _parentId or null if there is none
      parentCategoryId: category.parentCategoryId || null,
      hierarchyId,
      hierarchyLevelId: category.hierarchyLevelId,
      // Create nested CategoryForms records from the provided forms array
      categoryForms: {
        create:
          category.forms?.map((f) => ({
            tenantId,
            formId: String(f.value),
          })) || [],
      },
      // Create nested RequestCategoryRequirements records from the provided requirements array
      requestCategoryRequirements: {
        create:
          category.requirements?.map((r) => ({
            tenantId,
            requirementId: String(r.value),
          })) || [],
      },
      // Create nested SLA record if provided
      sla: category.sla
        ? {
            create: {
              tenantId,
              resolutionTime: category.sla.resolutionTime || 0,
              escalationTime: category.sla.escalationTime || 0,
              id: category.sla.id,
            },
          }
        : undefined,

      guideDocuments: {
        create:
          category.guides?.map((doc) => ({
            id: doc.id,
            name: doc.name,
            description: doc.description,
            fileType: doc.fileType,
            fileUrl: doc.fileUrl,
            version: doc.version,
            updatedAt: doc.updatedAt,
            isActive: doc.isActive,
            tenantId,
          })) || [],
      },
    },
    update: {
      name: category.name,
      description: category.description,
      isActive: category.isActive,
      isEligibleForNewClients: category.isEligibleForNewClients,
      tenantId,
      hierarchyId,
      parentCategoryId: category.parentCategoryId || null,
      hierarchyLevelId: category.hierarchyLevelId,
      // For nested CategoryForms, first delete any forms that are not present in the incoming data,
      // then upsert each provided form.
      categoryForms: {
        deleteMany: { formId: { notIn: formIds } },
        upsert:
          category.forms?.map((f) => ({
            where: {
              categoryId_formId_tenantId: {
                categoryId: category.id,
                formId: String(f.value),
                tenantId,
              },
            },
            create: { tenantId, formId: String(f.value) },
            update: { tenantId, formId: String(f.value) },
          })) || [],
      },
      // For nested RequestCategoryRequirements, delete any requirements not present in the incoming data,
      // then upsert each provided requirement.
      requestCategoryRequirements: {
        deleteMany: { requirementId: { notIn: requirementIds } },
        upsert:
          category.requirements?.map((r) => ({
            where: {
              categoryId_requirementId_tenantId: {
                categoryId: category.id,
                requirementId: String(r.value),
                tenantId,
              },
            },
            create: { tenantId, requirementId: String(r.value) },
            update: { tenantId, requirementId: String(r.value) },
          })) || [],
      },
      // For the nested SLA record, use upsert to create or update it as needed.
      sla: category.sla
        ? {
            upsert: {
              where: { id: category.sla.id, tenantId },
              create: {
                tenantId,
                resolutionTime: category.sla.resolutionTime || 0,
                escalationTime: category.sla.escalationTime || 0,
                id: category.sla.id,
              },
              update: {
                tenantId,
                resolutionTime: category.sla.resolutionTime || 0,
                escalationTime: category.sla.escalationTime || 0,
                id: category.sla.id,
              },
            },
          }
        : undefined,
      guideDocuments: {
        deleteMany: { id: { notIn: category.guides?.map((doc) => doc.id) } },
        upsert:
          category.guides?.map((doc) => ({
            where: { id: doc.id, tenantId },
            create: {
              id: doc.id,
              name: doc.name,
              description: doc.description,
              fileType: doc.fileType,
              fileUrl: doc.fileUrl,
              version: doc.version,
              updatedAt: doc.updatedAt,
              isActive: doc.isActive,
              tenantId,
            },
            update: {
              id: doc.id,
              name: doc.name,
              description: doc.description,
              fileType: doc.fileType,
              fileUrl: doc.fileUrl,
              version: doc.version,
              updatedAt: doc.updatedAt,
              isActive: doc.isActive,
              tenantId,
            },
          })) || [],
      },
    },
  };
}
