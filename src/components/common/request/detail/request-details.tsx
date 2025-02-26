'use client';

import { useState, type FC } from 'react';
import { Link } from '@/i18n/routing';
import { AlertTriangle, ArrowDown, ArrowRight, ArrowUp, CalendarIcon, Circle, Edit3Icon, FlagIcon, FolderIcon, StarIcon, TagIcon, UserIcon } from 'lucide-react';

import { AssignmentLevelType, RequestLevelType } from '@/types/prisma/hierarchy';
import { RequestDetailsType } from '@/types/prisma/request';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { ExpandableMetadata, MetadataItem, MetadataItemProps } from '@/components/metadata-item';
import { ProgressCircle } from '@/components/progress-circle';
import { SelectCombobox } from '@/components/select/linear-select';
import { OptionType } from '@/components/select/select';

import { RequestFormStepperType } from '../request-form-stepper';

const icons: { [key: number]: typeof Circle } = {
  0: Circle,
  1: AlertTriangle,
  2: ArrowUp,
  3: ArrowRight,
  4: ArrowDown,
};

interface ProjectDetailsProps {
  slug: string;
  tenantId: string;
  request: RequestFormStepperType;
  priorities: OptionType[];
  requestLevelTypes: RequestLevelType[];
  assignmentLevelTypes: AssignmentLevelType[];
  requestDetails: RequestDetailsType;
}

const ProjectDetails: FC<ProjectDetailsProps> = ({ tenantId, slug, request, requestDetails, priorities, requestLevelTypes, assignmentLevelTypes }) => {
  const [priority, setPriority] = useState<string | number>(request.priorityId.value);

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

  return (
    <Card className="flex flex-1 flex-col">
      <CardHeader>
        <CardTitle className="flex w-full justify-between gap-4">
          {request.issueSubject}
          <Button variant="outline" size="sm" asChild>
            <Link
              href={{
                pathname: '/admin/[tenantId]/requests-portal/requests/[slug]/edit',
                params: { tenantId, slug },
              }}>
              <Edit3Icon className="h-4 w-4" />
              <span className="sr-only">Edit</span>
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
                  <ProgressCircle value={requestDetails.submissions.count} total={requestDetails.submissions.total} label="Submissions" />
                  <ProgressCircle value={requestDetails.requirements.count} total={requestDetails.requirements.total} label="Requirements" />

                  {requestDetails.sla && (
                    <div className="w-full p-4 sm:col-span-2">
                      <h4 className="mb-2 text-sm font-medium">Current SLA</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Resolution: {requestDetails.sla.resolutionTime}h</span>
                          <span>Remaining: {requestDetails.sla.timeRemaining}h</span>
                        </div>
                        <Progress value={requestDetails.sla.progress} />
                      </div>
                    </div>
                  )}
                </div>
                <Separator />
                {/* Metadata */}
                <div className="grid grid-cols-[repeat(auto-fit,minmax(150px,1fr))] gap-4">
                  <MetadataItem icon={<UserIcon className="h-4 w-4" />} label="Issue Subject" value={request.issueSubject ?? 'N/A'} />
                  <MetadataItem
                    icon={<FlagIcon className="h-4 w-4" />}
                    label="Priority"
                    value={
                      <SelectCombobox
                        options={priorityOptions}
                        defaultIcon={Circle}
                        value={priority}
                        onChange={(value) => setPriority(value)}
                        hotkey="p"
                        buttonText="Set priority"
                        placeholder="Search..."
                        onSelectOption={(option) => console.log(option)}
                      />
                    }
                  />
                  <ExpandableMetadata items={assignmentCategories} />
                  <ExpandableMetadata items={requestCategories} />
                  <MetadataItem icon={<TagIcon className="h-4 w-4" />} label="Status" value={request.statusId.label} />
                  <MetadataItem icon={<CalendarIcon className="h-4 w-4" />} label="Created" value={new Date().toLocaleDateString()} />
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
                      <p className="text-muted-foreground text-xs">Submitted {new Date(requestDetails.satisfactionSurvey.submittedAt).toLocaleDateString()}</p>
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
