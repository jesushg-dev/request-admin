import { GetFormById } from '@/actions/form';
import { redirect } from '@/i18n/routing';
import { getTranslations } from 'next-intl/server';

import { DynamicColumn } from '@/types/prisma/form';
import { FormElementInstance } from '@/components/builder-form/form-elements';
import { StatCard } from '@/components/stat-card';

import FormDetailClient from './table';

export default async function FormDetailPage({ params }: { params: Promise<{ locale: string; tenantId: string; slug: string }> }) {
  const { locale, tenantId, slug } = await params;
  const t = await getTranslations('admin.formBuilder.view');

  const form = await GetFormById(slug, tenantId);
  if (!form) {
    throw new Error('Form not found');
  }

  if (!form.published) {
    redirect({ href: { pathname: '/admin/[tenantId]/form-designer/[slug]/edit', params: { tenantId, slug } }, locale });
  }

  const columns: DynamicColumn[] = JSON.parse(form.content)
    .map((element: FormElementInstance) => {
      switch (element.type) {
        case 'TextField':
        case 'NumberField':
        case 'TextAreaField':
        case 'DateField':
        case 'SelectField':
        case 'CheckboxField':
          return {
            id: element.id,
            label: String(element.extraAttributes?.label),
            type: element.type,
          };
        default:
          return null;
      }
    })
    .filter((col: DynamicColumn) => col !== null);

  const { visits, submissions } = form;
  const submissionRate = visits > 0 ? (submissions / visits) * 100 : 0;
  const bounceRate = 100 - submissionRate;

  return (
    <FormDetailClient tenantId={tenantId} slug={slug} name={form.name} columns={columns}>
      <StatCard title={t('totalVisits')} icon={<span className="text-blue-600">👁</span>} description={t('visitsHelper')} value={visits.toLocaleString()} loading={false} />
      <StatCard title={t('totalSubmissions')} icon={<span className="text-yellow-600">📝</span>} description={t('submissionsHelper')} value={submissions.toLocaleString()} loading={false} />
      <StatCard title={t('submissionRate')} icon={<span className="text-green-600">✅</span>} description={t('submissionRateHelper')} value={submissionRate.toFixed(2) + '%'} loading={false} />
      <StatCard title={t('bounceRate')} icon={<span className="text-red-600">❌</span>} description={t('bounceRateHelper')} value={bounceRate.toFixed(2) + '%'} loading={false} />
    </FormDetailClient>
  );
}
