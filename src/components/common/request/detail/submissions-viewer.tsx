'use client';

import React, { memo, useMemo } from 'react';
import { useCountFormSubmission, useFindManyFormSubmission } from '@/services/api/hooks';
import { Prisma } from '@prisma/client';
import { ColumnDef } from '@tanstack/react-table';
import { useTranslations } from 'next-intl';
import { parseAsInteger, parseAsStringEnum, useQueryStates } from 'nuqs';

import { getFiltersStateParser, getSortingStateParser } from '@/lib/parsers';
import { formatDate } from '@/lib/utils';
import { useDataTable } from '@/hooks/use-data-table';
import { useFetchTableData } from '@/hooks/use-fetch-table-data';
import { Card, CardContent } from '@/components/ui/card';
import ErrorRetryFallback from '@/components/common/error-retry-fallback';
import { DataTable, DataTableShell } from '@/components/data-table/data-table';
import { DataTableAdvancedToolbar } from '@/components/data-table/data-table-advanced-toolbar';
import { DataTableToolbarActions } from '@/components/data-table/data-table-toolbar-actions';

export const FormSubmissionDefaultArgs = Prisma.validator<Prisma.FormSubmissionDefaultArgs>()({
  select: {
    id: true,
    createdAt: true,
    form: { select: { name: true, content: true } },
    keys: { select: { key: true, value: true } },
  },
});

export type FormSubmission = Prisma.FormSubmissionGetPayload<typeof FormSubmissionDefaultArgs>;

type ProcessedSubmission = {
  id: string;
  formName: string;
  createdAt: Date;
  content: Record<string, string>;
};

const searchParamsParsers = {
  page: parseAsInteger.withDefault(1),
  perPage: parseAsInteger.withDefault(100),
  sort: getSortingStateParser<FormSubmission>().withDefault([{ id: 'createdAt', desc: true }]),
  filters: getFiltersStateParser<FormSubmission>().withDefault([]),
  joinOperator: parseAsStringEnum(['and', 'or']).withDefault('and'),
};

interface FormSubmissionsViewerProps {
  requestId: string;
}

const FormSubmissionsViewer: React.FC<FormSubmissionsViewerProps> = ({ requestId }) => {
  const t = useTranslations('admin.request.view.submissions');
  const [search] = useQueryStates(searchParamsParsers);

  const { data, isLoading, isError, error, refetch, pageCount } = useFetchTableData<FormSubmission, Prisma.FormSubmissionFindManyArgs, Prisma.FormSubmissionCountArgs>({
    search,
    useCountHook: useCountFormSubmission,
    useFindManyHook: useFindManyFormSubmission,
    defaultArgs: {
      ...FormSubmissionDefaultArgs,
      where: { requestId },
    },
  });

  const formSubmissions = useMemo<ProcessedSubmission[]>(() => {
    return (
      data?.map((submission) => {
        const elements = JSON.parse(submission.form.content || '[]') as { id: string; extraAttributes: { label: string } }[];

        const submissionContent: Record<string, string> = submission.keys.reduce(
          (acc, { key, value }) => {
            const element = elements.find((element) => element.id === key);
            if (element && element.extraAttributes.label) {
              acc[element.extraAttributes.label] = String(value);
            }
            return acc;
          },
          {} as Record<string, string>
        );

        return {
          id: submission.id,
          formName: submission.form.name,
          createdAt: submission.createdAt,
          content: submissionContent,
        };
      }) || []
    );
  }, [data]);

  const { columns } = useMemo(() => getTableConfiguration({ t }), [t]);

  const { table } = useDataTable({
    data: formSubmissions,
    columns,
    pageCount,
    enableAdvancedFilter: true,
    initialState: {
      sorting: [{ id: 'createdAt', desc: true }],
      columnVisibility: {
        createdAt: false,
      },
    },
  });

  if (isError && error) return <ErrorRetryFallback error={error} onRetry={refetch} />;

  return (
    <DataTableShell table={table}>
      <DataTable table={table} isLoading={isLoading} emptyState={{ title: t('noSubmissions.title'), description: t('noSubmissions.description') }}>
        <DataTableAdvancedToolbar table={table} isFilterHidden isSortHidden isDateRangeHidden>
          <div className="flex items-center gap-2">
            <DataTableToolbarActions table={table} entityLabel={t('entityLabel')} exportFilename="form-submissions" />
          </div>
        </DataTableAdvancedToolbar>
      </DataTable>
    </DataTableShell>
  );
};

interface GetTableConfigurationProps {
  t: ReturnType<typeof useTranslations>;
}

function getTableConfiguration({ t }: GetTableConfigurationProps) {
  const columns: ColumnDef<ProcessedSubmission>[] = [
    {
      id: 'formName',
      accessorKey: 'formName',
      header: t('columns.formName'),
      size: 80,
    },
    {
      id: 'createdAt',
      accessorFn: (row) => formatDate(row.createdAt),
      header: t('columns.submittedAt'),
    },
    {
      id: 'content',
      header: t('columns.content'),
      cell: ({ row }) => (
        <Card>
          <CardContent className="p-4">
            {Object.entries(row.original.content).map(([key, value]) => (
              <div key={key} className="mb-2">
                <span className="font-semibold">{key}:</span> {value}
              </div>
            ))}
          </CardContent>
        </Card>
      ),
    },
  ];

  return { columns };
}

export default memo(FormSubmissionsViewer);
/*
function CardView({ submissions, columnVisibility }: { submissions: FormSubmission[]; columnVisibility: ColumnVisibility }) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {submissions.map((submission) => (
        <Card key={submission.id}>
          <CardHeader>{columnVisibility.formName && <CardTitle>{submission.formName}</CardTitle>}</CardHeader>
          <CardContent>
            {columnVisibility.submittedAt && <p className="mb-2 text-sm text-gray-500">Submitted: {new Date(submission.submittedAt).toLocaleString()}</p>}
            {columnVisibility.content && (
              <div className="space-y-2">
                {Object.entries(submission.content).map(([key, value]) => (
                  <div key={key}>
                    <span className="font-semibold">{key}:</span> {value}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}*/
