'use client';

import { FC } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import { LevelType } from '@/types/prisma/hierarchy';
import { RequirementOptionType } from '@/types/prisma/requirement';
import { Form } from '@/components/ui/form';
import { ScrollArea } from '@/components/ui/scroll-area';
import CategoryForm, { categoryFormSchema } from '@/components/common/category/category-form';

interface RequestTypeFormProps {
  requirements: RequirementOptionType[];
  levels: LevelType[];
}

const RequestTypeForm: FC<RequestTypeFormProps> = ({ requirements, levels }) => {
  // Initialize React Hook Form with current step schema
  const form = useForm({
    mode: 'onTouched',
    resolver: zodResolver(categoryFormSchema),
  });

  const onSubmit = (values: any) => {
    console.log('Values:', values);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-1 flex-col justify-between overflow-hidden p-6 pt-0">
        <div className="flex flex-1 overflow-y-hidden">
          <ScrollArea className="flex w-full flex-1 overflow-y-hidden">
            <div className="m-1 mr-4 flex flex-1 flex-col gap-2">
              <CategoryForm levels={levels} requirements={requirements} mode="single" />
            </div>
          </ScrollArea>
        </div>
      </form>
    </Form>
  );
};

export default RequestTypeForm;
