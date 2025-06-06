'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowUpDown, MoreHorizontal } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

import { AssignRequestModal } from './modals/assign-request-modal';
import { ChangePriorityModal } from './modals/change-priority-modal';
import { ChangeStatusModal } from './modals/change-status-modal';
import { ReassignDepartmentModal } from './modals/reassign-department-modal';

// Datos de ejemplo para la tabla de solicitudes
const allRequests = [
  {
    id: 'REQ-2023-001',
    title: 'Activación de servicio móvil',
    requester: 'Juan Pérez',
    department: 'Activaciones',
    status: 'En progreso',
    priority: 'Alta',
    created: '2023-06-15',
    assignee: 'Carlos Mendoza',
  },
  {
    id: 'REQ-2023-002',
    title: 'Reclamo de comisión no pagada',
    requester: 'María López',
    department: 'Comisiones',
    status: 'En revisión',
    priority: 'Media',
    created: '2023-06-14',
    assignee: 'Ana Castillo',
  },
  {
    id: 'REQ-2023-003',
    title: 'Soporte técnico para router',
    requester: 'Carlos Ruiz',
    department: 'Soporte',
    status: 'Cerrado',
    priority: 'Baja',
    created: '2023-06-13',
    assignee: 'Roberto Jiménez',
  },
  {
    id: 'REQ-2023-004',
    title: 'Activación de plan corporativo',
    requester: 'Empresa XYZ',
    department: 'Activaciones',
    status: 'Borrador',
    priority: 'Alta',
    created: '2023-06-12',
    assignee: 'Sin asignar',
  },
  {
    id: 'REQ-2023-005',
    title: 'Ajuste de facturación',
    requester: 'Ana Martínez',
    department: 'Facturación',
    status: 'Cancelado',
    priority: 'Media',
    created: '2023-06-11',
    assignee: 'Luis Morales',
  },
  {
    id: 'REQ-2023-006',
    title: 'Cambio de plan de datos',
    requester: 'Pedro Sánchez',
    department: 'Activaciones',
    status: 'En progreso',
    priority: 'Baja',
    created: '2023-06-10',
    assignee: 'Carlos Mendoza',
  },
  {
    id: 'REQ-2023-007',
    title: 'Reclamo por servicio interrumpido',
    requester: 'Laura Gutiérrez',
    department: 'Soporte',
    status: 'En revisión',
    priority: 'Alta',
    created: '2023-06-09',
    assignee: 'Roberto Jiménez',
  },
  {
    id: 'REQ-2023-008',
    title: 'Solicitud de reembolso',
    requester: 'Miguel Hernández',
    department: 'Facturación',
    status: 'Cerrado',
    priority: 'Media',
    created: '2023-06-08',
    assignee: 'Luis Morales',
  },
  {
    id: 'REQ-2023-009',
    title: 'Activación de línea adicional',
    requester: 'Carmen Rodríguez',
    department: 'Activaciones',
    status: 'En progreso',
    priority: 'Media',
    created: '2023-06-07',
    assignee: 'Carlos Mendoza',
  },
  {
    id: 'REQ-2023-010',
    title: 'Consulta sobre comisiones',
    requester: 'José Torres',
    department: 'Comisiones',
    status: 'Cerrado',
    priority: 'Baja',
    created: '2023-06-06',
    assignee: 'Ana Castillo',
  },
];

// Función para determinar el color de la insignia de estado
function getStatusBadgeVariant(status: string) {
  switch (status) {
    case 'En progreso':
      return 'default';
    case 'En revisión':
      return 'secondary';
    case 'Cerrado':
      return 'success';
    case 'Borrador':
      return 'outline';
    case 'Cancelado':
      return 'destructive';
    default:
      return 'default';
  }
}

// Función para determinar el color de la insignia de prioridad
function getPriorityBadgeVariant(priority: string) {
  switch (priority) {
    case 'Alta':
      return 'destructive';
    case 'Media':
      return 'warning';
    case 'Baja':
      return 'secondary';
    default:
      return 'default';
  }
}

interface RequestsTableProps {
  status?: string;
}

