'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { PublishForm } from '@/actions/form';
import { useTranslations } from 'next-intl';
import { FaSpinner } from 'react-icons/fa';
import { MdOutlinePublish } from 'react-icons/md';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';

function PublishFormBtn({ id }: { id: string }) {
  const t = useTranslations('component.formBuilder');
  const [loading, startTransition] = useTransition();
  const router = useRouter();

  async function publishForm() {
    try {
      await PublishForm(id);
      toast({
        title: t('success'),
        description: t('publishSuccess'),
      });
      router.refresh();
    } catch (error) {
      toast({
        title: t('error'),
        description: t('publishError'),
      });
    }
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button className="gap-2 bg-gradient-to-r from-indigo-400 to-cyan-400 text-white">
          <MdOutlinePublish className="h-4 w-4" />
          {t('publish')}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t('confirmTitle')}</AlertDialogTitle>
          <AlertDialogDescription>
            {t('confirmDescription')} <br />
            <br />
            <span className="font-medium">{t('confirmDetails')}</span>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
          <AlertDialogAction
            disabled={loading}
            onClick={(e) => {
              e.preventDefault();
              startTransition(publishForm);
            }}>
            {t('proceed')} {loading && <FaSpinner className="animate-spin" />}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default PublishFormBtn;
