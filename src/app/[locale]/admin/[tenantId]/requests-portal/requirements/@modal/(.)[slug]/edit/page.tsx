import { FC } from 'react';

import { RequirementForm } from '@/components/common/requirement/requirement-form';
import PageDialogWrapper from '@/components/page-dialog-wrapper';

const NewRequirementPage: FC = () => {
  return (
    <PageDialogWrapper title="Client Information">
      <RequirementForm />
    </PageDialogWrapper>
  );
};

export default NewRequirementPage;
