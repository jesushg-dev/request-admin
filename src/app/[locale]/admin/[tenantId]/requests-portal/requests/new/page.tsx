'use client';

import React, { useEffect } from 'react';
import { useFindFirstHierarchy } from '@/services/api/hooks';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { categorySchema, HierarchyDefaultArgs } from '@/components/common/category/categories-select';
import RequestFormStepper from '@/components/common/request/request-form-stepper';

const requestCategorySchema = z.object({
  requestCategory: z.array(categorySchema),
  assignationCategory: z.array(categorySchema),
});

export type ServiceCategoryForm = z.infer<typeof requestCategorySchema>;

const NewRequestPage: React.FC = () => {
  const { data: requestHierarchy, isLoading: requestLoading } = useFindFirstHierarchy({
    select: HierarchyDefaultArgs.select,
    where: { type: 'Request' },
  });

  const { data: assignationHierarchy, isLoading: assignationLoading } = useFindFirstHierarchy({
    select: HierarchyDefaultArgs.select,
    where: { type: 'Assignation' },
  });

  const methods = useForm<ServiceCategoryForm>({
    resolver: zodResolver(requestCategorySchema),
    defaultValues: {
      requestCategory: [],
      assignationCategory: [],
    },
  });

  useEffect(() => {
    if (requestHierarchy) {
      const defaultRequestValues = requestHierarchy.levels.map((level) => ({
        id: level.id,
        value: '',
        position: level.position,
      }));
      methods.setValue('requestCategory', defaultRequestValues);
    }
    if (assignationHierarchy) {
      const defaultAssignationValues = assignationHierarchy.levels.map((level) => ({
        id: level.id,
        value: '',
        position: level.position,
      }));
      methods.setValue('assignationCategory', defaultAssignationValues);
    }
  }, [requestHierarchy, assignationHierarchy, methods]);

  if (requestLoading || assignationLoading) {
    return <div>Loading...</div>;
  }

  if (!requestHierarchy || !assignationHierarchy) {
    return <div>No data found</div>;
  }

  return <RequestFormStepper requestCategoryLevels={requestHierarchy.levels} assignationCategoryLevels={assignationHierarchy.levels} />;
};

export default NewRequestPage;
