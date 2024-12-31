'use client';

import React, { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { ImShare } from 'react-icons/im';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/use-toast';

function FormLinkShare({ shareUrl }: { shareUrl: string }) {
  const t = useTranslations('component.formBuilder');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null; // avoiding window not defined error
  }

  const shareLink = `${window.location.origin}/admin/submit/${shareUrl}`;
  return (
    <div className="flex flex-grow items-center gap-4">
      <Input value={shareLink} readOnly />
      <Button
        className="w-[250px]"
        onClick={async () => {
          await navigator.clipboard.writeText(shareLink);
          toast({
            title: t('copied'),
            description: t('linkCopied'),
          });
        }}>
        <ImShare className="mr-2 h-4 w-4" />
        {t('shareLink')}
      </Button>
    </div>
  );
}

export default FormLinkShare;
