'use client';

import { useMemo, useRef, useState, useTransition } from 'react';
import { updateCurrentClassification } from '@/actions/request-assignment';
import { zodResolver } from '@hookform/resolvers/zod';
import { Building, CalendarDays, Info, Layers, SquarePen, Users } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { AssignmentLevelType, RequestLevelType } from '@/types/zenstackhq/hierarchy';
import useMessage from '@/lib/message';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormField } from '@/components/ui/form';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import Select, { OptionType } from '@/components/custom-ui/select';
import { Hint } from '@/components/hint';
import { FormActions, FormContent, FormItem, FormRoot, FormSection } from '@/components/shared/form-root';
import { useReassignAreaSchema, type TReassignAreaSchema } from '@/services/schemas/request';

import { RequestFormStepperType } from '../request-form-stepper';
import { AssignmentCategoryFields, CombinedCategoriesValues, RequestCategoryFields } from '../request-form-stepper/classification-step';

export type ReassignAreaFormValues = TReassignAreaSchema;

interface ReassignAreaModalProps {
  tenantId: string;
  enableAssignmentChange: boolean;
  isReassignModalOpen: boolean;
  setIsReassignModalOpen: (state: boolean) => void;
  request: Pick<RequestFormStepperType, 'id' | 'areaId' | 'requestCategory' | 'assignmentCategory'>;
  requestLevelTypes: RequestLevelType[];
  assignmentLevelTypes: AssignmentLevelType[];
  relatedAssignmentCount: number;
  relatedRequestCount: number;
}

