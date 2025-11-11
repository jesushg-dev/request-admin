'use client';

import { Link } from '@/i18n/routing';
import { FilePlus2 } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { useTenantContext } from '@/components/hoc/tenant-provider';

import { Button } from '../ui/button';

const CreateFormBtn = () => {
  const { tenantId } = useTenantContext();
  const t = useTranslations('admin.form.main');

  return (
    <Link
      href={{
        pathname: '/admin/[tenantId]/form-designer/new',
        params: { tenantId },
      }}>
      <Button variant="outline" className="group border-primary/20 hover:border-primary flex h-[190px] w-full flex-col items-center justify-center gap-4 border border-dashed hover:cursor-pointer">
        <FilePlus2 className="text-muted-foreground group-hover:text-primary h-8 w-8" />
        <p className="text-muted-foreground group-hover:text-primary text-xl font-bold">{t('createNewForm')}</p>
      </Button>
    </Link>
  );
};

export default CreateFormBtn;
