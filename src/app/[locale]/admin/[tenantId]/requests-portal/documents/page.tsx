'use client';

import React, { memo } from 'react';
import { useRouter } from 'next/navigation';
import { Link } from '@/i18n/routing';
import { api, RouterOutputs } from '@/trpc/react';
import { CommandClickEventArgs, CommandModel } from '@syncfusion/ej2-grids/src/grid/base/interface';
import { FabComponent } from '@syncfusion/ej2-react-buttons';
import { ColumnDirective, ColumnsDirective, CommandColumn, Filter, FilterSettingsModel, GridComponent, Group, Inject, Page, PageSettingsModel, Sort } from '@syncfusion/ej2-react-grids';
import { useTranslations } from 'next-intl';

import { triggerConfirm } from '@/lib/message';
import useSubmit from '@/hooks/use-submit';
import ErrorRetryFallback from '@/components/common/error-retry-fallback';

type DocumentOutputType = RouterOutputs['document']['findMany'][0];

const pageSettings: PageSettingsModel = { pageSize: 11 };
const filterSettings: FilterSettingsModel = { type: 'Excel' };
const commands: CommandModel[] = [
  { type: 'Edit', buttonOption: { cssClass: 'e-flat', iconCss: 'e-edit e-icons' } },
  { type: 'Delete', buttonOption: { cssClass: 'e-flat', iconCss: 'e-delete e-icons' } },
];
const editOptions = { allowEditing: true, allowAdding: true, allowDeleting: true, showConfirmDialog: false, mode: 'Dialog' };

const DocumentMainPage: React.FC = () => {
  const t = useTranslations('admin.document.main');
  const router = useRouter();

  const { mutateAsync: deleteDocumentAsync } = api.document.delete.useMutation();
  const { data, isLoading, error, refetch } = api.document.findMany.useQuery();

  const submitDeleteForm = useSubmit(deleteDocumentAsync, {
    successMessage: t('deleteSuccess'),
  });

  const commandClick = async (args: CommandClickEventArgs) => {
    if (!args.rowData || !args.commandColumn) return;
    const rowData = args.rowData as DocumentOutputType;

    if (args.commandColumn.type === 'Edit') {
      router.push(`/admin/document/${rowData.id}`);
    } else if (args.commandColumn.type === 'Delete') {
      const confirm = await triggerConfirm(t('confirmDelete'));
      if (!confirm) return;
      await submitDeleteForm({ where: { id: rowData.id } });
    }
  };

  if (isLoading) {
    return <p className="animate-pulse text-center text-lg font-medium text-gray-600 dark:text-gray-300">{t('loading')}</p>;
  }

  if (error) {
    return <ErrorRetryFallback message={t('errorLoading')} onRetry={refetch} buttonText={t('retry')} />;
  }

  return (
    <div className="flex flex-1 flex-col gap-10">
      <div className="border-stroke dark:border-strokedark border-b px-6 py-4">
        <h3 className="font-medium text-black dark:text-white">{t('title')}</h3>
      </div>
      <GridComponent
        id="document-grid"
        dataSource={data}
        allowGrouping
        allowSorting
        allowFiltering
        allowPaging
        pageSettings={pageSettings}
        filterSettings={filterSettings}
        height="100%"
        editSettings={editOptions}
        commandClick={commandClick}>
        <ColumnsDirective>
          <ColumnDirective field="id" width="150" textAlign="Left" headerText={t('columns.id.header')} />
          <ColumnDirective field="name" width="150" textAlign="Left" headerText={t('columns.name.header')} />
          <ColumnDirective field="status" width="150" textAlign="Left" headerText={t('columns.status.header')} />
          <ColumnDirective headerText={t('actions')} width="120" commands={commands} />
        </ColumnsDirective>
        <Inject services={[Page, Sort, Filter, Group, CommandColumn]} />
      </GridComponent>
      <Link href="/admin/document/new">
        <FabComponent id="fab" title={t('addNew')} cssClass="-translate-y-12 -translate-x-4" iconCss="fab-icons fab-icon-add" target="#document-grid" />
      </Link>
    </div>
  );
};

export default memo(DocumentMainPage);
