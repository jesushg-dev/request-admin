'use client';

import React from 'react';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden'; // Import VisuallyHidden if not already part of your components
import { useTranslations } from 'next-intl';
import { MdPreview } from 'react-icons/md';

import useDesigner from '@/hooks/use-designer';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

import { ScrollArea } from '../ui/scroll-area';
import { FormElements } from './form-elements';

function PreviewDialogBtn() {
  const t = useTranslations('component.formBuilder');
  const { elements } = useDesigner();

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <MdPreview className="h-6 w-6" />
          {t('preview')}
        </Button>
      </DialogTrigger>
      <DialogContent className="flex h-screen max-h-screen w-screen max-w-full grow flex-col gap-0 p-0">
        {/* Dialog Title with Hidden Accessibility Text */}
        <DialogTitle>
          <VisuallyHidden>{t('formPreview')}</VisuallyHidden>
        </DialogTitle>

        {/* Header Section */}
        <div className="border-b border-border px-4 py-2">
          <p className="text-lg font-bold text-foreground">{t('formPreview')}</p>
          <p className="text-sm text-muted-foreground">{t('formPreviewDescription')}</p>
        </div>

        {/* Main Content Area */}
        <div className="dark:bg-muted-dark flex grow flex-col items-center justify-center overflow-y-hidden bg-muted bg-[url('/paper.svg')] p-4 dark:bg-[url('/paper-dark.svg')]">
          <div className="flex h-full w-full max-w-[620px] grow flex-col gap-4 overflow-y-hidden rounded-2xl bg-background">
            <ScrollArea className="p-8">
              <div className="m-1 flex flex-col gap-4">
                {elements.map((element) => {
                  const FormComponent = FormElements[element.type].formComponent;
                  return <FormComponent key={element.id} elementInstance={element} />;
                })}
              </div>
            </ScrollArea>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default PreviewDialogBtn;
