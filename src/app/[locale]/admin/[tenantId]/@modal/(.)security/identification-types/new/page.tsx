import { FC } from 'react';

import IdentificationTypeForm from '@/components/common/identification-type/Identification-type-form';
import { PageDialogWrapper } from '@/components/shared/page-container';

const NewIdentificationTypePage: FC = () => {
  return (
    <PageDialogWrapper title="New Identification Type">
      <IdentificationTypeForm />
    </PageDialogWrapper>
  );
};

export default NewIdentificationTypePage;
