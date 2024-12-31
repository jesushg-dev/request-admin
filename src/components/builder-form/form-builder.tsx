'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { DndContext, MouseSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core';
import { Form } from '@prisma/client';
import { useTranslations } from 'next-intl';
import Confetti from 'react-confetti';
import { BsArrowLeft, BsArrowRight } from 'react-icons/bs';
import { ImSpinner2 } from 'react-icons/im';

import useDesigner from '@/hooks/use-designer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/use-toast';

import Designer from './designer';
import DragOverlayWrapper from './drag-overlay-wrapper';
import PreviewDialogBtn from './preview-dialog-btn';
import PublishFormBtn from './publish-form-btn';
import SaveFormBtn from './save-form-btn';

function FormBuilder({ form }: { form: Form }) {
  const t = useTranslations('component.formBuilder');
  const { setElements, setSelectedElement } = useDesigner();
  const [isReady, setIsReady] = useState(false);

  const mouseSensor = useSensor(MouseSensor, {
    activationConstraint: {
      distance: 10, // 10px
    },
  });

  const touchSensor = useSensor(TouchSensor, {
    activationConstraint: {
      delay: 300,
      tolerance: 5,
    },
  });

  const sensors = useSensors(mouseSensor, touchSensor);

  useEffect(() => {
    if (isReady) return;
    const elements = JSON.parse(form.content);
    setElements(elements);
    setSelectedElement(null);
    const readyTimeout = setTimeout(() => setIsReady(true), 500);
    return () => clearTimeout(readyTimeout);
  }, [form, setElements, isReady, setSelectedElement]);

  if (!isReady) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center">
        <ImSpinner2 className="h-12 w-12 animate-spin" />
        <p>{t('loading')}</p>
      </div>
    );
  }

  const shareUrl = `${window.location.origin}/admin/submit/${form.shareURL}`;

  if (form.published) {
    return (
      <>
        <Confetti width={window.innerWidth} height={window.innerHeight} recycle={false} numberOfPieces={1000} />
        <div className="flex h-full w-full flex-col items-center justify-center">
          <div className="max-w-md">
            <h1 className="mb-10 border-b pb-2 text-center text-4xl font-bold text-primary">{t('formPublished')}</h1>
            <h2 className="text-2xl">{t('shareThisForm')}</h2>
            <h3 className="border-b pb-10 text-xl text-muted-foreground">{t('shareInstructions')}</h3>
            <div className="my-4 flex w-full flex-col items-center gap-2 border-b pb-4">
              <Input className="w-full" readOnly value={shareUrl} />
              <Button
                className="mt-2 w-full"
                onClick={async () => {
                  await navigator.clipboard.writeText(shareUrl);
                  toast({
                    title: t('copied'),
                    description: t('linkCopied'),
                  });
                }}>
                {t('copyLink')}
              </Button>
            </div>
            <div className="flex justify-between">
              <Button variant={'link'} asChild>
                <Link href={'/'} className="gap-2">
                  <BsArrowLeft />
                  {t('goBackHome')}
                </Link>
              </Button>
              <Button variant={'link'} asChild>
                <Link href={`/admin/form-designer/forms/${form.id}`} className="gap-2">
                  {t('formDetails')}
                  <BsArrowRight />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <div className="shadow-default dark:border-border-dark dark:bg-surface-dark bg-surface flex flex-1 flex-col rounded-sm border">
      <DndContext sensors={sensors}>
        {/* Header */}
        <div className="dark:border-border-dark flex w-full items-center justify-between border-b border-border px-6 py-4">
          <h3 className="dark:text-foreground-dark font-medium text-foreground">
            <span className="dark:text-muted-foreground-dark mr-2 text-muted-foreground">{t('form')}:</span>
            {form.name}
          </h3>
          <div className="flex items-center gap-2">
            <PreviewDialogBtn />
            {!form.published && (
              <>
                <SaveFormBtn id={form.id} />
                <PublishFormBtn id={form.id} />
              </>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="dark:bg-muted-dark relative flex h-[200px] w-full flex-grow items-center justify-center overflow-y-auto bg-muted bg-[url('/paper.svg')] dark:bg-[url('/paper-dark.svg')]">
          <Designer />
        </div>

        {/* Drag Overlay */}
        <DragOverlayWrapper />
      </DndContext>
    </div>
  );
}

export default FormBuilder;
