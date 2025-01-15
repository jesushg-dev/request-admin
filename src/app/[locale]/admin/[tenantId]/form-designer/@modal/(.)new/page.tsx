import { FC } from 'react';
import { getTranslations } from 'next-intl/server';

import CreateNewForm from '@/components/builder-form/create-form';
import PageDialogWrapper from '@/components/page-dialog-wrapper';

const NewRequirementPage: FC = async () => {
  const t = await getTranslations('component.formBuilder');

  return (
    <PageDialogWrapper title={t('createNewForm')} description={t('dialogDescription')}>
      <CreateNewForm />
    </PageDialogWrapper>
  );
};

export default NewRequirementPage;
