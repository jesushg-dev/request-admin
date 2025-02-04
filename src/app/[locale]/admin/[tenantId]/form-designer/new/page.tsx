import { FC } from 'react';
import { getTranslations } from 'next-intl/server';

import CreateNewForm from '@/components/builder-form/create-form';
import { PageCardWrapper } from '@/components/page-card-wrapper';

const NewRequirementPage: FC = async () => {
  const t = await getTranslations('component.formBuilder');

  return (
    <PageCardWrapper title={t('createNewForm')} description={t('dialogDescription')}>
      <CreateNewForm />
    </PageCardWrapper>
  );
};

export default NewRequirementPage;
