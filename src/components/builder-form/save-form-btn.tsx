'use client';

import React, { useTransition } from 'react';
import { UpdateFormContent } from '@/actions/form';
import { LoaderCircleIcon, SaveIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';

import useDesigner from '@/hooks/use-designer';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';

function SaveFormBtn({ id }: { id: string }) {
  const t = useTranslations('component.formBuilder');
  const { elements } = useDesigner();
  const [loading, startTransition] = useTransition();

  const updateFormContent = async () => {
    try {
      const jsonElements = JSON.stringify(elements);
      await UpdateFormContent(id, jsonElements);
      toast({
        title: t('success'),
        description: t('saveSuccess'),
      });
    } catch {
      toast({
        title: t('error'),
        description: t('saveError'),
        variant: 'destructive',
      });
    }
  };

  return (
    <Button
      variant="outline"
      className="gap-2"
      disabled={loading}
      onClick={() => {
        startTransition(updateFormContent);
      }}>
      <SaveIcon className="h-4 w-4" />
      {t('save')}
      {loading && <LoaderCircleIcon className="animate-spin" />}
    </Button>
  );
}

export default SaveFormBtn;
