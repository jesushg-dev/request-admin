'use client';

import React, { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/button';

function VisitBtn({ shareUrl }: { shareUrl: string }) {
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
    <Button
      className="w-[200px]"
      onClick={() => {
        window.open(shareLink, '_blank');
      }}>
      {t('visit')}
    </Button>
  );
}

export default VisitBtn;
