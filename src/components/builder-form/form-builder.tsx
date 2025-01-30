'use client';

import React, { useEffect, useState } from 'react';
import { Link } from '@/i18n/routing';
import { DndContext, MouseSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core';
import { Form } from '@prisma/client';
import { Separator } from '@radix-ui/react-select';
import { ArrowLeft, ArrowRight, Check, LoaderCircleIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Confetti from 'react-confetti';

import useDesigner from '@/hooks/use-designer';
import { Button } from '@/components/ui/button';

import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../ui/card';
import Designer from './designer';
import DragOverlayWrapper from './drag-overlay-wrapper';
import FormLinkShare from './form-link-share';
import PreviewDialogBtn from './preview-dialog-btn';
import PublishFormBtn from './publish-form-btn';
import SaveFormBtn from './save-form-btn';
import VisitBtn from './visit-btn';

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
        <LoaderCircleIcon className="h-12 w-12 animate-spin" />
        <p>{t('loading')}</p>
      </div>
    );
  }

  if (form.published) {
    return (
      <>
        <Confetti width={window.innerWidth} height={window.innerHeight} recycle={false} numberOfPieces={1000} />
        <Card className="flex h-full w-full flex-col justify-between shadow-lg">
          <CardHeader>
            <Alert className="mb-6">
              <Check className="h-4 w-4" />
              <AlertTitle>{t('formPublished')}</AlertTitle>
              <AlertDescription>{t('shareThisForm')}</AlertDescription>
            </Alert>
            <CardTitle className="text-primary text-center text-3xl font-bold sm:text-4xl">{t('formPublished')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-muted-foreground text-center text-lg">{t('shareInstructions')}</p>
            <Separator />
            <div className="flex justify-center space-x-4">
              <VisitBtn shareUrl={form.shareURL} tenantId={form.tenantId} />
              <FormLinkShare shareUrl={form.shareURL} tenantId={form.tenantId} />
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" asChild className="hover:bg-primary hover:text-primary-foreground w-full transition-colors sm:w-auto">
              <Link href={{ pathname: '/admin/[tenantId]/form-designer', params: { tenantId: form.tenantId } }} className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                {t('goBackHome')}
              </Link>
            </Button>
            <Button variant="outline" asChild className="hover:bg-primary hover:text-primary-foreground transition-colors">
              <Link href={{ pathname: '/admin/[tenantId]/form-designer/[slug]', params: { tenantId: form.tenantId, slug: form.id } }} className="flex items-center gap-2">
                {t('formDetails')}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </>
    );
  }

  return (
    <div className="shadow-default dark:border-border-dark dark:bg-surface-dark bg-surface flex flex-1 flex-col rounded-sm border">
      <DndContext sensors={sensors}>
        {/* Header */}
        <div className="dark:border-border-dark border-border flex w-full items-center justify-between border-b px-6 py-4">
          <h3 className="dark:text-foreground-dark text-foreground font-medium">
            <span className="dark:text-muted-foreground-dark text-muted-foreground mr-2">{t('form')}:</span>
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
        <div className="dark:bg-muted-dark bg-muted relative flex h-[200px] w-full grow items-center justify-center overflow-y-auto bg-[url('/paper.svg')] dark:bg-[url('/paper-dark.svg')]">
          <Designer />
        </div>

        {/* Drag Overlay */}
        <DragOverlayWrapper />
      </DndContext>
    </div>
  );
}

export default FormBuilder;
