import { FC } from 'react';
import { getTranslations } from 'next-intl/server';

import CreateNewForm from '@/components/builder-form/create-form';
import { PageDialogWrapper } from '@/components/shared/page-container';

const NewRequirementPage: FC = async () => {
  const t = await getTranslations('component.form');

  return (
    <PageDialogWrapper title={t('createNewForm')} description={t('dialogDescription')}>
      <CreateNewForm />
    </PageDialogWrapper>
  );
};

export default NewRequirementPage;
