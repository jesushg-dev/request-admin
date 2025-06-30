import { useMemo, useRef, useState, useTransition } from 'react';
import { updateCurrentAssignedUsers } from '@/actions/request-assignment';
import { useFindManyUserTenantArea } from '@/services/api/hooks';
import { zodResolver } from '@hookform/resolvers/zod';
import { Layers, MessageSquare, SquarePen, Trash2, User } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useFieldArray, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { type RequestDetailsType } from '@/types/prisma/request';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormField } from '@/components/ui/form';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import Select, { optionSchema, type OptionType } from '@/components/custom-ui/select';
import { Hint } from '@/components/hint';
import { FormActions, FormContent, FormItem, FormRoot, FormSection } from '@/components/shared/form-root';

export const assignRequestSchema = z
  .object({
    assignees: z
      .array(
        z.object({
          user: optionSchema,
          isCoordinator: z.boolean(),
        })
      )
      .min(1, 'Debe asignar al menos un usuario'),
    comments: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    const coordinatorCount = data.assignees.filter((a) => a.isCoordinator).length;
    if (coordinatorCount > 1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Solo puede haber un coordinador',
        path: ['assignees'],
      });
    }
    if (coordinatorCount === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Debe seleccionar al menos un coordinador',
        path: ['assignees'],
      });
    }
  });

export type AssignRequestFormValues = z.infer<typeof assignRequestSchema>;

export const getDefaultValues = (): AssignRequestFormValues => ({
  assignees: [{ user: { label: '', value: '' }, isCoordinator: false }],
  comments: '',
});

interface AssignRequestModalProps {
  tenantId: string;
  requestId: string;
  area: OptionType;
  defaultAssignedUsers: RequestDetailsType['assignedUsers'];
  enableAssignmentChange: boolean;
  isAssignModalOpen: boolean;
  setIsAssignModalOpen: (state: boolean) => void;
}

