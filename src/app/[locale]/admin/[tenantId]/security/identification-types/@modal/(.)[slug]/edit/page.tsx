import { FC } from 'react';

import IdentificationTypeForm from '@/components/common/identification-type/Identification-type-form';
import PageDialogWrapper from '@/components/page-dialog-wrapper';

const EditIdentificationTypePage: FC = () => {
  return (
    <PageDialogWrapper title="Edit Identification Type">
      <IdentificationTypeForm />
    </PageDialogWrapper>
  );
};

export default EditIdentificationTypePage;
