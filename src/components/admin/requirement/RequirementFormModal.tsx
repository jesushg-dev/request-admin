'use client';

import React, { FC } from 'react';
import { RouterOutputType } from '@/connections/generic_types';
import { useCreateRequirementForm } from '@/connections/requirement';
import type { CreateRequirementInputs } from '@/connections/requirement';
import { MdLockOpen } from 'react-icons/md';

import { Button, ErrorList, Input, Textarea } from '@/components/form';
import Modal, { CloseModal } from '@/components/Modal';

type InferredOutput = RouterOutputType['salesChannel']['getAll'];

interface IRequirementFormModalProps {
  onClose?: () => void;
  defaultValues?: CreateRequirementInputs | null;
  onSubmit: (data: CreateRequirementInputs) => void;
}

const RequirementFormModal: FC<IRequirementFormModalProps> = ({ onClose, defaultValues, onSubmit }) => {
  const { register, control, handleSubmit, formState } = useCreateRequirementForm(defaultValues);

  return (
    <Modal>
      <CloseModal onClick={onClose} />
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="flex flex-col gap-6">
          <div className="border-stroke shadow-default dark:border-strokedark dark:bg-boxdark rounded-sm border bg-white">
            <div className="border-stroke dark:border-strokedark border-b px-6 py-4">
              <h3 className="font-medium text-black dark:text-white">{defaultValues ? 'Edit' : 'Create'} Requirement</h3>
            </div>
            <div className="flex flex-col gap-4 p-6">
              <Input required name="name" type="text" register={register} formState={formState} label="Name" placeholder="Enter Name" maxLength={200} Icon={MdLockOpen} />
              <Textarea required name="description" register={register} formState={formState} label="Description" placeholder="Enter Description" maxLength={500} />
              <Input name="onlyRequireInNewClients" type="checkbox" register={register} formState={formState} label="Only require in new clients" />

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

export default RequirementFormModal;
