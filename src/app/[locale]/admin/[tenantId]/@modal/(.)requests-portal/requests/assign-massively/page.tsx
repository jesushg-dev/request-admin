import { FC } from 'react';

import AssignRequestsForm from '@/components/common/request/assign-requests-form';
import PageDialogWrapper from '@/components/page-dialog-wrapper';

const AssignMassivelyRequestsPage: FC = () => {
  return (
    <PageDialogWrapper title="Assign Requests">
      <AssignRequestsForm />
    </PageDialogWrapper>
  );
};

export default AssignMassivelyRequestsPage;
