'use client';

import { FC } from 'react';

import { RequirementForm } from '@/components/common/requirement/requirement-form';
import DialogWrapper from '@/components/dialog-wrapper';

const NewRequirementPage: FC = () => {
  return (
    <DialogWrapper title="Client Information">
      <RequirementForm />
    </DialogWrapper>
  );
};

export default NewRequirementPage;
