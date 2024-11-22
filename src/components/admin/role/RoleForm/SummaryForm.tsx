import React from 'react';
import type { FC } from 'react';

import Kbd from '@/components/Kbd';
import BackAndContinue from '@/components/common/back-and-continue';

import type { IEmployee } from '@/utils/types';
import type { SelectPermissionInputs, CreateRoleInputs, CreateRoleWithPermissionsAndEmployeesInputs } from '@/connections/role';

interface ISummaryFormProps {
  role: CreateRoleInputs;
  employees: IEmployee[];
  permissions: SelectPermissionInputs;
  goBack: () => void;
  onSubmit: (data: CreateRoleWithPermissionsAndEmployeesInputs) => void;
}

const SummaryForm: FC<ISummaryFormProps> = ({ role, employees, permissions, goBack, onSubmit }) => {
  const handleSubmit = () => {
    const data: CreateRoleWithPermissionsAndEmployeesInputs = {
      roleName: role.roleName,
      description: role.description,
      employees: employees.map((employee) => employee.id),
      permissions: permissions.modulePermissions.flatMap((module) => module.permissions.map((permission) => permission.permissionId)),
    };
    onSubmit(data);
  };

  return (
    <div className="p-5">
      <div className="relative overflow-x-auto">
        <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400 rtl:text-right">
          <thead className="bg-gray-50 text-xs uppercase text-gray-700 dark:bg-gray-800 dark:text-gray-400">
            <tr>
              <th scope="col" className="px-6 py-3">
                Modulo
              </th>
              <th scope="col" className="px-6 py-3">
                Permiso
              </th>
            </tr>
          </thead>
          <tbody>
            {permissions.modulePermissions.map((module, idx) => (
              <tr key={module.moduleId} className={'bg-white dark:bg-gray-900 ' + (idx !== permissions.modulePermissions.length - 1 ? 'border-b dark:border-gray-700' : '')}>
                <td className="px-6 py-4">{module.name}</td>
                <th scope="row" className="whitespace-nowrap px-6 py-4 font-medium text-gray-500 dark:text-gray-400">
                  {module.permissions.map((permission) => (
                    <Kbd key={permission.permissionId} className="mr-2">
                      {permission.name}
                    </Kbd>
                  ))}
                </th>
              </tr>
            ))}
          </tbody>
        </table>
        <BackAndContinue goBack={goBack} type="button" goContinue={handleSubmit} />
      </div>
    </div>
  );
};

export default SummaryForm;
