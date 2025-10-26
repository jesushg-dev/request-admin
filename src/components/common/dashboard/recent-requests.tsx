'use client';

import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getRecentRequests } from '@/actions/dashboard';
import { Link } from '@/i18n/routing';

interface Request {
  id: string;
  title: string;
  requester: string;
  department: string;
  workflow: string;
  status: string;
  priority: string;
  created: string;
}

interface RecentRequestsProps {
  tenantId: string;
  workflowFilter?: string | null;
}


// Función para determinar el color de la insignia de estado
function getStatusBadgeVariant(status: string): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (status) {
    case 'En progreso':
    case 'Aprobando cambio':
    case 'Investigando':
      return 'default';
    case 'En revisión':
      return 'secondary';
    case 'Cerrado':
      return 'default'; // Note: "success" is not a valid variant, using "default"
    case 'Borrador':
      return 'outline';
    case 'Cancelado':
      return 'destructive';
    default:
      return 'default';
  }
}

// Función para determinar el color de la insignia de prioridad
function getPriorityBadgeVariant(priority: string): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (priority) {
    case 'Alta':
      return 'destructive';
    case 'Media':
      return 'default'; // Note: "warning" is not a valid variant, using "default"
    case 'Baja':
      return 'secondary';
    default:
      return 'default';
  }
}

export default function RecentRequests({ tenantId, workflowFilter }: RecentRequestsProps) {
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRecentRequests() {
      try {
        const recentRequests = await getRecentRequests(tenantId, workflowFilter, 10);
        setRequests(recentRequests);
      } catch (error) {
        console.error('Error fetching recent requests:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchRecentRequests();
  }, [tenantId, workflowFilter]);

  if (loading) {
    return (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Título</TableHead>
              <TableHead>Solicitante</TableHead>
              <TableHead>Departamento</TableHead>
              {!workflowFilter && <TableHead>Workflow</TableHead>}
              <TableHead>Estado</TableHead>
              <TableHead>Prioridad</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...Array(5)].map((_, i) => (
              <TableRow key={i}>
                <TableCell colSpan={9} className="text-center py-4">
                  Cargando...
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Título</TableHead>
              <TableHead>Solicitante</TableHead>
              <TableHead>Departamento</TableHead>
              {!workflowFilter && <TableHead>Workflow</TableHead>}
              <TableHead>Estado</TableHead>
              <TableHead>Prioridad</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell colSpan={9} className="text-center py-4 text-muted-foreground">
                No hay solicitudes recientes
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Título</TableHead>
            <TableHead>Solicitante</TableHead>
            <TableHead>Departamento</TableHead>
            {!workflowFilter && <TableHead>Workflow</TableHead>}
            <TableHead>Estado</TableHead>
            <TableHead>Prioridad</TableHead>
            <TableHead>Fecha</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {requests.map((request) => (
            <TableRow key={request.id}>
              <TableCell className="font-medium">{request.id.slice(0, 13)}...</TableCell>
              <TableCell>{request.title}</TableCell>
              <TableCell>{request.requester}</TableCell>
              <TableCell>{request.department}</TableCell>
              {!workflowFilter && <TableCell>{request.workflow}</TableCell>}
              <TableCell>
                <Badge variant={getStatusBadgeVariant(request.status)}>{request.status}</Badge>
              </TableCell>
              <TableCell>
                <Badge variant={getPriorityBadgeVariant(request.priority)}>{request.priority}</Badge>
              </TableCell>
              <TableCell>{request.created}</TableCell>
              <TableCell className="text-right">
                <Button variant="ghost" size="sm" asChild>
                  <Link href={{ pathname: '/admin/[tenantId]/requests/[slug]', params: { tenantId, slug: request.id }}}>
                    Ver
                  </Link>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
