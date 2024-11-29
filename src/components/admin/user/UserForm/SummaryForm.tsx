import React, { useState, type FC } from 'react';
import { type CreateUserInputs } from '@/connections/user';
import { type AreaUserHierarchy } from '@/server/api/routers/userRouter';
import { FiArchive, FiCalendar, FiImage, FiKey, FiLock, FiMail, FiShieldOff, FiTag, FiUser, FiUserCheck, FiUsers } from 'react-icons/fi';
import { MdOutlineFormatListNumbered, MdPerson } from 'react-icons/md';

import rswitch from '@/lib/rswitch';
import BackAndContinue from '@/components/common/back-and-continue';
import { Button } from '@/components/form';
import TabView, { Tab } from '@/components/TabView';

import TreeDiagram from './TreeDiagram';

interface ISummaryFormProps {
  user: Partial<CreateUserInputs>;
  hierarchies: AreaUserHierarchy[];
  onSubmit: () => void;
  goBack: () => void;
}

const SummaryForm: FC<ISummaryFormProps> = ({ user, hierarchies, onSubmit, goBack }) => {
  const [step, setStep] = useState<number>(0);

  return (
    <>
      <TabView value={step} onChange={setStep} clickable className="shadow-1 mb-0">
        <Tab index={0} label="User Details" Icon={MdPerson} />
        <Tab index={1} label="User Hierarchy" Icon={MdOutlineFormatListNumbered} />
      </TabView>
      <div className="flex w-full flex-col gap-2 p-10">
        {rswitch(step, {
          0: (
            <ul className="grid w-full grid-cols-1 justify-between gap-4 md:grid-cols-2">
              <li className="flex items-center gap-2">
                <FiUserCheck className="text-gray-500" />
                <span>{user.name || 'N/A'}</span>
              </li>
              <li className="flex items-center justify-end gap-2">
                <FiMail className="text-gray-500" />
                <span>{user.email || 'N/A'}</span>
              </li>
              <li className="flex items-center gap-2">
                <FiCalendar className="text-gray-500" />
                <span>{user.emailVerified ? user.emailVerified.toString() : 'N/A'}</span>
              </li>
              <li className="flex items-center justify-end gap-2">
                <FiImage className="text-gray-500" />
                {user.image ? <img src={user.image} alt="Profile" className="h-10 w-10 rounded-full" /> : 'N/A'}
              </li>
              <li className="flex items-center gap-2">
                <FiTag className="text-gray-500" />
                <span>{user.position || 'N/A'}</span>
              </li>
              <li className="flex items-center justify-end gap-2">
                <FiUser className="text-gray-500" />
                <span>{user.userName || 'N/A'}</span>
              </li>
              <li className="flex items-center gap-2">
                <FiKey className="text-gray-500" />
                <span>{user.password ? 'Set' : 'N/A'}</span>
              </li>
              <li className="flex items-center justify-end gap-2">
                <FiShieldOff className="text-gray-500" />
                <span>{user.superAdmin !== undefined ? (user.superAdmin ? 'Super Admin' : 'Standard User') : 'N/A'}</span>
              </li>
              <li className="flex items-center gap-2">
                <FiUserCheck className="text-gray-500" />
                <span>{user.isActivated !== undefined ? (user.isActivated ? 'Activated' : 'Deactivated') : 'N/A'}</span>
              </li>
              <li className="flex items-center justify-end gap-2">
                <FiLock className="text-gray-500" />
                <span>{user.isLocked !== undefined ? (user.isLocked ? 'Locked' : 'Unlocked') : 'N/A'}</span>
              </li>
              <li className="flex items-center gap-2">
                <FiUsers className="text-gray-500" />
                <span>Subordinates: {/*user.employeesUserIds && user.employeesUserIds.length > 0 ? user.employeesUserIds.join(', ') : 'N/A'*/}</span>
              </li>
              <li className="flex items-center justify-end gap-2">
                <FiUserCheck className="text-gray-500" />
                <span>Supervisor: {/*user.coordinatorId || 'N/A'*/}</span>
              </li>
              <li className="flex items-center gap-2">
                <FiArchive className="text-gray-500" />
                <span>Area: {user.area ? user.area.name : 'N/A'}</span>
              </li>
              <li className="flex items-center justify-end gap-2">
                <FiArchive className="text-gray-500" />
                <span>Tenant: {user.tenant ? user.tenant.name : 'N/A'}</span>
              </li>
              <li className="flex items-center gap-2">
                <FiTag className="text-gray-500" />
                <span>Roles: {user.roles && user.roles.length > 0 ? user.roles.map((role) => role.name).join(', ') : 'N/A'}</span>
              </li>
            </ul>
          ),
          1: (
            <div className="flex-1">
              <TreeDiagram treeData={hierarchies} />
            </div>
          ),
        })}
        <BackAndContinue goBack={goBack} type="button" goContinue={onSubmit} />
      </div>
    </>
  );
};

export default SummaryForm;