export function AssignRequestModal({ enableAssignmentChange, isAssignModalOpen, setIsAssignModalOpen, requestId, area, defaultAssignedUsers, tenantId }: AssignRequestModalProps) {
  const formRef = useRef<HTMLDivElement>(null);
  const t = useTranslations('admin.request.assign');

  const form = useForm<AssignRequestFormValues>({
    resolver: zodResolver(assignRequestSchema),
    defaultValues: { ...getDefaultValues(), assignees: defaultAssignedUsers },
  });

  const { fields, append, remove } = useFieldArray({ control: form.control, name: 'assignees' });

  const { data = [], isLoading } = useFindManyUserTenantArea({
    where: { areaId: String(area.value), tenantId },
    select: { userTenant: { select: { id: true, person: { select: { firstName: true, lastName: true } }, user: { select: { email: true } } } } },
  });

  const areaUsers: OptionType[] = useMemo(() => {
    return data.map((user) => ({
      value: user.userTenant.id,
      label: user.userTenant.person ? `${user.userTenant.person.firstName} ${user.userTenant.person.lastName} (${user.userTenant.user.email})` : user.userTenant.id,
    }));
  }, [data]);

  const [isPending, startTransition] = useTransition();
  const [currentAssignee, setCurrentAssignee] = useState<AssignRequestFormValues['assignees']>(defaultAssignedUsers);

  const selectedValues = form.watch('assignees', []).map((a) => a.user?.value ?? '');

  const getAvailableOptions = (currentIdx: number) => {
    return areaUsers.filter((option) => !selectedValues.includes(option.value) || option.value === form.getValues(`assignees.${currentIdx}.user.value`));
  };

  const handleSubmit = (data: AssignRequestFormValues) => {
    const promise = updateCurrentAssignedUsers(tenantId, requestId, data);

    startTransition(() => {
      toast.promise(promise, {
        loading: t('toast.loading'),
        success: () => {
          setIsAssignModalOpen(false);
          setCurrentAssignee(data.assignees);
          return t('toast.success');
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
        <div className="flex flex-col w-full justify-between">
          <div className="text-sm font-medium text-muted-foreground">{t('assignedTo')}</div>
          <HoverCard>
            <HoverCardTrigger asChild>
              <div className="flex flex-col cursor-pointer">
                {currentAssignee?.length ? <CoordinatorPreview assignees={currentAssignee} t={t} /> : <span className="text-muted-foreground">N/A</span>}
              </div>
            </HoverCardTrigger>
            <HoverCardContent className="w-80">
              <div className="flex justify-between space-x-4">
                <Avatar>
                  <AvatarFallback>
                    <Layers className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-1 flex-1">
                  {defaultAssignedUsers?.map((u) => (
                    <UserItem key={u.user.value} user={u.user} isCoordinator={u.isCoordinator} t={t} />
                  ))}
                </div>
              </div>
            </HoverCardContent>
          </HoverCard>
        </div>
        {enableAssignmentChange && (
          <Hint label={t('reassigne')}>
            <Button size="sm" variant="ghost" aria-label={t('reassigne')} onClick={() => setIsAssignModalOpen(true)}>
              <SquarePen className="h-4 w-4" />
            </Button>
          </Hint>
        )}
      </div>

      <Dialog open={isAssignModalOpen} onOpenChange={setIsAssignModalOpen}>
        <DialogContent className="sm:max-w-xl max-h-[calc(100vh-2rem)] flex flex-col overflow-hidden" ref={formRef}>
          <DialogHeader>
            <DialogTitle>{t('title')}</DialogTitle>
            <DialogDescription>{t('description', { requestId })}</DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <FormRoot onSubmit={form.handleSubmit(handleSubmit)}>
              <FormContent>
                <FormSection>
                  <div className="grid gap-2">
                    <Label htmlFor="area">{t('area')}</Label>
                    <div className="text-sm text-muted-foreground">{area.label}</div>
                  </div>

                  {fields.map((field, idx) => (
                    <div key={field.id} className="flex items-center gap-2 mb-2">
                      <FormField
                        control={form.control}
                        name={`assignees.${idx}.user`}
                        render={({ field }) => (
                          <FormItem className="flex-1" label={t('assignee.label')} description={t('assignee.description')}>
                            <Select menuPortalTarget={null} isLoading={isLoading} isSearchable isClearable options={getAvailableOptions(idx)} {...field} />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`assignees.${idx}.isCoordinator`}
                        render={({ field }) => (
                          <div className="flex items-center gap-2">
                            <Checkbox id={`isCoordinator-${idx}`} checked={field.value} onCheckedChange={field.onChange} />
                            <label htmlFor={`isCoordinator-${idx}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                              {t('coordinator')}
                            </label>
                          </div>
                        )}
                      />
                      {fields.length > 1 && (
                        <Button type="button" variant="ghost" size="icon" onClick={() => remove(idx)} aria-label={t('removeAssignee')}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <div className="w-full p-2 pb-0">
                    <Button
                      type="button"
                      variant="dashed-outline"
                      size="sm"
                      className="w-full"
                      onClick={() => append({ user: { label: '', value: '' }, isCoordinator: false })}
                      disabled={selectedValues.length >= areaUsers.length}>
                      {t('addAssignee')}
                    </Button>
                  </div>
                  <FormField
                    control={form.control}
                    name="comments"
                    render={({ field }) => (
                      <FormItem label={t('comments.label')} description={t('comments.description')}>
                        <Textarea id="comments" placeholder={t('comments.placeholder')} rows={3} {...field} />
                      </FormItem>
                    )}
                  />
                </FormSection>
              </FormContent>
              <FormActions isPending={isPending} title={t('action')} />
            </FormRoot>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}

const UserItem = ({ user, isCoordinator, t }: { user: OptionType; isCoordinator: boolean; t: ReturnType<typeof useTranslations> }) => {
  const match = user.label.match(/^(.*?)\s*\(([^)]+)\)$/);
  const name = match ? match[1] : user.label;
  const email = match ? match[2] : user.label;

  return (
    <div className="flex flex-col items-start gap-2">
      <div className="flex items-center gap-2">
        <User className="h-4 w-4" />
        <span className={isCoordinator ? 'font-semibold' : ''}>{name}</span>
      </div>
      <div className="flex items-center gap-2">
        <MessageSquare className="h-4 w-4" />
        <span className="text-xs text-muted-foreground">{email}</span>
        {isCoordinator && (
          <Badge variant="outline" className="ml-2">
            {t('coordinator')}
          </Badge>
        )}
      </div>
    </div>
  );
};

const CoordinatorPreview = ({ assignees, t }: { assignees: AssignRequestFormValues['assignees']; t: ReturnType<typeof useTranslations> }) => {
  const coordinator = assignees.find((u) => u.isCoordinator);
  if (!coordinator) return <span className="text-muted-foreground">N/A</span>;

  const match = coordinator.user.label.match(/^(.*?)\s*\(([^)]+)\)$/);
  const name = match ? match[1] : coordinator.user.label;
  const email = match ? match[2] : coordinator.user.label;

  return (
    <div className="flex flex-col">
      <div className="flex items-center gap-2">
        <User className="h-4 w-4" />
        <span className="text-sm font-semibold">{name}</span>
        <Badge variant="outline" className="ml-2">
          {t('coordinator')}
        </Badge>
      </div>
      <div className="flex items-center gap-2">
        <MessageSquare className="h-4 w-4" />
        <span className="text-sm">{email}</span>
        {assignees.filter((u) => !u.isCoordinator).length > 0 && <span className="ml-2 text-xs text-muted-foreground">+{assignees.filter((u) => !u.isCoordinator).length}</span>}
      </div>
    </div>
  );
};
