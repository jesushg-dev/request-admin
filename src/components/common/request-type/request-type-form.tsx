'use client';

import { FC } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import { RequestLevelType } from '@/types/prisma/hierarchy';
import { RequirementOptionType } from '@/types/prisma/requirement';
import { Form } from '@/components/ui/form';
import { ScrollArea } from '@/components/ui/scroll-area';

import RequestCategoryForm, { requestCategoryFormSchema } from '../category/request-category-form';

interface RequestTypeFormProps {
  requirements: RequirementOptionType[];
  levels: RequestLevelType[];
}

const RequestTypeForm: FC<RequestTypeFormProps> = ({ requirements, levels }) => {
  // Initialize React Hook Form with current step schema
  const form = useForm({
    mode: 'onTouched',
    resolver: zodResolver(requestCategoryFormSchema),
  });

  const onSubmit = (values: { [key: string]: string }) => {
    console.log('Values:', values);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-1 flex-col justify-between overflow-hidden p-6 pt-0">
        <div className="flex flex-1 overflow-y-hidden">
          <ScrollArea className="flex w-full flex-1 overflow-y-hidden">
            <div className="m-1 mr-4 flex flex-1 flex-col gap-2">
              <RequestCategoryForm levels={levels} requirements={requirements} mode="single" />
            </div>
          </ScrollArea>
        </div>
      </form>
    </Form>
  );
};

export default RequestTypeForm;
