import { FC } from 'react';

import IdentificationTypeForm from '@/components/common/identification-type/Identification-type-form';
import PageDialogWrapper from '@/components/page-dialog-wrapper';

const NewIdentificationTypePage: FC = () => {
  return (
    <PageDialogWrapper title="New Identification Type">
      <IdentificationTypeForm />
    </PageDialogWrapper>
  );
};

export default NewIdentificationTypePage;
