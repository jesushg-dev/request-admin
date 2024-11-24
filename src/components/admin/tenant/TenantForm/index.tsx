import React, { type FC, useState } from 'react';

import { MdOutlineEmail, MdPhone, MdHome, MdWeb, MdPalette } from 'react-icons/md';
import { FaBuilding } from 'react-icons/fa';

import { api } from '@/hoc/tanstack-query-provider';
import useFormSubmit from '@/hooks/useFormSubmit';
import { Input, Button, Textarea } from '@/components/form';
import { useCreateTenantForm } from '@/connections/tenant/useTenantForm';
import type { CreateTenantInputs } from '@/connections/tenant/tenantSchemas';

import { StepperComponent, StepsDirective, StepDirective } from '@syncfusion/ej2-react-navigations';
import rswitch from '@/services/lib/rswitch';

interface ITenantFormProps {
  defaultValues?: Partial<CreateTenantInputs>;
}

const TenantForm: FC<ITenantFormProps> = ({ defaultValues }) => {
  const [step, setStep] = useState(0);
  const { mutateAsync } = api.tenant.create.useMutation();
  const { register, handleSubmit, formState } = useCreateTenantForm(defaultValues);

  const submitForm = useFormSubmit(mutateAsync);

  return (
    <>
      <div className="py-4">
        <StepperComponent
          activeStep={step}
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
          stepChanged={(e) => setStep(e.activeStep)}>
          <StepsDirective>
            <StepDirective label="Empresa" />
            <StepDirective label="Permissions" />
            <StepDirective label="Review" />
          </StepsDirective>
        </StepperComponent>
      </div>
      <form onSubmit={handleSubmit(submitForm)} className="grid grid-cols-1 gap-4 gap-y-2 text-sm md:grid-cols-5">
        {rswitch(step, {
          0: (
            <>
              <div className="md:col-span-3">
                <Input
                  name="name"
                  placeholder="Enter Tenant Name"
                  Icon={FaBuilding}
                  register={register}
                  formState={formState}
                  className="dark:bg-darkmode-800 [&:disabled:not(:checked)]:dark:bg-darkmode-800/50 [&:disabled:checked]:dark:bg-darkmode-800/50 mr-2 cursor-pointer rounded border border-slate-200 shadow-sm transition-all duration-100 ease-in-out focus:ring-4 focus:ring-primary focus:ring-opacity-20 focus:ring-offset-0 dark:border-transparent dark:focus:ring-slate-700 dark:focus:ring-opacity-50 [&:disabled:checked]:cursor-not-allowed [&:disabled:checked]:opacity-70 [&:disabled:not(:checked)]:cursor-not-allowed [&:disabled:not(:checked)]:bg-slate-100 [&[type='checkbox']]:checked:border-primary [&[type='checkbox']]:checked:border-opacity-10 [&[type='checkbox']]:checked:bg-primary [&[type='radio']]:checked:border-primary [&[type='radio']]:checked:border-opacity-10 [&[type='radio']]:checked:bg-primary"
                />
              </div>
              <div className="md:col-span-2">
                <Input
                  name="title"
                  placeholder="Enter Title"
                  Icon={MdWeb}
                  register={register}
                  formState={formState}
                  className="dark:bg-darkmode-800 [&:disabled:not(:checked)]:dark:bg-darkmode-800/50 [&:disabled:checked]:dark:bg-darkmode-800/50 mr-2 cursor-pointer rounded border border-slate-200 shadow-sm transition-all duration-100 ease-in-out focus:ring-4 focus:ring-primary focus:ring-opacity-20 focus:ring-offset-0 dark:border-transparent dark:focus:ring-slate-700 dark:focus:ring-opacity-50 [&:disabled:checked]:cursor-not-allowed [&:disabled:checked]:opacity-70 [&:disabled:not(:checked)]:cursor-not-allowed [&:disabled:not(:checked)]:bg-slate-100 [&[type='checkbox']]:checked:border-primary [&[type='checkbox']]:checked:border-opacity-10 [&[type='checkbox']]:checked:bg-primary [&[type='radio']]:checked:border-primary [&[type='radio']]:checked:border-opacity-10 [&[type='radio']]:checked:bg-primary"
                />
              </div>

              <div className="md:col-span-5">
                <Textarea
                  name="description"
                  placeholder="Enter Description"
                  Icon={MdWeb}
                  register={register}
                  formState={formState}
                  className="dark:bg-darkmode-800 [&:disabled:not(:checked)]:dark:bg-darkmode-800/50 [&:disabled:checked]:dark:bg-darkmode-800/50 mr-2 cursor-pointer rounded border border-slate-200 shadow-sm transition-all duration-100 ease-in-out focus:ring-4 focus:ring-primary focus:ring-opacity-20 focus:ring-offset-0 dark:border-transparent dark:focus:ring-slate-700 dark:focus:ring-opacity-50 [&:disabled:checked]:cursor-not-allowed [&:disabled:checked]:opacity-70 [&:disabled:not(:checked)]:cursor-not-allowed [&:disabled:not(:checked)]:bg-slate-100 [&[type='checkbox']]:checked:border-primary [&[type='checkbox']]:checked:border-opacity-10 [&[type='checkbox']]:checked:bg-primary [&[type='radio']]:checked:border-primary [&[type='radio']]:checked:border-opacity-10 [&[type='radio']]:checked:bg-primary"
                />
              </div>
            </>
          ),
          2: (
            <>
              <div className="md:col-span-2">
                <Input
                  name="primaryColor"
                  placeholder="Enter Primary Color"
                  Icon={MdPalette}
                  register={register}
                  formState={formState}
                  className="dark:bg-darkmode-800 [&:disabled:not(:checked)]:dark:bg-darkmode-800/50 [&:disabled:checked]:dark:bg-darkmode-800/50 mr-2 cursor-pointer rounded border border-slate-200 shadow-sm transition-all duration-100 ease-in-out focus:ring-4 focus:ring-primary focus:ring-opacity-20 focus:ring-offset-0 dark:border-transparent dark:focus:ring-slate-700 dark:focus:ring-opacity-50 [&:disabled:checked]:cursor-not-allowed [&:disabled:checked]:opacity-70 [&:disabled:not(:checked)]:cursor-not-allowed [&:disabled:not(:checked)]:bg-slate-100 [&[type='checkbox']]:checked:border-primary [&[type='checkbox']]:checked:border-opacity-10 [&[type='checkbox']]:checked:bg-primary [&[type='radio']]:checked:border-primary [&[type='radio']]:checked:border-opacity-10 [&[type='radio']]:checked:bg-primary"
                />
              </div>
              <div className="md:col-span-1">
                <Input
                  name="secondaryColor"
                  placeholder="Enter Secondary Color"
                  Icon={MdPalette}
                  register={register}
                  formState={formState}
                  className="dark:bg-darkmode-800 [&:disabled:not(:checked)]:dark:bg-darkmode-800/50 [&:disabled:checked]:dark:bg-darkmode-800/50 mr-2 cursor-pointer rounded border border-slate-200 shadow-sm transition-all duration-100 ease-in-out focus:ring-4 focus:ring-primary focus:ring-opacity-20 focus:ring-offset-0 dark:border-transparent dark:focus:ring-slate-700 dark:focus:ring-opacity-50 [&:disabled:checked]:cursor-not-allowed [&:disabled:checked]:opacity-70 [&:disabled:not(:checked)]:cursor-not-allowed [&:disabled:not(:checked)]:bg-slate-100 [&[type='checkbox']]:checked:border-primary [&[type='checkbox']]:checked:border-opacity-10 [&[type='checkbox']]:checked:bg-primary [&[type='radio']]:checked:border-primary [&[type='radio']]:checked:border-opacity-10 [&[type='radio']]:checked:bg-primary"
                />
              </div>
              <div className="md:col-span-5">
                <Input
                  name="contactEmail"
                  type="email"
                  placeholder="Enter Contact Email"
                  Icon={MdOutlineEmail}
                  register={register}
                  formState={formState}
                  className="dark:bg-darkmode-800 [&:disabled:not(:checked)]:dark:bg-darkmode-800/50 [&:disabled:checked]:dark:bg-darkmode-800/50 mr-2 cursor-pointer rounded border border-slate-200 shadow-sm transition-all duration-100 ease-in-out focus:ring-4 focus:ring-primary focus:ring-opacity-20 focus:ring-offset-0 dark:border-transparent dark:focus:ring-slate-700 dark:focus:ring-opacity-50 [&:disabled:checked]:cursor-not-allowed [&:disabled:checked]:opacity-70 [&:disabled:not(:checked)]:cursor-not-allowed [&:disabled:not(:checked)]:bg-slate-100 [&[type='checkbox']]:checked:border-primary [&[type='checkbox']]:checked:border-opacity-10 [&[type='checkbox']]:checked:bg-primary [&[type='radio']]:checked:border-primary [&[type='radio']]:checked:border-opacity-10 [&[type='radio']]:checked:bg-primary"
                />
              </div>
              <div className="md:col-span-2">
                <Input
                  name="contactPhone"
                  type="tel"
                  placeholder="Enter Contact Phone"
                  Icon={MdPhone}
                  register={register}
                  formState={formState}
                  className="dark:bg-darkmode-800 [&:disabled:not(:checked)]:dark:bg-darkmode-800/50 [&:disabled:checked]:dark:bg-darkmode-800/50 mr-2 cursor-pointer rounded border border-slate-200 shadow-sm transition-all duration-100 ease-in-out focus:ring-4 focus:ring-primary focus:ring-opacity-20 focus:ring-offset-0 dark:border-transparent dark:focus:ring-slate-700 dark:focus:ring-opacity-50 [&:disabled:checked]:cursor-not-allowed [&:disabled:checked]:opacity-70 [&:disabled:not(:checked)]:cursor-not-allowed [&:disabled:not(:checked)]:bg-slate-100 [&[type='checkbox']]:checked:border-primary [&[type='checkbox']]:checked:border-opacity-10 [&[type='checkbox']]:checked:bg-primary [&[type='radio']]:checked:border-primary [&[type='radio']]:checked:border-opacity-10 [&[type='radio']]:checked:bg-primary"
                />
              </div>
              <div className="md:col-span-3">
                <Input
                  name="address"
                  placeholder="Enter Address"
                  Icon={MdHome}
                  register={register}
                  formState={formState}
                  className="dark:bg-darkmode-800 [&:disabled:not(:checked)]:dark:bg-darkmode-800/50 [&:disabled:checked]:dark:bg-darkmode-800/50 mr-2 cursor-pointer rounded border border-slate-200 shadow-sm transition-all duration-100 ease-in-out focus:ring-4 focus:ring-primary focus:ring-opacity-20 focus:ring-offset-0 dark:border-transparent dark:focus:ring-slate-700 dark:focus:ring-opacity-50 [&:disabled:checked]:cursor-not-allowed [&:disabled:checked]:opacity-70 [&:disabled:not(:checked)]:cursor-not-allowed [&:disabled:not(:checked)]:bg-slate-100 [&[type='checkbox']]:checked:border-primary [&[type='checkbox']]:checked:border-opacity-10 [&[type='checkbox']]:checked:bg-primary [&[type='radio']]:checked:border-primary [&[type='radio']]:checked:border-opacity-10 [&[type='radio']]:checked:bg-primary"
                />
                <div className="md:col-span-5">
                  <Input
                    name="logoUrl"
                    placeholder="Enter Logo URL"
                    Icon={MdWeb}
                    register={register}
                    formState={formState}
                    className="dark:bg-darkmode-800 [&:disabled:not(:checked)]:dark:bg-darkmode-800/50 [&:disabled:checked]:dark:bg-darkmode-800/50 mr-2 cursor-pointer rounded border border-slate-200 shadow-sm transition-all duration-100 ease-in-out focus:ring-4 focus:ring-primary focus:ring-opacity-20 focus:ring-offset-0 dark:border-transparent dark:focus:ring-slate-700 dark:focus:ring-opacity-50 [&:disabled:checked]:cursor-not-allowed [&:disabled:checked]:opacity-70 [&:disabled:not(:checked)]:cursor-not-allowed [&:disabled:not(:checked)]:bg-slate-100 [&[type='checkbox']]:checked:border-primary [&[type='checkbox']]:checked:border-opacity-10 [&[type='checkbox']]:checked:bg-primary [&[type='radio']]:checked:border-primary [&[type='radio']]:checked:border-opacity-10 [&[type='radio']]:checked:bg-primary"
                  />
                </div>
                <div className="md:col-span-3">
                  <Input
                    name="websiteUrl"
                    placeholder="Enter Website URL"
                    Icon={MdWeb}
                    register={register}
                    formState={formState}
                    className="dark:bg-darkmode-800 [&:disabled:not(:checked)]:dark:bg-darkmode-800/50 [&:disabled:checked]:dark:bg-darkmode-800/50 mr-2 cursor-pointer rounded border border-slate-200 shadow-sm transition-all duration-100 ease-in-out focus:ring-4 focus:ring-primary focus:ring-opacity-20 focus:ring-offset-0 dark:border-transparent dark:focus:ring-slate-700 dark:focus:ring-opacity-50 [&:disabled:checked]:cursor-not-allowed [&:disabled:checked]:opacity-70 [&:disabled:not(:checked)]:cursor-not-allowed [&:disabled:not(:checked)]:bg-slate-100 [&[type='checkbox']]:checked:border-primary [&[type='checkbox']]:checked:border-opacity-10 [&[type='checkbox']]:checked:bg-primary [&[type='radio']]:checked:border-primary [&[type='radio']]:checked:border-opacity-10 [&[type='radio']]:checked:bg-primary"
                  />
                </div>
              </div>
            </>
          ),
        })}
      </form>
      <div className="intro-x mt-4 flex items-center text-xs text-slate-600 dark:text-slate-500 sm:text-sm">
        <input
          className="dark:bg-darkmode-800 [&:disabled:not(:checked)]:dark:bg-darkmode-800/50 [&:disabled:checked]:dark:bg-darkmode-800/50 mr-2 cursor-pointer rounded border border-slate-200 shadow-sm transition-all duration-100 ease-in-out focus:ring-4 focus:ring-primary focus:ring-opacity-20 focus:ring-offset-0 dark:border-transparent dark:focus:ring-slate-700 dark:focus:ring-opacity-50 [&:disabled:checked]:cursor-not-allowed [&:disabled:checked]:opacity-70 [&:disabled:not(:checked)]:cursor-not-allowed [&:disabled:not(:checked)]:bg-slate-100 [&[type='checkbox']]:checked:border-primary [&[type='checkbox']]:checked:border-opacity-10 [&[type='checkbox']]:checked:bg-primary [&[type='radio']]:checked:border-primary [&[type='radio']]:checked:border-opacity-10 [&[type='radio']]:checked:bg-primary"
          type="checkbox"
          id="remember-me"
        />
        <label className="cursor-pointer select-none" htmlFor="remember-me">
          {' '}
          I agree to the Helpdesk{' '}
        </label>
        <a className="ml-1 text-primary dark:text-slate-200" href="">
          {' '}
          Privacy Policy{' '}
        </a>{' '}
        .{' '}
      </div>
      <div className="intro-x mt-5 text-center xl:mt-8 xl:text-left">
        <button className="inline-flex w-full cursor-pointer items-center justify-center rounded-md border border-primary bg-primary px-4 py-3 align-top font-medium text-white shadow-sm transition duration-200 focus:ring-4 focus:ring-primary focus:ring-opacity-20 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-70 dark:border-primary dark:focus:ring-slate-700 dark:focus:ring-opacity-50 xl:mr-3 xl:w-32 [&:hover:not(:disabled)]:border-opacity-90 [&:hover:not(:disabled)]:bg-opacity-90 [&:not(button)]:text-center">
          {' '}
          Register{' '}
        </button>
        <button className="dark:border-darkmode-100/40 [&:hover:not(:disabled)]:dark:bg-darkmode-100/10 mt-3 inline-flex w-full cursor-pointer items-center justify-center rounded-md border border-secondary px-4 py-3 align-top font-medium text-slate-500 shadow-sm transition duration-200 focus:ring-4 focus:ring-primary focus:ring-opacity-20 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-70 dark:text-slate-300 dark:focus:ring-slate-700 dark:focus:ring-opacity-50 xl:mt-0 xl:w-32 [&:hover:not(:disabled)]:border-opacity-90 [&:hover:not(:disabled)]:bg-secondary/20 [&:hover:not(:disabled)]:bg-opacity-90 [&:not(button)]:text-center">
          {' '}
          Sign in{' '}
        </button>
      </div>
    </>
  );
};

export default TenantForm;
