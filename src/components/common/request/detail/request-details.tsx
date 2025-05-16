'use client';

import { useRef, useState, useTransition, type FC } from 'react';
import { updateCurrentPriority, updateCurrentStatus } from '@/actions/request-detail';
import { Link } from '@/i18n/routing';
import { Building, CalendarDays, Clock, Edit3Icon, EllipsisVertical, FileDown, Info, Layers, MessageSquare, Printer, StarIcon, User, Users } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

import { AssignmentLevelType, RequestLevelType } from '@/types/prisma/hierarchy';
import { RequestDetailsType } from '@/types/prisma/request';
import { RequestWorkflowType } from '@/types/prisma/workflow';
import useMessage from '@/lib/message';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { OptionType } from '@/components/custom-ui/select';

import { RequestFormStepperType } from '../request-form-stepper';
import { AssignRequestModal } from './assign-request-modal';
import { ChangePriorityModal } from './change-priority-modal';
import { ChangeStatusModal } from './change-status-modal';
import { ReassignAreaModal } from './reassign-area-modal';

// Datos de ejemplo para la solicitud
const requestData = {
  id: 'REQ-2023-001',
  requester: 'Juan Pérez',
  requesterEmail: 'juan.perez@empresa.com',
  status: 'En progreso',
  priority: 'Alta',
  created: '2023-06-15',
  updated: '2023-06-16',
  assignee: 'Carlos Mendoza',
  // Datos adicionales para las barras de progreso
  progress: {
    executionModel: {
      percentage: 50,
    },
  },
  // Información adicional para las categorías
  metadata: {
    requestCategoryCreated: '2023-06-15',
    requestCategoryUpdated: '2023-06-15',
    assignmentCategoryCreated: '2023-06-15',
    assignmentCategoryUpdated: '2023-06-16',
    totalRequests: 145,
    similarRequests: 23,
  },
};

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

  const message = useMessage();
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<OptionType | undefined>(request.statusId);
  const [priority, setPriority] = useState<OptionType | undefined>(request.priorityId);

  // Estados para los modales
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isPriorityModalOpen, setIsPriorityModalOpen] = useState(false);
  const [isReassignModalOpen, setIsReassignModalOpen] = useState(false);

  const printRef = useRef(null);

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

  // Función para imprimir la solicitud usando la API del navegador
  const handlePrint = () => {
    toast('Preparando impresión...', {
      description: 'Se abrirá el diálogo de impresión en breve.',
    });

    // Pequeño retraso para asegurar que el toast se muestre antes de abrir el diálogo de impresión
    setTimeout(() => {
      window.print();
    }, 300);
  };

  // Función para exportar como PDF
  const handleExportPDF = async () => {
    if (!printRef.current) return;

    toast('Generando PDF...', {
      description: 'Por favor espere mientras se genera el PDF.',
    });

    try {
      //todo: Implementar la lógica para generar el PDF

      toast.success('PDF generado', {
        description: 'El PDF se ha generado correctamente.',
      });
    } catch (error) {
      console.error('Error al generar PDF:', error);
      toast.error('Error al generar PDF', {
        description: 'Ha ocurrido un error al generar el PDF. Intente nuevamente.',
      });
    }
  };

  return (
    <>
      <div className="flex flex-col gap-4 flex-1 overflow-auto">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Estado de la solicitud</CardTitle>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <EllipsisVertical />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Gestionar solicitud</DropdownMenuLabel>
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
                <DropdownMenuItem onClick={() => setIsAssignModalOpen(true)}>Asignar a usuario</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setIsPriorityModalOpen(true)}>Cambiar prioridad</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setIsReassignModalOpen(true)}>Reasignar departamento</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handlePrint}>
                  <Printer className="mr-2 h-4 w-4" />
                  Imprimir solicitud
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleExportPDF}>
                  <FileDown className="mr-2 h-4 w-4" />
                  Exportar como PDF
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {requestData.status === 'Cerrado' ? (
                  <DropdownMenuItem onClick={() => setIsStatusModalOpen(true)}>Reabrir solicitud</DropdownMenuItem>
                ) : (
                  <DropdownMenuItem className="text-destructive" onClick={() => setIsStatusModalOpen(true)}>
                    Cancelar solicitud
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <div className="flex flex-col">
              <div className="flex gap-2 w-full justify-between">
                <div>
                  <p className="text-sm font-medium">{t('currentStatus')}</p>
                  <Badge>{status?.label ?? 'N/A'}</Badge>
                </div>
                {enableStatusChange && (
                  <Button size="sm" variant="outline" onClick={() => setIsStatusModalOpen(true)}>
                    {t('changeStatus')}
                  </Button>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-1 w-full">
                {requestData.status === 'Borrador' && `Puede avanzar: En revisión, Cancelado`}
                {requestData.status === 'En revisión' && `Puede avanzar: En progreso, Borrador, Cancelado`}
                {requestData.status === 'En progreso' && `Puede avanzar: Cerrado, En revisión, Cancelado`}
                {requestData.status === 'Cerrado' && `Puede avanzar: En revisión (reapertura)`}
                {requestData.status === 'Cancelado' && `Puede avanzar: Borrador (restauración)`}
              </p>
            </div>

            <div className="flex flex-col">
              <div className="flex gap-2 w-full justify-between">
                <div>
                  <p className="text-sm font-medium">{t('priority')}</p>
                  <Badge>{priority?.label ?? 'N/A'}</Badge>
                </div>
                {enablePriorityChange && (
                  <Button size="sm" variant="outline" onClick={() => setIsPriorityModalOpen(true)}>
                    {t('changePriority')}
                  </Button>
                )}
              </div>
            </div>

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
                    <span className="font-medium">{requestData.progress.executionModel.percentage}%</span>
                  </div>
                  <Progress value={requestData.progress.executionModel.percentage} />
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

              <div className="flex gap-2 w-full">
                <div className="flex-1 flex flex-col gap-2">
                  <div className="flex flex-col">
                    <div className="text-sm font-medium text-muted-foreground">{t('area')}</div>
                    <p>{request.areaId.label ?? 'N/A'}</p>
                  </div>

                  <div className="flex flex-col">
                    <div className="text-sm font-medium text-muted-foreground">{t('requestCategory')}</div>
                    <div className="flex items-center gap-2">
                      <p>{request.requestCategory.slice(-1)[0].label}</p>
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
                              <h4 className="text-sm font-semibold">{t('requestCategory')}</h4>
                              <div className="text-sm space-y-1">
                                {request.requestCategory.map((category, index) => (
                                  <div key={index}>
                                    <span className="font-medium text-muted-foreground">{requestLevelTypes[index].name}:</span> {category.label}
                                  </div>
                                ))}
                              </div>
                              <div className="flex items-center pt-2">
                                <CalendarDays className="mr-2 h-4 w-4 opacity-70" />
                                <span className="text-xs text-muted-foreground">Actualizado {requestData.metadata.requestCategoryUpdated}</span>
                              </div>
                            </div>
                          </div>
                        </HoverCardContent>
                      </HoverCard>
                    </div>
                  </div>

                  <div className="flex flex-col">
                    <div className="text-sm font-medium text-muted-foreground">{t('assignmentCategory')}</div>
                    <div className="flex items-center gap-2">
                      <p>{request.assignmentCategory.slice(-1)[0].label}</p>
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
                              <h4 className="text-sm font-semibold">{t('assignmentCategory')}</h4>
                              <div className="text-sm space-y-1">
                                {request.assignmentCategory.map((category, index) => (
                                  <div key={index}>
                                    <span className="font-medium text-muted-foreground">{assignmentLevelTypes[index].name}:</span> {category.label}
                                  </div>
                                ))}
                              </div>
                              <div className="flex items-center pt-2">
                                <Users className="mr-2 h-4 w-4 opacity-70" />
                                <span className="text-xs text-muted-foreground">{requestData.metadata.similarRequests} solicitudes similares</span>
                              </div>
                            </div>
                          </div>
                        </HoverCardContent>
                      </HoverCard>
                    </div>
                  </div>
                </div>

                <Button size="sm" variant="outline" onClick={() => setIsReassignModalOpen(true)}>
                  Reasignar
                </Button>
              </div>

              <Separator className="my-4" />

              <div className="flex w-full gap-2 justify-between">
                <div className="flex flex-col">
                  <div className="text-sm font-medium text-muted-foreground">{t('assignedTo')}</div>
                  <p>{requestData.assignee}</p>
                </div>
                <Button size="sm" variant="outline" onClick={() => setIsAssignModalOpen(true)}>
                  Reasignar
                </Button>
              </div>

              <div className="flex flex-col">
                <div className="text-sm font-medium text-muted-foreground">{t('requester')}</div>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <div className="text-sm">{requestData.requester}</div>
                </div>
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  <div className="text-sm">{requestData.requesterEmail}</div>
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
      {!request.isDraft && request.statusId !== undefined && (
        <ChangeStatusModal
          requestId={request.id}
          currentStatus={request.statusId}
          enableAssignmentChange={enableAssignmentChange}
          workflow={workflow}
          isOpen={isStatusModalOpen}
          onClose={() => setIsStatusModalOpen(false)}
        />
      )}
      <ChangePriorityModal requestId={request.id} currentPriority={request.priorityId} priorities={priorities} isOpen={isPriorityModalOpen} onClose={() => setIsPriorityModalOpen(false)} />
      <AssignRequestModal requestId={request.id} tenantId={tenantId} area={request.areaId} currentAssignee={request.assignee} onClose={() => setIsAssignModalOpen(false)} isOpen={isAssignModalOpen} />
      <ReassignAreaModal requestId={request.id} currentArea={request.areaId} isOpen={isReassignModalOpen} onClose={() => setIsReassignModalOpen(false)} />
    </>
  );
};

export default RequestDetails;
