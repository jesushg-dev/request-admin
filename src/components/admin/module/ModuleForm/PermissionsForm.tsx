'use client';

import React, { FC } from 'react';
import { useCreatePermissionsArrayForm } from '@/connections/permission';
import type { CreatePermissionInputs } from '@/connections/permission';
import { triggerConfirmCallback } from '@/utils/tools/message';
import { IoMdTrash } from 'react-icons/io';
import { MdDescription, MdPerson, MdRemove } from 'react-icons/md';

import BackAndContinue from '@/components/common/back-and-continue';
import { Button, ErrorList, Input, Textarea } from '@/components/form';
import Scrollable from '@/components/Scrollable';

interface CreatePermissionsFormProps {
  goBack: () => void;
  defaultValues?: CreatePermissionInputs[];
  submitForm: (data: CreatePermissionInputs[]) => void;
}

const PermissionsForm: FC<CreatePermissionsFormProps> = ({ goBack, submitForm, defaultValues }) => {
  const { register, handleSubmit, formState, permissions } = useCreatePermissionsArrayForm({
    permissions: defaultValues,
  });

  return (
    <form className="flex flex-1 flex-col justify-between gap-2 p-6" onSubmit={handleSubmit((e) => submitForm(e.permissions || []))}>
      {permissions.fields.length === 0 && (
        //no permissions
        <div className="text-center text-gray-400">
          <p>No permissions added yet</p>
          <span className="text-gray-600">Add a permission to continue</span>
        </div>
      )}

      <Scrollable>
        <div className="flex flex-col gap-2">
          {permissions.fields.map((permission, index) => (
            <div key={permission.id || index} className="rounded border border-gray-200 p-2 shadow-sm">
              <div className="flex gap-4">
                <div className="mb-2 grid w-full grid-cols-3 items-start gap-2">
                  <Input
                    required
                    name={`permissions.${index}.name`}
                    type="text"
                    register={register}
                    formState={formState}
                    label={`#${index + 1} Name`}
                    placeholder={`Name of Permission`}
                    Icon={MdPerson}
                  />
                  <Textarea
                    containerClassName="col-span-2"
                    name={`permissions.${index}.description`}
                    register={register}
                    formState={formState}
                    rows={1}
                    label={`#${index + 1} Description`}
                    placeholder={`Briefly Describe Permission ${index + 1}`}
                    Icon={MdDescription}
                  />
                </div>
                <Button
                  type="button"
                  onClick={() => triggerConfirmCallback('This action cannot be undone.', 'Are you sure?', () => permissions.remove(index))}
                  className="flex-1 rounded bg-red-500 px-2 font-semibold text-white hover:bg-red-700">
                  <IoMdTrash />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Scrollable>

      <button
        type="button"
        onClick={() => permissions.append({ name: '', description: '', permissionId: '' })}
        className="w-full rounded border-2 border-dashed border-gray-200 p-2 text-center text-gray-600 shadow-sm hover:border-gray-400 hover:text-gray-800">
        Add Permission
      </button>

      {/**<ErrorList formState={formState} /> */}
      <BackAndContinue goBack={goBack} type="submit" />
    </form>
  );
};

export default PermissionsForm;
