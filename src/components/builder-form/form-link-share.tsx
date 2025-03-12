'use client';

import React, { useEffect, useState } from 'react';
import { Check, ClipboardPasteIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';

function FormLinkShare({ shareUrl, tenantId }: { shareUrl: string; tenantId: string }) {
  const t = useTranslations('component.form');
  const [mounted, setMounted] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopyLink = async () => {
    const shareLink = `${window.location.origin}/public/${tenantId}/form/submit/${shareUrl}`;
    await navigator.clipboard.writeText(shareLink);
    setCopied(true);
    toast(t('copied'), {
      description: t('linkCopied'),
    });
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null; // avoiding window not defined error
  }

  return (
    <Button onClick={handleCopyLink}>
      {copied ? t('copied') : t('copyLink')}
      {copied ? <Check className="ml-2 h-4 w-4" /> : <ClipboardPasteIcon className="ml-2 h-4 w-4" />}
    </Button>
  );
}

export default FormLinkShare;
