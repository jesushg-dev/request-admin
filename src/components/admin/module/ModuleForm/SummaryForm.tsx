import React, { FC } from 'react';
import type { CreateModuleWithPermissionInputs } from '@/connections/module/moduleSchemas';
import { FiBookOpen, FiKey, FiSave } from 'react-icons/fi'; // Import icons

import Button from '@/components/form/nutton';

interface ISummaryFormProps {
  module?: CreateModuleWithPermissionInputs['module'] | null;
  permissions: CreateModuleWithPermissionInputs['permissions'];
  onSubmit: () => void;
}

const SummaryForm: FC<ISummaryFormProps> = ({ module, permissions, onSubmit }) => {
  return (
    <div className="flex flex-1 flex-col justify-between gap-4 p-6">
      <div>
        <h3 className="flex items-center gap-2 text-lg font-medium text-gray-700">
          <FiBookOpen /> Module Information
        </h3>
        <div className="ml-4 mt-2 text-gray-600">
          <p>
            <strong>Name:</strong> {module?.name || 'N/A'}
          </p>
          <p>
            <strong>Description:</strong> {module?.description || 'No description provided'}
          </p>
        </div>
      </div>
      <div>
        <h3 className="flex items-center gap-2 text-lg font-medium text-gray-700">
          <FiKey /> Permissions
        </h3>
        {permissions.length > 0 ? (
          <ul className="mt-2 list-disc pl-6 text-gray-600">
            {permissions.map((permission, index) => (
              <li key={index} className="ml-4">
                <p>
                  <strong>Name:</strong> {permission.name}
                </p>
                <p>
                  <strong>Description:</strong> {permission.description || 'No description provided'}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="ml-4 text-gray-600">No permissions added.</p>
        )}
      </div>
      <Button type="button" onClick={onSubmit}>
        <FiSave /> Save Changes
      </Button>
    </div>
  );
};

export default SummaryForm;
