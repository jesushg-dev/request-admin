'use client';

import React, { useEffect, useState } from 'react';
import { SquareArrowOutUpRight } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/button';

function VisitBtn({ shareUrl, tenantId }: { shareUrl: string; tenantId: string }) {
  const t = useTranslations('component.form');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null; // avoiding window not defined error
  }

  const shareLink = `${window.location.origin}/public/${tenantId}/form/submit/${shareUrl}`;
  return (
    <Button
      variant="secondary"
      onClick={() => {
        window.open(shareLink, '_blank');
      }}>
      {t('visit')}
      <SquareArrowOutUpRight className="ml-2 h-4 w-4" />
    </Button>
  );
}

export default VisitBtn;
