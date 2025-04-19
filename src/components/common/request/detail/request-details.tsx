'use client';

import { useState, useTransition, type FC } from 'react';
import { updateCurrentPriority, updateCurrentStatus } from '@/actions/request-detail';
import { Link } from '@/i18n/routing';
import {
  AlertTriangle,
  ArrowDown,
  ArrowRight,
  ArrowUp,
  CalendarIcon,
  Circle,
  CircleCheckBig,
  CircleDashed,
  Edit3Icon,
  FlagIcon,
  FolderIcon,
  MonitorCog,
  ScanSearch,
  Signature,
  StarIcon,
  TagIcon,
  UserIcon,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

import { AssignmentLevelType, RequestLevelType } from '@/types/prisma/hierarchy';
import { RequestDetailsType } from '@/types/prisma/request';
import useMessage from '@/lib/message';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { SelectCombobox } from '@/components/custom-ui/linear-select';
import { OptionType } from '@/components/custom-ui/select';
import { ProgressCircle } from '@/components/progress-circle';
import { ExpandableMetadata, MetadataItem, MetadataItemProps } from '@/components/shared/metadata-item';

import { RequestFormStepperType } from '../request-form-stepper';

const icons: { [key: number]: typeof Circle } = {
  0: Circle,
  1: AlertTriangle,
  2: ArrowUp,
  3: ArrowRight,
  4: ArrowDown,
};

const icons2: { [key: number]: typeof Circle } = {
  0: Signature,
  1: MonitorCog,
  2: ScanSearch,
  3: CircleDashed,
  4: CircleCheckBig,
};

interface ProjectDetailsProps {
  slug: string;
  tenantId: string;
  statuses: OptionType[];
  priorities: OptionType[];
  request: RequestFormStepperType;
  requestLevelTypes: RequestLevelType[];
  assignmentLevelTypes: AssignmentLevelType[];
  requestDetails: RequestDetailsType;
  enableStatusChange: boolean;
  enablePriorityChange: boolean;
}

const ProjectDetails: FC<ProjectDetailsProps> = ({
  enableStatusChange,
  enablePriorityChange,
  tenantId,
  slug,
  request,
  requestDetails,
  statuses,
  priorities,
  requestLevelTypes,
  assignmentLevelTypes,
}) => {
  const t = useTranslations('admin.request.view.projectDetails');

  const message = useMessage();
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<string | number>(request.statusId.value);
  const [priority, setPriority] = useState<string | number>(request.priorityId.value);

  const statusesOptions = statuses.map((status, index) => ({ value: status.value, label: status.label, icon: icons2[index] ?? Circle }));
  const priorityOptions = priorities.map((priority, index) => ({ value: priority.value, label: priority.label, icon: icons[index] ?? Circle }));

  const assignmentCategories: MetadataItemProps[] = request.assignmentCategory.map((category, index) => ({
    icon: <FolderIcon className="h-4 w-4" />,
    label: assignmentLevelTypes[index].name,
    value: category.label,
  }));

  const requestCategories: MetadataItemProps[] = request.requestCategory.map((category, index) => ({
    icon: <FolderIcon className="h-4 w-4" />,
    label: requestLevelTypes[index].name,
    value: category.label,
  }));

  const onStatusChange = async (value: string | number) => {
    const confirm = await message.confirm(t('confirmStatusChange'), {
      title: t('statusChange'),
    });
    if (!confirm) return;

    startTransition(async () => {
      toast.promise(updateCurrentStatus(tenantId, slug, String(value)), {
        loading: t('updatingStatus'),
        success: () => {
          setStatus(value);
          return t('statusUpdated');
        },
        error: (err) => {
          if (err instanceof Error) return t('statusUpdateError', { error: err.message });
          return t('statusUpdateError', { error: t('unknownError') });
        },
      });
    });
  };

  const onPriorityChange = async (value: string | number) => {
    const confirm = await message.confirm(t('confirmPriorityChange'), {
      title: t('priorityChange'),
    });
    if (!confirm) return;

    startTransition(async () => {
      toast.promise(updateCurrentPriority(tenantId, slug, String(value)), {
        loading: t('updatingPriority'),
        success: () => {
          setPriority(value);
          return t('priorityUpdated');
        },
        error: (err) => {
          if (err instanceof Error) return t('priorityUpdateError', { error: err.message });
          return t('priorityUpdateError', { error: t('unknownError') });
        },
      });
    });
  };

  return (
    <Card className="flex flex-1 flex-col">
      <CardHeader>
        <CardTitle className="flex w-full justify-between gap-4">
          {request.issueSubject}
          <Button variant="outline" size="sm" asChild>
            <Link
              href={{
                pathname: '/admin/[tenantId]/requests/[slug]/edit',
                params: { tenantId, slug },
              }}>
              <Edit3Icon className="h-4 w-4" />
              <span className="sr-only">{t('edit')}</span>
            </Link>
          </Button>
        </CardTitle>
        <CardDescription>{request.description}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-1">
        <div className="relative flex flex-1">
          <div className="absolute inset-0 flex overflow-hidden">
            <div className="flex flex-1 flex-col overflow-y-auto">
              <div className="space-y-4">
                {/* Progress Indicators */}
                <div className="grid grid-cols-[repeat(auto-fit,minmax(5rem,1fr))] gap-4">
                  <ProgressCircle value={requestDetails.submissions.count} total={requestDetails.submissions.total} label={t('submissions')} />
                  <ProgressCircle value={requestDetails.requirements.count} total={requestDetails.requirements.total} label={t('requirements')} />

                  {requestDetails.sla && (
                    <div className="w-full p-4 sm:col-span-2">
                      <h4 className="mb-2 text-sm font-medium">{t('currentSla')}</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>
                            {t('resolution')}: {requestDetails.sla.resolutionTime}h
                          </span>
                          <span>
                            {t('remaining')}: {requestDetails.sla.timeRemaining}h
                          </span>
                        </div>
                        <Progress value={requestDetails.sla.progress} />
                      </div>
                    </div>
                  )}
                </div>
                <Separator />
                {/* Metadata */}
                <div className="grid grid-cols-[repeat(auto-fit,minmax(150px,1fr))] gap-4">
                  <MetadataItem icon={<UserIcon className="h-4 w-4" />} label={t('issueSubject')} value={request.issueSubject ?? 'N/A'} />
                  {enablePriorityChange ? (
                    <MetadataItem
                      icon={<FlagIcon className="h-4 w-4" />}
                      label={t('priority')}
                      value={
                        <SelectCombobox
                          hotkey="p"
                          value={priority}
                          defaultIcon={Circle}
                          onChange={onPriorityChange}
                          options={priorityOptions}
                          buttonText={t('setPriority')}
                          placeholder={t('search')}
                          disabled={isPending}
                        />
                      }
                    />
                  ) : (
                    <MetadataItem icon={<FlagIcon className="h-4 w-4" />} label={t('priority')} value={request.priorityId.label} />
                  )}

                  <ExpandableMetadata items={assignmentCategories} />
                  <ExpandableMetadata items={requestCategories} />
                  {enableStatusChange ? (
                    <MetadataItem
                      icon={<TagIcon className="h-4 w-4" />}
                      label={t('status')}
                      value={
                        <SelectCombobox
                          hotkey="s"
                          value={status}
                          defaultIcon={Circle}
                          onChange={onStatusChange}
                          options={statusesOptions}
                          buttonText={t('setStatus')}
                          placeholder={t('search')}
                          disabled={isPending}
                        />
                      }
                    />
                  ) : (
                    <MetadataItem icon={<TagIcon className="h-4 w-4" />} label={t('status')} value={request.statusId.label} />
                  )}
                  <MetadataItem icon={<CalendarIcon className="h-4 w-4" />} label={t('created')} value={new Date().toLocaleDateString()} />
                </div>
                {/* Satisfaction Survey */}
                {requestDetails.satisfactionSurvey && (
                  <div className="bg-muted/50 flex items-center gap-4 rounded-lg p-4">
                    <div className="flex">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <StarIcon key={i} className={`h-5 w-5 ${i < (requestDetails.satisfactionSurvey?.rating ?? 0) ? 'fill-current text-yellow-400' : 'text-gray-300'}`} />
                      ))}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm">{requestDetails.satisfactionSurvey.feedback}</p>
                      <p className="text-muted-foreground text-xs">
                        {t('submittedOn')} {new Date(requestDetails.satisfactionSurvey.submittedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProjectDetails;
