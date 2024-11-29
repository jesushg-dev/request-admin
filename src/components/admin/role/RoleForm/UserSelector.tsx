'use client';

import React, { useState, type FC } from 'react';
import { triggerError } from '@/utils/tools/message';
import { type IEmployee } from '@/utils/types';

import BackAndContinue from '@/components/common/back-and-continue';
import EmployeeSelector from '@/components/common/EmployeeSelector';

interface IUserSelectorProps {
  goBack: () => void;
  defaultValues?: IEmployee[];
  onSubmit: (data: IEmployee[]) => void;
}

const UserSelector: FC<IUserSelectorProps> = ({ goBack, defaultValues, onSubmit }) => {
  const [selected, setSelected] = useState<IEmployee[]>(defaultValues || []);

  const handleContinue = async () => {
    if (selected.length === 0) {
      await triggerError('Debes seleccionar al menos un usuario', 'Error');
      return;
    }

    onSubmit(selected);
  };

  return (
    <div className="flex flex-1 flex-col gap-2 p-10">
      <EmployeeSelector values={selected} onChange={setSelected} />
      <BackAndContinue goBack={goBack} goContinue={handleContinue} />
    </div>
  );
};

export default UserSelector;
