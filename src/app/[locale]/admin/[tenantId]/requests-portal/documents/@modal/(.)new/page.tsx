'use client';

import { FC } from 'react';

import { DocumentForm } from '@/components/common/document/document-form';
import DialogWrapper from '@/components/dialog-wrapper';

const NewRequirementPage: FC = () => {
  return (
    <DialogWrapper title="Client Information">
      <DocumentForm />
    </DialogWrapper>
  );
};

export default NewRequirementPage;
