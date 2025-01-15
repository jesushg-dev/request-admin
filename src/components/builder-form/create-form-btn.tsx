'use client';

import { Link } from '@/i18n/routing';
import { FilePlus2 } from 'lucide-react';
import { useTranslations } from 'next-intl';

import useTenantId from '@/hooks/use-tenant-id';

import { Button } from '../ui/button';

const CreateFormBtn = () => {
  const tenantId = useTenantId();
  const t = useTranslations('admin.formBuilder.main');

  return (
    <Link
      href={{
        pathname: '/admin/[tenantId]/form-designer/new',
        params: { tenantId },
      }}>
      <Button variant="outline" className="group flex h-[190px] w-full flex-col items-center justify-center gap-4 border border-dashed border-primary/20 hover:cursor-pointer hover:border-primary">
        <FilePlus2 className="h-8 w-8 text-muted-foreground group-hover:text-primary" />
        <p className="text-xl font-bold text-muted-foreground group-hover:text-primary">{t('createNewForm')}</p>
      </Button>
    </Link>
  );
};

export default CreateFormBtn;
