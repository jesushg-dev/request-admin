import React, { FC } from 'react';
import { useCreateClientForm, type CreateClientInputs } from '@/connections/client';
import { MdAccountCircle, MdAttachMoney, MdBusiness, MdCreditCard, MdEmail, MdPhone, MdWork } from 'react-icons/md';

import { Input } from '@/components/form';
import ErrorList from '@/components/form/error-list';

import BackAndContinue from '../../common/back-and-continue';

interface ClientDetailFormProps {
  goBack?: () => void;
  onSubmit: (data: CreateClientInputs) => void;
  defaultValues?: Partial<CreateClientInputs> | null;
}

const ClientDetailForm: FC<ClientDetailFormProps> = ({ defaultValues, goBack, onSubmit }) => {
  const { register, handleSubmit, formState } = useCreateClientForm(defaultValues);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-1 flex-col gap-2 p-10">
      <div className="grid grid-cols-1 gap-4 gap-y-2 text-sm md:grid-cols-6">
        <div className="md:col-span-6">
          <Input required name="name" type="text" register={register} formState={formState} label="Name" placeholder="Enter Name" Icon={MdAccountCircle} />
        </div>
        <div className="md:col-span-3">
          <Input
            required
            name="identificationNumber"
            type="text"
            register={register}
            formState={formState}
            label="Identification Number"
            placeholder="Enter Identification Number"
            Icon={MdCreditCard}
          />
        </div>
        <div className="md:col-span-3">
          <Input name="email" type="email" register={register} formState={formState} label="Email (Optional)" placeholder="Enter Email" Icon={MdEmail} />
        </div>
        <div className="md:col-span-2">
          <Input name="corporateName" type="text" register={register} formState={formState} label="Corporate Name (Optional)" placeholder="Enter Corporate Name" Icon={MdBusiness} />
        </div>
        <div className="md:col-span-2">
          <Input name="monthlyIncome" type="number" register={register} formState={formState} label="Monthly Income (Optional)" placeholder="Enter Monthly Income" Icon={MdAttachMoney} />
        </div>
        <div className="md:col-span-2">
          <Input name="occupation" type="text" register={register} formState={formState} label="Occupation (Optional)" placeholder="Enter Occupation" Icon={MdWork} />
        </div>
        <div className="md:col-span-2">
          <Input name="phone" type="text" register={register} formState={formState} label="Phone (Optional)" placeholder="Enter Phone Number" Icon={MdPhone} />
        </div>
      </div>
      <ErrorList formState={formState} />
      <BackAndContinue type="submit" goBack={goBack} />
    </form>
  );
};

export default ClientDetailForm;
