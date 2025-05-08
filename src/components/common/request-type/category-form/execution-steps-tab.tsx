'use client';

import { useEffect, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Edit, Link2, MoveDown, MoveUp, Plus, Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useFieldArray, useForm, useFormContext } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormField } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import Select from '@/components/custom-ui/select';
import { FormItem } from '@/components/shared/form-root';

import { RequestCategoryValues } from '.';

export const stepFormSchema = z.object({
  id: z.string(),
  order: z.number(),
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  description: z.string().optional(),
  estimatedTime: z.coerce.number().min(1, 'El tiempo debe ser al menos 1 minuto'),
  responsible: z.string().min(2, 'Especifique un responsable'),
  linkedGuides: z.array(z.string()).optional(),
});

type StepFormValues = z.infer<typeof stepFormSchema>;

const linkGuidesSchema = z.object({
  guideIds: z.array(z.string()),
});

type LinkGuidesFormValues = z.infer<typeof linkGuidesSchema>;

type ExecutionStep = StepFormValues & {
  id: string;
  order: number;
  linkedGuides?: string[];
};

type Guide = {
  id: string;
  title: string;
  description?: string;
  fileType: 'PDF' | 'Excel' | 'Video';
};

export function ExecutionStepsTab() {
  const t = useTranslations('admin.requestType.create.executionTab');
  const { control, watch } = useFormContext<RequestCategoryValues>();
  const { fields, append, remove, swap, update } = useFieldArray({ control, name: 'executionSteps' });

  const [modalOpen, setModalOpen] = useState(false);
  const [linkGuidesModalOpen, setLinkGuidesModalOpen] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState<number | null>(null);

  const guides = watch('guides', []) as Guide[];
  const executionSteps = watch('executionSteps', []) as ExecutionStep[];
  const totalEstimatedTime = executionSteps.reduce((total, step) => total + step.estimatedTime, 0);

  const handleSaveStep = (data: StepFormValues) => {
    if (currentStepIndex !== null) {
      update(currentStepIndex, {
        ...executionSteps[currentStepIndex],
        ...data,
      });
      toast.success(t('updateSuccess'), {
        description: t('updateSuccessDescription'),
      });
    } else {
      append({
        ...data,
        id: crypto.randomUUID(),
        order: fields.length + 1,
        linkedGuides: [],
      });
      toast.success(t('createSuccess'), {
        description: t('createSuccessDescription'),
      });
    }
    setModalOpen(false);
  };

  const handleDeleteStep = (index: number) => {
    remove(index);
    toast.success(t('deleteSuccess'), {
      description: t('deleteSuccessDescription'),
    });
  };

  const handleMoveStep = (index: number, direction: 'up' | 'down') => {
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === executionSteps.length - 1)) return;
    swap(index, direction === 'up' ? index - 1 : index + 1);
  };

  const handleLinkGuides = (selectedGuides: string[] | undefined) => {
    if (currentStepIndex !== null && selectedGuides) {
      update(currentStepIndex, {
        ...executionSteps[currentStepIndex],
        linkedGuides: selectedGuides,
      });
      toast.success(t('linkSuccess'), {
        description: t('linkSuccessDescription'),
      });
    }
    setLinkGuidesModalOpen(false);
  };

  const handleAddStep = () => {
    setCurrentStepIndex(null);
    setModalOpen(true);
  };

  return (
    <>
      {fields.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">{t('noStepsConfigured')}</div>
      ) : (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-medium">{t('totalEstimatedTime')}</h3>
              <p className="text-muted-foreground">
                {totalEstimatedTime} {t('minutes')}
              </p>
            </div>
          </div>

          {fields.map((field, index) => (
            <div key={field.id} className="mb-8 relative">
              <div className="flex items-start gap-4">
                <div className="flex flex-col items-center">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold">{index + 1}</div>
                  {index < fields.length - 1 && <div className="w-0.5 h-16 bg-border mt-2"></div>}
                </div>
                <div className="flex-1">
                  <Card>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle>{field.name}</CardTitle>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => handleMoveStep(index, 'up')} disabled={index === 0} aria-label={t('moveUp')}>
                            <MoveUp className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => handleMoveStep(index, 'down')} disabled={index === fields.length - 1} aria-label={t('moveDown')}>
                            <MoveDown className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => {
                              setCurrentStepIndex(index);
                              setModalOpen(true);
                            }}
                            aria-label={t('editStep')}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => handleDeleteStep(index)} aria-label={t('deleteStep')}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => {
                              setCurrentStepIndex(index);
                              setLinkGuidesModalOpen(true);
                            }}
                            aria-label={t('linkGuides')}>
                            <Link2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {field.description && <p className="text-sm text-muted-foreground mb-4">{field.description}</p>}
                      <div className="flex flex-wrap gap-4">
                        <div>
                          <span className="text-xs text-muted-foreground block">{t('estimatedTime')}</span>
                          <span className="text-sm font-medium">
                            {field.estimatedTime} {t('minutes')}
                          </span>
                        </div>
                        <div>
                          <span className="text-xs text-muted-foreground block">{t('responsible')}</span>
                          <span className="text-sm font-medium">{field.responsible}</span>
                        </div>
                      </div>
                      <div className="mt-4">
                        <span className="text-xs text-muted-foreground block mb-2">{t('linkedGuides')}</span>
                        {(field.linkedGuides?.length ?? 0) > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {field.linkedGuides?.map((guideId) => {
                              const guide = guides.find((g) => g.id === guideId);
                              return (
                                <Badge key={guideId} variant="secondary">
                                  {guide?.title || t('guideNotFound')}
                                </Badge>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="text-sm text-muted-foreground">{t('noLinkedGuides')}</div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Button onClick={handleAddStep} type="button" variant="dashed" className="w-full" size="sm">
        <Plus className="mr-2 h-4 w-4" />
        {t('addStep')}
      </Button>

      <StepModal open={modalOpen} onClose={() => setModalOpen(false)} onSave={handleSaveStep} initialData={currentStepIndex !== null ? executionSteps[currentStepIndex] : undefined} />

      <LinkGuidesModal
        open={linkGuidesModalOpen}
        onClose={handleLinkGuides}
        guides={guides}
        initialSelectedGuides={currentStepIndex !== null ? executionSteps[currentStepIndex].linkedGuides || [] : []}
      />
    </>
  );
}

const STEP_INITIAL_DATA: StepFormValues = {
  id: '',
  name: '',
  order: 0,
  description: '',
  estimatedTime: 1,
  responsible: '',
  linkedGuides: [],
};

function StepModal({ open, onClose, onSave, initialData }: { open: boolean; onClose: () => void; onSave: (data: StepFormValues) => void; initialData?: ExecutionStep }) {
  const t = useTranslations('admin.requestType.create.executionTab');

  const form = useForm<StepFormValues>({
    resolver: zodResolver(stepFormSchema),
    defaultValues: STEP_INITIAL_DATA,
  });

  useEffect(() => {
    form.reset(initialData ?? STEP_INITIAL_DATA);
  }, [open, initialData, form]);

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{initialData ? t('editStep') : t('addStep')}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSave)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem label={t('stepName')} description={t('stepNameDescription')}>
                  <Input placeholder={t('stepNamePlaceholder')} {...field} />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem label={t('description')} description={t('stepDescriptionDescription')}>
                  <Textarea placeholder={t('stepDescriptionPlaceholder')} {...field} value={field.value || ''} />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="estimatedTime"
                render={({ field }) => (
                  <FormItem label={t('estimatedTime')} description={t('estimatedTimeDescription')}>
                    <Input type="number" placeholder={t('minutesPlaceholder')} {...field} onChange={(e) => field.onChange(Number(e.target.value))} />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="responsible"
                render={({ field }) => (
                  <FormItem label={t('responsible')} description={t('responsibleDescription')}>
                    <Input placeholder={t('responsiblePlaceholder')} {...field} />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button variant="outline" type="button" onClick={onClose}>
                {t('cancel')}
              </Button>
              <Button type="submit">{initialData ? t('saveChanges') : t('createStep')}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

function LinkGuidesModal({ open, onClose, guides, initialSelectedGuides }: { open: boolean; onClose: (savedGuides?: string[]) => void; guides: Guide[]; initialSelectedGuides: string[] }) {
  const t = useTranslations('admin.requestType.create.executionTab');

  const form = useForm<LinkGuidesFormValues>({
    resolver: zodResolver(linkGuidesSchema),
    defaultValues: {
      guideIds: initialSelectedGuides,
    },
  });

  useEffect(() => {
    form.reset({ guideIds: initialSelectedGuides });
  }, [open, initialSelectedGuides, form]);

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('linkGuides')}</DialogTitle>
          <DialogDescription>{t('linkGuidesDescription')}</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit((data) => onClose(data.guideIds))} className="space-y-4">
            <FormField
              control={form.control}
              name="guideIds"
              render={({ field }) => (
                <FormItem label={t('selectGuides')} description={t('selectGuidesDescription')}>
                  <Select
                    menuPortalTarget={document.body}
                    isMulti
                    isLoading={false}
                    isSearchable
                    isClearable
                    options={guides.map((guide) => ({
                      value: guide.id,
                      label: guide.title,
                    }))}
                    value={guides.filter((guide) => field.value.includes(guide.id)).map((guide) => ({ value: guide.id, label: guide.title }))}
                    onChange={(selected) => field.onChange(selected.map((option) => option.value))}
                  />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button variant="outline" type="button" onClick={() => onClose()}>
                {t('cancel')}
              </Button>
              <Button type="button">{t('save')}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
