'use client';

import React, { FC } from 'react';
import { useCreateAreaForm } from '@/connections/area';
import type { CreateAreaInputs } from '@/connections/area';
import { MdArchitecture } from 'react-icons/md';

import { Button, ErrorList, Input, Textarea } from '@/components/form';
import Modal, { CloseModal } from '@/components/Modal';

interface IAreaFormModalProps {
  onClose?: () => void;
  defaultValues?: CreateAreaInputs | null;
  onSubmit: (data: CreateAreaInputs) => void;
}

const AreaFormModal: FC<IAreaFormModalProps> = ({ onClose, defaultValues, onSubmit }) => {
  const { register, handleSubmit, formState } = useCreateAreaForm(defaultValues);

  return (
    <Modal>
      <CloseModal onClick={onClose} />
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
        <div className="border-stroke dark:border-strokedark border-b px-6 py-4">
          <h3 className="font-medium text-black dark:text-white">{defaultValues ? 'Edit' : 'Create'} Area</h3>
        </div>
        <div className="flex flex-col gap-4 p-6">
          <Input name="name" type="text" register={register} formState={formState} label="Name" placeholder="Enter Area Name" maxLength={50} Icon={MdArchitecture} />
          <Textarea name="description" register={register} formState={formState} label="Description" placeholder="Enter Description" maxLength={255} />

          <ErrorList formState={formState} />

          <div className="flex justify-end gap-4">
            <Button type="button" onClick={onClose} className="bg-gray-300 text-black dark:bg-gray-700 dark:text-white">
              Cancel
            </Button>
            <Button type="submit">Save Changes</Button>
          </div>
        </div>
      </form>
    </Modal>
  );
};

export default AreaFormModal;
