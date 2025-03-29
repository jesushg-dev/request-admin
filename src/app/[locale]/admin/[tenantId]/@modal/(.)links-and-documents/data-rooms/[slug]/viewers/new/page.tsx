import { FC } from 'react';
import { getTranslations } from 'next-intl/server';

import { DataroomViewerGroupForm } from '@/components/common/data-room/dataroom-viewer-group-form';
import { PageDialogWrapper } from '@/components/shared/page-container';

interface DataroomViewerGroupNewPageProps {
  params: Promise<{ tenantId: string; slug: string }>;
}

const DataroomViewerGroupNewPage: FC<DataroomViewerGroupNewPageProps> = async ({ params }) => {
  const t = await getTranslations('admin.dataroom.viewerGroup');
  const { slug, tenantId } = await params;

  return (
    <PageDialogWrapper title={t('new.title')} description={t('new.subtitle')}>
      <DataroomViewerGroupForm dataroomId={slug} tenantId={tenantId} />
    </PageDialogWrapper>
  );
};

export default DataroomViewerGroupNewPage;
