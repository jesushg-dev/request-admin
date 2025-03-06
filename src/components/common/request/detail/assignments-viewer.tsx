'use client';

import { useState, type FC } from 'react';
import { Link } from '@/i18n/routing';
import { useFindManyRequestAssignment } from '@/services/api/hooks';
import { Prisma } from '@prisma/client';
import { Rotate3DIcon, Settings2 } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

import { UserAssignmentModal } from './user-assignment-modal';
import UserMembers from './user-members';
import { ViewToggle } from './view-toggle';

interface AssignmentHistoryProps {
  tenantId: string;
  requestId: string;
}

interface FieldVisibility {
  basic: boolean;
  sla: boolean;
  categories: boolean;
  documents: boolean;
  comments: boolean;
}

export const RequestAssignmentDefaultArgs = Prisma.validator<Prisma.RequestAssignmentDefaultArgs>()({
  select: {
    id: true,
    comment: true,
    assignmentDate: true,
    unAssignmentDate: true,
    assignedUsers: {
      select: {
        id: true,
        role: true,
        userTenant: {
          select: {
            user: { select: { id: true, username: true } },
            person: { select: { id: true, firstName: true, lastName: true } },
          },
        },
      },
    },
    slaStart: true,
    slaDeadline: true,
    slaEnd: true,
    area: { select: { id: true, name: true } },
    status: { select: { id: true, name: true } },
    priority: { select: { id: true, name: true } },
    isActive: true,
    requestCategory: { select: { id: true, name: true } },
    assignmentCategory: { select: { id: true, name: true } },
  },
});

export type AssignmentData = Prisma.RequestAssignmentGetPayload<typeof RequestAssignmentDefaultArgs>;

interface FieldVisibilitySettingsProps {
  visibility: FieldVisibility;
  onChange: (visibility: FieldVisibility) => void;
}

interface TableHeadersProps {
  visibility: FieldVisibility;
}

interface TableRowProps {
  assignment: AssignmentData;
  visibility: FieldVisibility;
  from?: AssignmentData;
  to?: AssignmentData;
}

const FieldVisibilitySettings: FC<FieldVisibilitySettingsProps> = ({ visibility, onChange }) => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button variant="outline" size="sm">
        <Settings2 className="mr-2 h-4 w-4" />
        Campos visibles
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end" className="w-48">
      <DropdownMenuCheckboxItem checked={visibility.basic} onCheckedChange={(checked: boolean) => onChange({ ...visibility, basic: checked })}>
        Información básica
      </DropdownMenuCheckboxItem>
      <DropdownMenuCheckboxItem checked={visibility.sla} onCheckedChange={(checked: boolean) => onChange({ ...visibility, sla: checked })}>
        Tiempos SLA
      </DropdownMenuCheckboxItem>
      <DropdownMenuCheckboxItem checked={visibility.categories} onCheckedChange={(checked: boolean) => onChange({ ...visibility, categories: checked })}>
        Categorías
      </DropdownMenuCheckboxItem>
      <DropdownMenuCheckboxItem checked={visibility.documents} onCheckedChange={(checked: boolean) => onChange({ ...visibility, documents: checked })}>
        Documentos
      </DropdownMenuCheckboxItem>
      <DropdownMenuCheckboxItem checked={visibility.comments} onCheckedChange={(checked: boolean) => onChange({ ...visibility, comments: checked })}>
        Comentarios
      </DropdownMenuCheckboxItem>
    </DropdownMenuContent>
  </DropdownMenu>
);

const TableHeaders: FC<TableHeadersProps> = ({ visibility }) => (
  <TableHeader>
    <TableRow>
      {visibility.basic && <TableHead>Area</TableHead>}
      {visibility.basic && <TableHead>Usuarios</TableHead>}
      {visibility.basic && <TableHead>Origin</TableHead>}
      {visibility.basic && <TableHead>Destino</TableHead>}
      {visibility.basic && <TableHead>Fecha Asignación</TableHead>}
      {visibility.basic && <TableHead>Fecha Desasignación</TableHead>}
      {visibility.categories && <TableHead>Categoría Solicitud</TableHead>}
      {visibility.categories && <TableHead>Categoría Asignación</TableHead>}
      {visibility.sla && (
        <>
          <TableHead>Inicio SLA</TableHead>
          <TableHead>Límite SLA</TableHead>
          <TableHead>Fin SLA</TableHead>
          <TableHead>Tiempo Transcurrido</TableHead>
          <TableHead>Tiempo Restante</TableHead>
        </>
      )}
      {visibility.comments && <TableHead>Comentarios</TableHead>}
    </TableRow>
  </TableHeader>
);