export default function RequestsTable({ status }: RequestsTableProps) {
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  interface Request {
    id: string;
    title: string;
    requester: string;
    department: string;
    status: string;
    priority: string;
    created: string;
    assignee: string;
  }

  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);

  // Estados para los modales
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isPriorityModalOpen, setIsPriorityModalOpen] = useState(false);
  const [isReassignModalOpen, setIsReassignModalOpen] = useState(false);

  // Filtrar solicitudes por estado si se proporciona
  const filteredRequests = status ? allRequests.filter((request) => request.status === status) : allRequests;

  // Ordenar solicitudes si se ha seleccionado una columna
  const sortedRequests = sortColumn
    ? [...filteredRequests].sort((a, b) => {
        const aValue = a[sortColumn as keyof typeof a];
        const bValue = b[sortColumn as keyof typeof b];

        if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      })
    : filteredRequests;

  // Función para manejar el clic en el encabezado de la columna
  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">
                <Button variant="ghost" onClick={() => handleSort('id')}>
                  ID
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>
                <Button variant="ghost" onClick={() => handleSort('title')}>
                  Título
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>
                <Button variant="ghost" onClick={() => handleSort('requester')}>
                  Solicitante
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>
                <Button variant="ghost" onClick={() => handleSort('department')}>
                  Departamento
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>
                <Button variant="ghost" onClick={() => handleSort('status')}>
                  Estado
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>
                <Button variant="ghost" onClick={() => handleSort('priority')}>
                  Prioridad
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>
                <Button variant="ghost" onClick={() => handleSort('assignee')}>
                  Asignado a
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>
                <Button variant="ghost" onClick={() => handleSort('created')}>
                  Fecha
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedRequests.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="h-24 text-center">
                  No se encontraron solicitudes.
                </TableCell>
              </TableRow>
            ) : (
              sortedRequests.map((request) => (
                <TableRow key={request.id}>
                  <TableCell className="font-medium">{request.id}</TableCell>
                  <TableCell>{request.title}</TableCell>
                  <TableCell>{request.requester}</TableCell>
                  <TableCell>{request.department}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(request.status) as React.ComponentProps<typeof Badge>['variant']}>{request.status}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getPriorityBadgeVariant(request.priority) as React.ComponentProps<typeof Badge>['variant']}>{request.priority}</Badge>
                  </TableCell>
                  <TableCell>{request.assignee}</TableCell>
                  <TableCell>{request.created}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Abrir menú</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                        <DropdownMenuItem asChild>
                          <Link href={`/requests/${request.id}`}>Ver detalles</Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedRequest(request);
                            setIsAssignModalOpen(true);
                          }}>
                          Asignar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedRequest(request);
                            setIsStatusModalOpen(true);
                          }}>
                          Cambiar estado
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedRequest(request);
                            setIsPriorityModalOpen(true);
                          }}>
                          Cambiar prioridad
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedRequest(request);
                            setIsReassignModalOpen(true);
                          }}>
                          Reasignar a otro departamento
                        </DropdownMenuItem>
                        {request.status === 'Cerrado' && (
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedRequest(request);
                              setIsStatusModalOpen(true);
                            }}>
                            Reabrir solicitud
                          </DropdownMenuItem>
                        )}
                        {request.status !== 'Cancelado' && request.status !== 'Cerrado' && (
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => {
                              setSelectedRequest(request);
                              setIsStatusModalOpen(true);
                            }}>
                            Cancelar solicitud
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Modales */}
      {selectedRequest && (
        <>
          <ChangeStatusModal isOpen={isStatusModalOpen} onClose={() => setIsStatusModalOpen(false)} currentStatus={selectedRequest.status} requestId={selectedRequest.id} />

          <AssignRequestModal
            isOpen={isAssignModalOpen}
            onClose={() => setIsAssignModalOpen(false)}
            requestId={selectedRequest.id}
            department={selectedRequest.department}
            currentAssignee={selectedRequest.assignee !== 'Sin asignar' ? selectedRequest.assignee : undefined}
          />

          <ChangePriorityModal isOpen={isPriorityModalOpen} onClose={() => setIsPriorityModalOpen(false)} requestId={selectedRequest.id} currentPriority={selectedRequest.priority} />

          <ReassignDepartmentModal isOpen={isReassignModalOpen} onClose={() => setIsReassignModalOpen(false)} requestId={selectedRequest.id} currentDepartment={selectedRequest.department} />
        </>
      )}
    </>
  );
}
