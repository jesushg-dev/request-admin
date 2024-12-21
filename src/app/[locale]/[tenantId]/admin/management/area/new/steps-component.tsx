'use client';

import React, { FC } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { defineStepper } from '@stepperize/react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { LevelType } from '@/types/prisma/hierarchy';
import { ModuleWithPermissionsType } from '@/types/prisma/module';
import { RequirementOptionType } from '@/types/prisma/requirement';
import { UserType } from '@/types/prisma/user';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import AreaForm, { areaFormSchema } from '@/components/common/area/area-form';
import CategoryForm, { categoryFormSchema } from '@/components/common/category/category-form';
import AreaRolesForm, { areaRolesFormSchema } from '@/components/common/role/role-form';
import UserRoleAssignmentForm, { userRoleFormSchema } from '@/components/common/role/user-role-assignment-form';

// Stepper definition
const { useStepper, steps } = defineStepper(
  { id: 'description', label: 'Description', schema: areaFormSchema },
  { id: 'assignationCategory', label: 'Assignation Category', schema: categoryFormSchema },
  { id: 'role', label: 'Role', schema: areaRolesFormSchema },
  { id: 'user', label: 'User', schema: userRoleFormSchema },
  { id: 'finish', label: 'Finish', schema: z.object({}) }
);

interface StepsComponentProps {
  users: UserType[];
  levels: LevelType[];
  requirements: RequirementOptionType[];
  moduleWithPermissions: ModuleWithPermissionsType[];
}

// StepsComponent: Renders stepper and step content
const StepsComponent: FC<StepsComponentProps> = ({ levels, requirements, users, moduleWithPermissions }) => {
  const stepper = useStepper();

  // Initialize React Hook Form with current step schema
  const form = useForm({
    mode: 'onTouched',
    resolver: zodResolver(stepper.current.schema),
  });

  // Handle form submission
  const onSubmit = (values: any) => {
    console.log(`Step: ${stepper.current.id}, Values:`, values);
    if (stepper.isLast) {
      stepper.reset();
    } else {
      stepper.next();
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-1 flex-col justify-between space-y-6 overflow-hidden rounded-lg border p-6">
        <nav aria-label="Steps">
          <ol className="flex items-center gap-x-4">
            {stepper.all.map((step, index, array) => (
              <React.Fragment key={step.id}>
                <li className="flex items-center gap-x-2">
                  <Button type="button" variant={index <= stepper.current.index ? 'default' : 'outline'} className="size-8 rounded-full p-0" onClick={() => stepper.goTo(step.id)}>
                    {index + 1}
                  </Button>
                  <span className="text-xs font-medium">{step.label}</span>
                </li>
                {index < array.length - 1 && <Separator className={`flex-1 ${index < stepper.current.index ? 'bg-primary' : 'bg-muted'}`} />}
              </React.Fragment>
            ))}
          </ol>
        </nav>

        {/* Step Content */}
        <div className="flex flex-1 overflow-y-hidden">
          <ScrollArea className="w-full overflow-y-auto pl-2 pr-4">
            {stepper.switch({
              description: () => <AreaForm />,
              assignationCategory: () => <CategoryForm levels={levels} requirements={requirements} />,
              role: () => <AreaRolesForm moduleWithPermissions={moduleWithPermissions} />,
              user: () => <UserRoleAssignmentForm userArray={users} roleArray={[]} />,
              finish: () => <div>Finish</div>,
            })}
          </ScrollArea>
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={stepper.prev} disabled={stepper.isFirst}>
            Back
          </Button>
          <Button type="submit">{stepper.isLast ? 'Finish' : 'Next'}</Button>
        </div>
      </form>
    </Form>
  );
};

export default StepsComponent;