const AssignmentTableRow: FC<TableRowProps> = ({ assignment, visibility, from, to }) => {
  const slaStart = assignment.slaStart ? new Date(assignment.slaStart) : null;
  const slaDeadline = assignment.slaDeadline ? new Date(assignment.slaDeadline) : null;
  const slaEnd = assignment.slaEnd ? new Date(assignment.slaEnd) : null;

  const timeElapsed =
    slaStart && slaDeadline ? (slaEnd ? Math.round((slaEnd.getTime() - slaStart.getTime()) / (1000 * 60 * 60)) : Math.round((Date.now() - slaStart.getTime()) / (1000 * 60 * 60))) : 'N/A';

  const remainingTime = slaStart && slaDeadline ? (slaEnd ? 0 : Math.round((slaDeadline.getTime() - Date.now()) / (1000 * 60 * 60))) : 'N/A';

  const getTarget = () => {
    return assignment.assignedUsers
      .map((user) =>
        user.userTenant.person?.firstName && user.userTenant.person?.lastName ? `${user.userTenant.person.firstName} ${user.userTenant.person.lastName}` : `@${user.userTenant.user.username}`
      )
      .join(', ');
  };

  return (
    <TableRow>
      {visibility.basic && <TableCell>{assignment.area?.name ?? 'N/A'}</TableCell>}
      {visibility.basic && <TableCell>{getTarget()}</TableCell>}
      {visibility.basic && <TableCell>{from?.area?.name ?? 'N/A'}</TableCell>}
      {visibility.basic && <TableCell>{to?.area?.name ?? 'N/A'}</TableCell>}
      {visibility.basic && <TableCell>{assignment.assignmentDate.toLocaleDateString() ?? 'N/A'}</TableCell>}
      {visibility.basic && <TableCell>{assignment.unAssignmentDate?.toLocaleDateString() ?? 'N/A'}</TableCell>}
      {visibility.categories && (
        <TableCell>
          <Badge variant="outline">{assignment.requestCategory?.name ?? 'N/A'}</Badge>
        </TableCell>
      )}
      {visibility.categories && (
        <TableCell>
          <Badge variant="outline">{assignment.assignmentCategory?.name ?? 'N/A'}</Badge>
        </TableCell>
      )}
      {visibility.sla && (
        <>
          <TableCell>{slaStart?.toLocaleString() ?? 'N/A'}</TableCell>
          <TableCell>{slaDeadline?.toLocaleString() ?? 'N/A'}</TableCell>
          <TableCell>{slaEnd?.toLocaleString() ?? 'N/A'}</TableCell>
          <TableCell>{typeof timeElapsed === 'number' ? `${timeElapsed} horas` : timeElapsed}</TableCell>
          <TableCell>{typeof remainingTime === 'number' ? (remainingTime > 0 ? `${remainingTime} horas` : 'Expirado') : remainingTime}</TableCell>
        </>
      )}
      {visibility.comments && <TableCell>{assignment.comment ?? 'Sin comentarios'}</TableCell>}
    </TableRow>
  );
};

const AssignmentHistory: FC<AssignmentHistoryProps> = ({ tenantId, requestId }) => {
  const [viewType, setViewType] = useState<'table' | 'card'>('table');
  const [visibility, setVisibility] = useState<FieldVisibility>({
    basic: true,
    sla: false,
    categories: true,
    documents: true,
    comments: true,
  });

  const { data, isLoading, error } = useFindManyRequestAssignment({
    ...RequestAssignmentDefaultArgs,
    where: { tenantId, requestId },
    orderBy: { createdAt: 'asc' },
  });

  if (isLoading)
    return (
      <div className="flex flex-col gap-2">
        <Skeleton className="h-8" />
        <Skeleton className="h-8" />
        <Skeleton className="h-8" />
      </div>
    );
  if (error) return <div className="p-4 text-center text-red-500">Error al cargar asignaciones</div>;

  return (
    <Card className="flex-1 flex flex-col">
      <CardHeader>
        <div className="flex items-center justify-between gap-4">
          <CardTitle>Historial de Asignaciones</CardTitle>
          <div className="flex flex-wrap items-center gap-2">
            <Button asChild variant="outline" size="sm">
              <Link
                href={{
                  pathname: '/admin/[tenantId]/requests-portal/requests/[slug]/edit',
                  query: { reassign: 'true' },
                  params: { tenantId, slug: requestId },
                }}>
                <Rotate3DIcon className="h-4 w-4" />
                <span className="sr-only">Assign Area</span>
              </Link>
            </Button>
            <UserAssignmentModal onComplete={console.log} />
            <FieldVisibilitySettings visibility={visibility} onChange={setVisibility} />
            <ViewToggle viewType={viewType} onViewChange={setViewType} />
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex-col flex">
        {viewType === 'table' ? (
          <Table>
            <TableHeaders visibility={visibility} />
            <TableBody>
              {data?.map((assignment, index) => <AssignmentTableRow key={assignment.id} assignment={assignment} visibility={visibility} from={data[index - 1]} to={data[index + 1]} />)}
            </TableBody>
          </Table>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {data?.map((assignment) => {
              const isUser = assignment.assignedUsers.length > 0;
              const target = isUser ? assignment.assignedUsers.map((u) => u.userTenant.user.username).join(', ') : assignment.area?.name;

              return (
                <Card key={assignment.id}>
                  <CardHeader>
                    <CardTitle className="text-sm">{isUser ? 'Asignación a Usuario' : 'Asignación a Área'}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <UserMembers />
                    <p>
                      <strong>Destino:</strong> {target ?? 'N/A'}
                    </p>
                    <p>
                      <strong>Fecha:</strong> {assignment.slaStart ? new Date(assignment.slaStart).toLocaleDateString() : 'N/A'}
                    </p>
                    <p>
                      <strong>Estado:</strong> {assignment.status.name}
                    </p>
                    {assignment.comment && (
                      <p>
                        <strong>Comentarios:</strong> {assignment.comment}
                      </p>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AssignmentHistory;
