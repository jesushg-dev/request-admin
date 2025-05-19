'use client';

import { useRef, useState, type FC } from 'react';
import { Link } from '@/i18n/routing';
import { Clock, Edit3Icon, EllipsisVertical, FileDown, MessageSquare, Printer, StarIcon, User } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { AssignmentLevelType, RequestLevelType } from '@/types/prisma/hierarchy';
import { RequestDetailsType } from '@/types/prisma/request';
import { RequestWorkflowType } from '@/types/prisma/workflow';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { type OptionType } from '@/components/custom-ui/select';

import { RequestFormStepperType } from '../request-form-stepper';
import { AssignRequestModal } from './assign-request-modal';
import { ChangePriorityModal } from './change-priority-modal';
import { ChangeStatusModal } from './change-status-modal';
import { ReassignAreaModal } from './reassign-area-modal';

interface RequestDetailsProps {
  slug: string;
  tenantId: string;
  workflow: RequestWorkflowType;
  priorities: OptionType[];
  request: RequestFormStepperType;
  requestLevelTypes: RequestLevelType[];
  assignmentLevelTypes: AssignmentLevelType[];
  requestDetails: RequestDetailsType;
  enableStatusChange: boolean;
  enablePriorityChange: boolean;
  enableAssignmentChange: boolean;
}

const RequestDetails: FC<RequestDetailsProps> = ({
  enableStatusChange,
  enablePriorityChange,
  enableAssignmentChange,
  tenantId,
  slug,
  request,
  requestDetails,
  workflow,
  priorities,
  requestLevelTypes,
  assignmentLevelTypes,
}) => {
  const t = useTranslations('admin.request.view.requestDetails');

  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isPriorityModalOpen, setIsPriorityModalOpen] = useState(false);
  const [isReassignModalOpen, setIsReassignModalOpen] = useState(false);

  const handlePrint = () => {
    alert('No implemented yet');
  };

  const handleExportPDF = async () => {
    alert('No implemented yet');
  };

  return (
    <>
      <div className="flex flex-col gap-4 flex-1 overflow-auto">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>{t('statusState')}</CardTitle>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <EllipsisVertical />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>{t('manageRequest')}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link
                    href={{
                      pathname: '/admin/[tenantId]/requests/[slug]/edit',
                      params: { tenantId, slug },
                    }}>
                    <Edit3Icon className="mr-2 h-4 w-4" />
                    {t('edit')}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setIsAssignModalOpen(true)}>{t('assignToUser')}</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setIsPriorityModalOpen(true)}>{t('changePriority')}</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setIsReassignModalOpen(true)}>{t('reassignDepartment')}</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handlePrint}>
                  <Printer className="mr-2 h-4 w-4" />
                  {t('printRequest')}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleExportPDF}>
                  <FileDown className="mr-2 h-4 w-4" />
                  {t('exportAsPDF')}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {/*requestData.status === 'Cerrado' ? (
                  <DropdownMenuItem onClick={() => setIsStatusModalOpen(true)}>
                    {t('reopenRequest')}
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem className="text-destructive" onClick={() => setIsStatusModalOpen(true)}>
                    {t('cancelRequest')}
                  </DropdownMenuItem>
                )*/}
              </DropdownMenuContent>
            </DropdownMenu>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <ChangeStatusModal
              tenantId={tenantId}
              request={request}
              workflow={workflow}
              IsStatusModalOpen={isStatusModalOpen}
              setIsStatusModalOpen={setIsStatusModalOpen}
              enableAssignmentChange={enableAssignmentChange}
              enableStatusChange={enableStatusChange}
            />

            <ChangePriorityModal
              tenantId={tenantId}
              requestId={request.id}
              defaultPriority={request.priorityId}
              priorities={priorities}
              isPriorityModalOpen={isPriorityModalOpen}
              setIsPriorityModalOpen={setIsPriorityModalOpen}
              enablePriorityChange={enablePriorityChange}
            />

            <Separator className="my-4" />

            <div className="flex flex-col">
              <h3 className="text-sm font-bold">{t('progress')}</h3>
              <div className="space-y-3">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>{t('submissions')}</span>
                    <span className="font-medium">
                      {requestDetails.submissions.count}/{requestDetails.submissions.total}
                    </span>
                  </div>
                  <Progress value={(requestDetails.submissions.count / requestDetails.submissions.total) * 100 || 0} />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>{t('requirements')}</span>
                    <span className="font-medium">
                      {requestDetails.requirements.count}/{requestDetails.requirements.total}
                    </span>
                  </div>
                  <Progress value={(requestDetails.requirements.count / requestDetails.requirements.total) * 100} />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>{t('executionModel')}</span>
                    <span className="font-medium">0%</span>
                  </div>
                  <Progress value={0} />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Categorías y Detalles */}
        <Card>
          <CardHeader>
            <CardTitle>Detalles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-2">
              <div className="flex flex-col">
                <div className="text-sm font-medium text-muted-foreground">{t('issueSubject')}</div>
                <p>{request.issueSubject}</p>
              </div>

              <div className="flex flex-col">
                <div className="text-sm font-medium text-muted-foreground">{t('issueDescription')}</div>
                <p>{request.description ?? 'N/A'}</p>
              </div>

              <Separator className="my-4" />

              <ReassignAreaModal
                request={request}
                tenantId={tenantId}
                relatedAssignmentCount={requestDetails.relatedAssignmentCount}
                relatedRequestCount={requestDetails.relatedRequestCount}
                isReassignModalOpen={isReassignModalOpen}
                setIsReassignModalOpen={setIsReassignModalOpen}
                requestLevelTypes={requestLevelTypes}
                assignmentLevelTypes={assignmentLevelTypes}
                enableAssignmentChange={enableAssignmentChange}
              />

              <Separator className="my-4" />

              <AssignRequestModal
                tenantId={tenantId}
                requestId={request.id}
                area={request.areaId}
                enableAssignmentChange={enableAssignmentChange}
                defaultAssignedUsers={requestDetails.assignedUsers}
                isAssignModalOpen={isAssignModalOpen}
                setIsAssignModalOpen={setIsAssignModalOpen}
              />

              <div className="flex flex-col">
                <div className="text-sm font-medium text-muted-foreground">{t('requester')}</div>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <div className="text-sm">{requestDetails.requester?.name ?? 'N/A'}</div>
                </div>
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  <div className="text-sm">{requestDetails.requester?.email ?? 'N/A'}</div>
                </div>
              </div>

              <div className="flex flex-col">
                <div className="text-sm font-medium text-muted-foreground">{t('dates')}</div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <div className="text-sm">
                    {t('created')}: {new Date().toLocaleDateString()}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <div className="text-sm">
                    {t('updated')}: {new Date().toLocaleDateString()}
                  </div>
                </div>
              </div>

              {/* Progress Indicators */}
              {requestDetails.sla && (
                <>
                  <Separator className="my-4" />
                  <div className="grid grid-cols-[repeat(auto-fit,minmax(5rem,1fr))] gap-4">
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
                  </div>
                </>
              )}
              {/* Satisfaction Survey */}
              {requestDetails.satisfactionSurvey && (
                <>
                  <Separator className="my-4" />
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
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default RequestDetails;
