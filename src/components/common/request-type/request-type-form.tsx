'use client';

import { FC, useTransition } from 'react';
import { useRouter } from '@/i18n/routing';
import { useDeleteRequestCategory, useUpsertRequestCategory } from '@/services/api/hooks';
import { zodResolver } from '@hookform/resolvers/zod';
import { Prisma } from '@zenstackhq/runtime/models';
import { LoaderCircleIcon } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { RequestLevelType } from '@/types/prisma/hierarchy';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { ScrollArea } from '@/components/ui/scroll-area';
import { OptionType } from '@/components/select/select';
import { PrismaErrorAlert } from '@/components/shared/prisma-error-alert';
import { ZodErrorAlert } from '@/components/shared/zod-error-alert';

import RequestCategoryForm, { categoriesSchema, DEFAULT_SUBCATEGORY, RequestCategoryFormValues } from '../category/request-category-form';

interface RequestTypeFormProps {
  tenantId: string;
  hierarchyId: string;
  forms: OptionType[];
  levels: RequestLevelType[];
  requirements: OptionType[];
  initialValues?: (RequestCategoryFormValues & { ids: string[] }) | null;
}

const RequestTypeForm: FC<RequestTypeFormProps> = ({ hierarchyId, requirements, forms, levels, tenantId, initialValues }) => {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const { mutateAsync: remove, error: removeError } = useDeleteRequestCategory();
  const { mutateAsync: upsert, error: upsertError } = useUpsertRequestCategory();

  const form = useForm<RequestCategoryFormValues>({
    mode: 'onTouched',
    resolver: zodResolver(categoriesSchema),
    defaultValues: initialValues ?? { categories: [DEFAULT_SUBCATEGORY] },
  });

  const onSubmit = (values: RequestCategoryFormValues) => {
    const value = values.categories[0];
    upsert({
      create: {
        name: value.name,
        description: value.description,
        isActive: value.isSubCategoryVisible,
        isEligibleForNewClients: value.isEligibleForNewClients,
        tenantId,
        hierarchyId,
        hierarchyLevelId: value.hierarchyLevelId,
        categoryForms: {
          create:
            value.forms?.map((form) => ({
              tenantId,
              formId: String(form.value),
            })) ?? [],
        },
        requestCategoryRequirements: {
          create:
            value.requirements?.map((req) => ({
              tenantId,
              requirementId: String(req.value),
            })) ?? [],
        },
        sla: {
          create: {
            tenantId,
            resolutionTime: value.sla.resolutionTime ?? 0,
            escalationTime: value.sla.escalationTime ?? 0,
            id: value.sla.id,
          },
        },
        subcategories: {
          create:
            value.subcategories?.map((sub) => ({
              name: sub.name,
              description: sub.description,
              isActive: sub.isSubCategoryVisible,
              isEligibleForNewClients: sub.isEligibleForNewClients,
              tenantId,
              hierarchyId,
              hierarchyLevelId: sub.hierarchyLevelId,
              categoryForms: {
                create:
                  sub.forms?.map((form) => ({
                    tenantId,
                    formId: String(form.value),
                  })) ?? [],
              },
              requestCategoryRequirements: {
                create:
                  value.requirements?.map((req) => ({
                    tenantId,
                    requirementId: String(req.value),
                  })) ?? [],
              },
              sla: {
                create: {
                  tenantId,
                  resolutionTime: value.sla.resolutionTime ?? 0,
                  escalationTime: value.sla.escalationTime ?? 0,
                  id: value.sla.id,
                },
              },
              subcategories: {
                create:
                  sub.subcategories?.map((sub) => ({
                    name: sub.name,
                    description: sub.description,
                    isActive: sub.isSubCategoryVisible,
                    isEligibleForNewClients: sub.isEligibleForNewClients,
                    tenantId,
                    hierarchyId,
                    hierarchyLevelId: sub.hierarchyLevelId,
                    categoryForms: {
                      create:
                        sub.forms?.map((form) => ({
                          tenantId,
                          formId: String(form.value),
                        })) ?? [],
                    },
                    requestCategoryRequirements: {
                      create:
                        value.requirements?.map((req) => ({
                          tenantId,
                          requirementId: String(req.value),
                        })) ?? [],
                    },
                    sla: {
                      create: {
                        tenantId,
                        resolutionTime: value.sla.resolutionTime ?? 0,
                        escalationTime: value.sla.escalationTime ?? 0,
                        id: value.sla.id,
                      },
                    },
                    subcategories: {
                      create:
                        sub.subcategories?.map((sub) => ({
                          name: sub.name,
                          description: sub.description,
                          isActive: sub.isSubCategoryVisible,
                          isEligibleForNewClients: sub.isEligibleForNewClients,
                          tenantId,
                          hierarchyId,
                          hierarchyLevelId: sub.hierarchyLevelId,
                          categoryForms: {
                            create:
                              sub.forms?.map((form) => ({
                                tenantId,
                                formId: String(form.value),
                              })) ?? [],
                          },
                          requestCategoryRequirements: {
                            create:
                              value.requirements?.map((req) => ({
                                tenantId,
                                requirementId: String(req.value),
                              })) ?? [],
                          },
                          sla: {
                            create: {
                              tenantId,
                              resolutionTime: value.sla.resolutionTime ?? 0,
                              escalationTime: value.sla.escalationTime ?? 0,
                              id: value.sla.id,
                            },
                          },
                        })) ?? [],
                    },
                  })) ?? [],
              },
            })) ?? [],
        },
      },
      update: {
        name: value.name,
        description: value.description,
        isActive: value.isSubCategoryVisible,
        isEligibleForNewClients: value.isEligibleForNewClients,
        tenantId,
        hierarchyId,
        hierarchyLevelId: value.hierarchyLevelId,
        categoryForms: {
          upsert: value.forms?.map((form) => ({
            create: {
              tenantId,
              formId: String(form.value),
            },
            update: {
              tenantId,
              formId: String(form.value),
            },
            where: {
              categoryId_formId_tenantId: { categoryId: value.id, formId: String(form.value), tenantId },
            },
          })),
        },
        requestCategoryRequirements: {
          upsert: value.requirements?.map((req) => ({
            create: {
              tenantId,
              requirementId: String(req.value),
            },
            update: {
              tenantId,
              requirementId: String(req.value),
            },
            where: {
              categoryId_requirementId_tenantId: { categoryId: value.id, requirementId: String(req.value), tenantId },
            },
          })),
        },
        sla: {
          upsert: {
            create: {
              tenantId,
              resolutionTime: value.sla.resolutionTime ?? 0,
              escalationTime: value.sla.escalationTime ?? 0,
              id: value.sla.id,
            },
            update: {
              tenantId,
              resolutionTime: value.sla.resolutionTime ?? 0,
              escalationTime: value.sla.escalationTime ?? 0,
              id: value.sla.id,
            },
            where: { id: value.sla.id, tenantId },
          },
        },
        subcategories: {
          upsert:
            value.subcategories?.map((sub) => ({
              where: { id: sub.id },
              update: {
                name: sub.name,
                description: sub.description,
                isActive: sub.isSubCategoryVisible,
                isEligibleForNewClients: sub.isEligibleForNewClients,
                tenantId,
                hierarchyId,
                hierarchyLevelId: sub.hierarchyLevelId,
                categoryForms: {
                  upsert: sub.forms?.map((form) => ({
                    where: {
                      categoryId_formId_tenantId: { categoryId: sub.id, formId: String(form.value), tenantId },
                    },
                    create: {
                      tenantId,
                      formId: String(form.value),
                    },
                    update: {
                      tenantId,
                      formId: String(form.value),
                    },
                  })),
                },
                requestCategoryRequirements: {
                  upsert: sub.requirements?.map((req) => ({
                    where: {
                      categoryId_requirementId_tenantId: { categoryId: sub.id, requirementId: String(req.value), tenantId },
                    },
                    create: {
                      tenantId,
                      requirementId: String(req.value),
                    },
                    update: {
                      tenantId,
                      requirementId: String(req.value),
                    },
                  })),
                },
                subcategories: {
                  upsert:
                    sub.subcategories?.map((sub) => ({
                      where: { id: sub.id },
                      update: {
                        name: sub.name,
                        description: sub.description,
                        isActive: sub.isSubCategoryVisible,
                        isEligibleForNewClients: sub.isEligibleForNewClients,
                        tenantId,
                        hierarchyId,
                        hierarchyLevelId: sub.hierarchyLevelId,
                        categoryForms: {
                          upsert: sub.forms?.map((form) => ({
                            where: {
                              categoryId_formId_tenantId: { categoryId: sub.id, formId: String(form.value), tenantId },
                            },
                            create: {
                              tenantId,
                              formId: String(form.value),
                            },
                            update: {
                              tenantId,
                              formId: String(form.value),
                            },
                          })),
                        },
                        requestCategoryRequirements: {
                          upsert: sub.requirements?.map((req) => ({
                            where: {
                              categoryId_requirementId_tenantId: { categoryId: sub.id, requirementId: String(req.value), tenantId },
                            },
                            create: {
                              tenantId,
                              requirementId: String(req.value),
                            },
                            update: {
                              tenantId,
                              requirementId: String(req.value),
                            },
                          })),
                        },
                      },
                      create: {
                        name: sub.name,
                        description: sub.description,
                        isActive: sub.isSubCategoryVisible,
                        isEligibleForNewClients: sub.isEligibleForNewClients,
                        tenantId,
                        hierarchyId,
                        hierarchyLevelId: sub.hierarchyLevelId,
                        categoryForms: {
                          create:
                            sub.forms?.map((form) => ({
                              tenantId,
                              formId: String(form.value),
                            })) ?? [],
                        },
                        requestCategoryRequirements: {
                          create:
                            sub.requirements?.map((req) => ({
                              tenantId,
                              requirementId: String(req.value),
                            })) ?? [],
                        },
                      },
                    })) ?? [],
                },
              },
              create: {
                name: sub.name,
                description: sub.description,
                isActive: sub.isSubCategoryVisible,
                isEligibleForNewClients: sub.isEligibleForNewClients,
                tenantId,
                hierarchyId,
                hierarchyLevelId: sub.hierarchyLevelId,
                categoryForms: {
                  create:
                    sub.forms?.map((form) => ({
                      tenantId,
                      formId: String(form.value),
                    })) ?? [],
                },
                requestCategoryRequirements: {
                  create:
                    sub.requirements?.map((req) => ({
                      tenantId,
                      requirementId: String(req.value),
                    })) ?? [],
                },
                ....
              },
            })) ?? [],
        },
      },
      where: { id: value.id, tenantId },
    });

    startTransition(async () => {
      const operation = (async () => {
        await Promise.all(
          values.categories.map(async (category) => {
            const data = mapCategoryToCreateInput(category, tenantId, hierarchyId);
            console.log('🚀 ~ values.categories.map ~ data:', data);
            await upsert({ create: data, update: data, where: { id: category.id } });
          })
        );

        if (initialValues) {
          const toDelete = initialValues.ids.filter((id) => !values.categories.some((c) => c.id === id));
          await Promise.all(
            toDelete.map(async (id) => {
              await remove({ where: { id, tenantId } });
            })
          );
        }
      })();

      toast.promise(operation, {
        loading: 'Saving...',
        success: () => {
          router.push({ pathname: '/admin/[tenantId]/requests-portal/request-types', params: { tenantId } });
          return 'Saved successfully.';
        },
        error: (err) => `Failed to save: ${err.message}`,
        position: 'top-right',
      });
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col flex-1 overflow-hidden gap-4 items-end">
        {(removeError || upsertError) && <PrismaErrorAlert error={removeError || upsertError} />}
        <ZodErrorAlert />
        <ScrollArea className="flex w-full flex-1 overflow-y-hidden">
          <div className="m-1 mr-4 flex flex-1 flex-col gap-2">
            <RequestCategoryForm levels={levels} forms={forms} requirements={requirements} mode="single" />
          </div>
        </ScrollArea>
        <Button type="submit" disabled={isPending}>
          Save
          {isPending && <LoaderCircleIcon className="animate-spin ml-2" />}
        </Button>
      </form>
    </Form>
  );
};

function mapCategoryToCreateInput(category: RequestCategoryFormValues['categories'][0], tenantId: string, hierarchyId: string): Prisma.RequestCategoryUncheckedCreateInput {
  return {
    name: category.name,
    description: category.description ?? null,
    isActive: category.isSubCategoryVisible ?? false,
    isEligibleForNewClients: category.isEligibleForNewClients ?? false,
    tenantId,
    hierarchyId,
    hierarchyLevelId: category.hierarchyLevelId,
    categoryForms: {
      create:
        category.forms?.map((form) => ({
          tenantId,
          formId: String(form.value),
        })) ?? [],
    },
    requestCategoryRequirements: {
      create:
        category.requirements?.map((req) => ({
          tenantId,
          requirementId: String(req.value),
        })) ?? [],
    },
    sla: category.sla
      ? {
          create: {
            ...category.sla,
            tenantId,
          },
        }
      : undefined,
    subcategories: {
      create: category.subcategories?.map((sub) => mapCategoryToCreateInput(sub, tenantId, hierarchyId)) ?? [],
    },
  };
}

export default RequestTypeForm;
