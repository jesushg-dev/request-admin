'use client';

import { Form } from '@prisma/client';
import React, { useEffect, useState } from 'react';
import PreviewDialogBtn from './PreviewDialogBtn';
import PublishFormBtn from './PublishFormBtn';
import SaveFormBtn from './SaveFormBtn';
import Designer from './Designer';
import { DndContext, MouseSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core';
import DragOverlayWrapper from './DragOverlayWrapper';
import useDesigner from '../../hooks/use-designer';
import { ImSpinner2 } from 'react-icons/im';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { toast } from '../ui/use-toast';
import Link from 'next/link';
import { BsArrowLeft, BsArrowRight } from 'react-icons/bs';
import Confetti from 'react-confetti';

function FormBuilder({ form }: { form: Form }) {
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
            <h1 className="mb-10 border-b pb-2 text-center text-4xl font-bold text-primary">🎊🎊 Form Published 🎊🎊</h1>
            <h2 className="text-2xl">Share this form</h2>
            <h3 className="border-b pb-10 text-xl text-muted-foreground">Anyone with the link can view and submit the form</h3>
            <div className="my-4 flex w-full flex-col items-center gap-2 border-b pb-4">
              <Input className="w-full" readOnly value={shareUrl} />
              <Button
                className="mt-2 w-full"
                onClick={async () => {
                  await navigator.clipboard.writeText(shareUrl);
                  toast({
                    title: 'Copied!',
                    description: 'Link copied to clipboard',
                  });
                }}>
                Copy link
              </Button>
            </div>
            <div className="flex justify-between">
              <Button variant={'link'} asChild>
                <Link href={'/'} className="gap-2">
                  <BsArrowLeft />
                  Go back home
                </Link>
              </Button>
              <Button variant={'link'} asChild>
                <Link href={`/admin/form-designer/forms/${form.id}`} className="gap-2">
                  Form details
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
    <div className="border-stroke shadow-default dark:border-strokedark dark:bg-boxdark flex flex-1 flex-col rounded-sm border bg-white">
      <DndContext sensors={sensors}>
        <div className="border-stroke dark:border-strokedark flex w-full items-center justify-between border-b px-6 py-4">
          <h3 className="font-medium text-black dark:text-white">
            <span className="mr-2 text-muted-foreground">Form:</span>
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
        <div className="relative flex h-[200px] w-full flex-grow items-center justify-center overflow-y-auto bg-accent bg-[url(/paper.svg)] dark:bg-[url(/paper-dark.svg)]">
          <Designer />
        </div>
        <DragOverlayWrapper />
      </DndContext>
    </div>
  );
}

export default FormBuilder;
