'use client';
import React, { FC } from 'react';

import { MdArchitecture } from 'react-icons/md';

import Modal, { CloseModal } from '@/components/Modal';
import { Button, ErrorList, Input, Textarea } from '@/components/Form';

import { useCreateSalesChannelForm } from '@/connections/sales-channel';
import type { CreateSalesChannelInputs } from '@/connections/sales-channel';

interface ISalesChannelFormModalProps {
  onClose?: () => void;
  defaultValues?: CreateSalesChannelInputs | null;
  onSubmit: (data: CreateSalesChannelInputs) => void;
}

const SalesChannelFormModal: FC<ISalesChannelFormModalProps> = ({ onClose, defaultValues, onSubmit }) => {
  const { register, handleSubmit, formState } = useCreateSalesChannelForm(defaultValues);

  return (
    <Modal>
      <CloseModal onClick={onClose} />
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="flex flex-col gap-6">
          <div className="border-stroke shadow-default dark:border-strokedark dark:bg-boxdark rounded-sm border bg-white">
            <div className="border-stroke dark:border-strokedark border-b px-6 py-4">
              <h3 className="font-medium text-black dark:text-white">{defaultValues ? 'Edit' : 'Create'} Sales Channel</h3>
            </div>
            <div className="flex flex-col gap-4 p-6">
              <Input required name="name" type="text" register={register} formState={formState} label="Name" placeholder="Enter Name" maxLength={50} Icon={MdArchitecture} />
              <Textarea required name="description" register={register} formState={formState} label="Description" placeholder="Enter Description" maxLength={255} />

              <ErrorList formState={formState} />

              <div className="flex justify-end gap-4">
                <Button type="button" onClick={onClose} className="bg-gray-300 text-black dark:bg-gray-700 dark:text-white">
                  Cancel
                </Button>
                <Button type="submit">Save Changes</Button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </Modal>
  );
};

export default SalesChannelFormModal;
