'use client';

import { FC, useTransition } from 'react';
import { upsertCategoriesFlat } from '@/actions/request-type';
import { useRouter } from '@/i18n/routing';
import { zodResolver } from '@hookform/resolvers/zod';
import { LoaderCircleIcon } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { RequestLevelType } from '@/types/prisma/hierarchy';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { ScrollArea } from '@/components/ui/scroll-area';
import { OptionType } from '@/components/select/select';
import { ZodErrorAlert } from '@/components/shared/zod-error-alert';

import RequestCategoryForm, { categoriesSchema, getDefaultSubcategory, RequestCategoryFormValues } from '../category/request-category-form';

interface RequestTypeFormProps {
  tenantId: string;
  hierarchyId: string;
  forms: OptionType[];
  levels: RequestLevelType[];
  requirements: OptionType[];
  initialValues?: RequestCategoryFormValues | null;
}

const RequestTypeForm: FC<RequestTypeFormProps> = ({ hierarchyId, requirements, forms, levels, tenantId, initialValues }) => {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const form = useForm<RequestCategoryFormValues>({
    mode: 'onTouched',
    resolver: zodResolver(categoriesSchema),
    defaultValues: initialValues ?? { categories: [getDefaultSubcategory(levels[0].id)] },
  });

  const onSubmit = (values: RequestCategoryFormValues) => {
    startTransition(async () => {
      const operation = upsertCategoriesFlat(values.categories, tenantId, hierarchyId);
      toast.promise(operation, {
        loading: 'Saving...',
        success: () => {
          router.push({ pathname: '/admin/[tenantId]/requests-portal/request-types', params: { tenantId } });
          return 'Saved successfully.';
        },
        error: (err) => {
          return `Failed to save: ${err.message}`;
        },
        position: 'top-right',
      });
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col flex-1 overflow-hidden gap-4 items-end">
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

export default RequestTypeForm;