export function ReassignAreaModal({
  tenantId,
  enableAssignmentChange,
  isReassignModalOpen,
  request,
  setIsReassignModalOpen,
  requestLevelTypes,
  assignmentLevelTypes,
  relatedAssignmentCount,
  relatedRequestCount,
}: ReassignAreaModalProps) {
  const formRef = useRef<HTMLDivElement>(null);
  const t = useTranslations('admin.request.form.classificationStep');
  const message = useMessage();
  const reassignAreaSchema = useReassignAreaSchema();

  const form = useForm({
    resolver: zodResolver(reassignAreaSchema),
  });

  const [isPending, startTransition] = useTransition();
  const [currentClassification, setCurrentClassification] = useState<CombinedCategoriesValues>(request);

  const notifyOptions = useMemo<OptionType[]>(() => {
    return [
      { value: 'requester', label: t('reassign.notify.requester') },
      { value: 'area', label: t('reassign.notify.area') },
      { value: 'both', label: t('reassign.notify.both') },
    ];
  }, [t]);

  const handleSubmit = async (data: ReassignAreaFormValues) => {
    const promise = updateCurrentClassification(tenantId, request.id, data);

    const confirmed = await message.warning(t('reassign.confirm.description'), t('reassign.confirm.title'));
    if (!confirmed) return;

    startTransition(() => {
      toast.promise(promise, {
        loading: t('toast.loading'),
        success: () => {
          setIsReassignModalOpen(false);
          setCurrentClassification({ areaId: data.areaId, requestCategory: data.requestCategory, assignmentCategory: data.assignmentCategory });
          window.location.reload();
          return t('reassign.toast.description', { requestId: request.id, area: data.areaId.label });
        },
        error: (error) => {
          console.error('Error assigning request:', error);
          return t('toast.error', { error: error.message });
        },
      });
    });
  };

  return (
    <>
      <div className="flex gap-4 w-full">
        <div className="flex-1 flex flex-col">
          <div className="flex flex-col">
            <div className="text-sm font-medium text-muted-foreground">{t('area')}</div>
            <p>{currentClassification.areaId.label ?? 'N/A'}</p>
          </div>

          <div className="flex-1 flex flex-col">
            <div className="text-sm font-medium text-muted-foreground">{t('requestType')}</div>
            <div className="flex items-center">
              <p>{currentClassification.requestCategory.slice(-1)[0].label}</p>
              <HoverCard>
                <HoverCardTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <Info />
                  </Button>
                </HoverCardTrigger>
                <HoverCardContent className="w-80">
                  <div className="flex justify-between space-x-4">
                    <Avatar>
                      <AvatarFallback>
                        <Building className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="space-y-1">
                      <h4 className="text-sm font-semibold">{t('requestType')}</h4>
                      <div className="text-sm space-y-1">
                        {currentClassification.requestCategory.map((category, index) => (
                          <div key={index}>
                            <span className="font-medium text-muted-foreground">{requestLevelTypes[index].name}:</span> {category.label}
                          </div>
                        ))}
                      </div>
                      <div className="flex items-center pt-2">
                        <CalendarDays className="mr-2 h-4 w-4 opacity-70" />
                        <span className="text-xs text-muted-foreground">{t('relatedAssignmentCount', { count: relatedAssignmentCount })}</span>
                      </div>
                    </div>
                  </div>
                </HoverCardContent>
              </HoverCard>
            </div>
          </div>

          <div className="flex-1 flex flex-col">
            <div className="text-sm font-medium text-muted-foreground">{t('assignmentType')}</div>
            <div className="flex items-center">
              <p>{currentClassification.assignmentCategory.slice(-1)[0].label}</p>
              <HoverCard>
                <HoverCardTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <Info />
                  </Button>
                </HoverCardTrigger>
                <HoverCardContent className="w-80">
                  <div className="flex justify-between space-x-4">
                    <Avatar>
                      <AvatarFallback>
                        <Layers className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="space-y-1">
                      <h4 className="text-sm font-semibold">{t('assignmentType')}</h4>
                      <div className="text-sm space-y-1">
                        {currentClassification.assignmentCategory.map((category, index) => (
                          <div key={index}>
                            <span className="font-medium text-muted-foreground">{assignmentLevelTypes[index].name}:</span> {category.label}
                          </div>
                        ))}
                      </div>
                      <div className="flex items-center pt-2">
                        <Users className="mr-2 h-4 w-4 opacity-70" />
                        <span className="text-xs text-muted-foreground">{t('relatedRequestCount', { count: relatedRequestCount })}</span>
                      </div>
                    </div>
                  </div>
                </HoverCardContent>
              </HoverCard>
            </div>
          </div>
        </div>

        {enableAssignmentChange && (
          <Hint label={t('reassign.reassign')}>
            <Button size="sm" variant="ghost" aria-label={t('reassign.reassign')} onClick={() => setIsReassignModalOpen(true)}>
              <SquarePen className="h-4 w-4" />
            </Button>
          </Hint>
        )}
      </div>

      <Dialog open={isReassignModalOpen} onOpenChange={setIsReassignModalOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[calc(100vh-2rem)] flex flex-col overflow-hidden" ref={formRef}>
          <DialogHeader>
            <DialogTitle>{t('reassign.area.title')}</DialogTitle>
            <DialogDescription>{t('reassign.area.description', { requestId: request.id })}</DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <FormRoot onSubmit={form.handleSubmit(handleSubmit)}>
              <FormContent>
                <FormSection>
                  <div>
                    <h2 className="text-base font-semibold mb-1 flex items-center">
                      {t('requestCategory.title')}
                      <Hint label={t('requestCategory.description')}>
                        <Info className="w-4 h-4 ml-2" />
                      </Hint>
                    </h2>
                    <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4">
                      <RequestCategoryFields menuPortalTarget={undefined} />
                    </div>
                  </div>

                  <Separator className="my-2" />

                  <div>
                    <h2 className="text-base font-semibold mb-1 flex items-center">
                      {t('assignmentCategory.title')}
                      <Hint label={t('assignmentCategory.description')}>
                        <Info className="w-4 h-4 ml-2" />
                      </Hint>
                    </h2>
                    <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4">
                      <AssignmentCategoryFields menuPortalTarget={undefined} />
                    </div>
                  </div>

                  <Separator className="my-2" />

                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-1">
                    <div className="space-y-1 md:col-span-3">
                      <FormField
                        control={form.control}
                        name="reason"
                        render={({ field }) => (
                          <FormItem label={t('reassign.reason.label')} description={t('reassign.reason.description')}>
                            <Textarea id="reason" placeholder={t('reassign.reason.placeholder')} rows={2} required {...field} className="resize-none" />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="space-y-1 md:col-span-2">
                      <FormField
                        control={form.control}
                        name="notify"
                        render={({ field }) => (
                          <FormItem label={t('reassign.notify.label')} description={t('reassign.notify.description')}>
                            <Select menuPortalTarget={null} isSearchable isClearable options={notifyOptions} {...field} />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </FormSection>
              </FormContent>
              <FormActions isPending={isPending} title={t('reassign.area.action')} />
            </FormRoot>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}
