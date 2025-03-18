'use client';

import { FC } from 'react';

import { DocumentForm } from '@/components/common/document/document-form';
import { PageDialogWrapper } from '@/components/shared/page-container';

const NewRequirementPage: FC = () => {
  return (
    <PageDialogWrapper title="Client Information">
      <DocumentForm />
    </PageDialogWrapper>
  );
};

export default NewRequirementPage;
