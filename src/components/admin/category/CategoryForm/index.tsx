'use client';

import React, { type FC, useState } from 'react';
import { StepperComponent, StepsDirective, StepDirective } from '@syncfusion/ej2-react-navigations';

import rswitch from '@/services/lib/rswitch';
import SubCategoryForm from './SubCategoryForm';
import CardForm from '@/components/common/CardForm';
import CategoryDetailForm from './CategoryDetailForm';
import type { CreateCategoryInputs, CreateSubcategoryArrayInputs } from '@/connections/category';
import SummaryForm from './SummaryForm';

type SubCategoryState = CreateSubcategoryArrayInputs | null;

interface RoleFormProps {
  roleId?: string;
  defaultValues?: CreateCategoryInputs | null;
  onSubmit: (data: CreateCategoryInputs) => void;
}

const CategoryForm: FC<RoleFormProps> = ({ defaultValues, onSubmit }) => {
  const [step, setStep] = useState(0);
  const [category, setRole] = useState<CreateCategoryInputs | null>(defaultValues || null);

  const [subCategories, setSubCategories] = useState<SubCategoryState>(defaultValues ? { subCategories: defaultValues.subCategories || [] } : null);

  const onSubmitCategory = (data: CreateCategoryInputs) => {
    setRole(data);
    setStep(1);
  };

  const onSubmitSubCategory = (data: SubCategoryState) => {
    setSubCategories(data);
    setStep(2);
  };

  return (
    <CardForm
      header={
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
        <StepperComponent activeStep={step} stepChanged={(e) => setStep(e.activeStep)}>
          <StepsDirective>
            <StepDirective label="Category" />
            <StepDirective label="Subcategory" />
            <StepDirective label="Review" />
          </StepsDirective>
        </StepperComponent>
      }>
      {rswitch(step, {
        0: <CategoryDetailForm defaultValues={category} onSubmit={onSubmitCategory} />,
        1: <SubCategoryForm goBack={() => setStep(0)} defaultValues={subCategories} onSubmit={onSubmitSubCategory} />,
        2: <>{category && subCategories && <SummaryForm category={category} subCategories={subCategories} goBack={() => setStep(1)} onSubmit={onSubmit} />}</>,
      })}
    </CardForm>
  );
};

export default CategoryForm;
