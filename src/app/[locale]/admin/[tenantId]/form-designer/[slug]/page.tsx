import React, { ReactNode } from 'react';
import { GetFormById, GetFormWithSubmissions } from '@/actions/form';
import { redirect } from '@/i18n/routing';
import { format, formatDistance } from 'date-fns';
import { getTranslations } from 'next-intl/server';
import { FaWpforms } from 'react-icons/fa';
import { HiCursorClick } from 'react-icons/hi';
import { LuView } from 'react-icons/lu';
import { TbArrowBounce } from 'react-icons/tb';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ElementsType, FormElementInstance } from '@/components/builder-form/form-elements';
import FormLinkShare from '@/components/builder-form/form-link-share';
import VisitBtn from '@/components/builder-form/visit-btn';

import { StatsCard } from '../page';

async function FormDetailPage({
  params,
}: {
  params: {
    locale: string;
    slug: string;
  };
}) {
  const { slug, locale } = await params;
  const t = await getTranslations('admin.formBuilder.view');
  const form = await GetFormById(slug);
  if (!form) {
    throw new Error(t('formNotFound'));
  }

  if (!form.published) {
    redirect({
      locale,
      href: { pathname: '/admin/[tenantId]/form-designer/[slug]/edit', params: { tenantId: form.tenantId, slug } },
    });
  }

  const { visits, submissions } = form;

  let submissionRate = 0;

  if (visits > 0) {
    submissionRate = (submissions / visits) * 100;
  }

  const bounceRate = 100 - submissionRate;

  return (
    <Card className="flex-1">
      <CardHeader>
        <CardTitle className="flex justify-between truncate text-3xl font-bold">
          {form.name}
          <div className="flex gap-2">
            <VisitBtn shareUrl={form.shareURL} tenantId={form.tenantId} />
            <FormLinkShare shareUrl={form.shareURL} tenantId={form.tenantId} />
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="grid w-full grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard title={t('totalVisits')} icon={<LuView className="text-blue-600" />} helperText={t('visitsHelper')} value={visits.toLocaleString() ?? ''} loading={false} className="shadow-md" />

        <StatsCard
          title={t('totalSubmissions')}
          icon={<FaWpforms className="text-yellow-600" />}
          helperText={t('submissionsHelper')}
          value={submissions.toLocaleString() ?? ''}
          loading={false}
          className="shadow-md"
        />
        <StatsCard
          title={t('submissionRate')}
          icon={<HiCursorClick className="text-green-600" />}
          helperText={t('submissionRateHelper')}
          value={submissionRate.toLocaleString() + '%'}
          loading={false}
          className="shadow-md"
        />

        <StatsCard
          title={t('bounceRate')}
          icon={<TbArrowBounce className="text-red-600" />}
          helperText={t('bounceRateHelper')}
          value={bounceRate.toLocaleString() + '%'}
          loading={false}
          className="shadow-md"
        />
      </CardContent>
      <CardFooter className="flex flex-col items-start gap-2">
        <SubmissionsTable id={form.id} />
      </CardFooter>
    </Card>
  );
}

export default FormDetailPage;

type Row = Record<string, string> & {
  submittedAt: Date;
};

async function SubmissionsTable({ id }: { id: string }) {
  const t = await getTranslations('admin.formBuilder.view');
  const form = await GetFormWithSubmissions(id);

  if (!form) {
    throw new Error(t('formNotFound'));
  }

  const formElements = JSON.parse(form.content) as FormElementInstance[];
  const columns: {
    id: string;
    label: string;
    required: boolean;
    type: ElementsType;
  }[] = [];

  formElements.forEach((element) => {
    switch (element.type) {
      case 'TextField':
      case 'NumberField':
      case 'TextAreaField':
      case 'DateField':
      case 'SelectField':
      case 'CheckboxField':
        columns.push({
          id: element.id,
          label: String(element.extraAttributes?.label),
          required: Boolean(element.extraAttributes?.required),
          type: element.type,
        });
        break;
      default:
        break;
    }
  });

  const rows: Row[] = [];
  form.formSubmissions.forEach((submission) => {
    const content = JSON.parse(submission.content);
    rows.push({
      ...content,
      submittedAt: submission.createdAt,
    });
  });

  return (
    <>
      <h1 className="my-4 text-2xl font-bold">{t('submissions')}</h1>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead key={column.id} className="uppercase">
                  {column.label}
                </TableHead>
              ))}
              <TableHead className="text-right uppercase text-muted-foreground">{t('submittedAt')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row, index) => (
              <TableRow key={index}>
                {columns.map((column) => (
                  <RowCell key={column.id} type={column.type} value={row[column.id] ?? ''} />
                ))}
                <TableCell className="text-right text-muted-foreground">
                  {formatDistance(row.submittedAt, new Date(), {
                    addSuffix: true,
                  })}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}

async function RowCell({ type, value }: { type: ElementsType; value: string }) {
  let node: ReactNode = value;

  switch (type) {
    case 'DateField': {
      if (!value) break;
      const date = new Date(value);
      node = <Badge variant="outline">{format(date, 'dd/MM/yyyy')}</Badge>;
      break;
    }
    case 'CheckboxField': {
      const checked = value === 'true';
      node = <Checkbox checked={checked} disabled />;
      break;
    }
  }

  return <TableCell>{node}</TableCell>;
}
