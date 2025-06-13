import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

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
  workflowFilter?: string | null;
}

// Datos de ejemplo para la tabla de solicitudes recientes
const allRecentRequests: Request[] = [
  {
    id: 'REQ-2023-001',
    title: 'Activación de servicio móvil',
    requester: 'Juan Pérez',
    department: 'Activaciones',
    workflow: 'Activaciones',
    status: 'En progreso',
    priority: 'Alta',
    created: '2023-06-15',
  },
  {
    id: 'REQ-2023-002',
    title: 'Reclamo de comisión no pagada',
    requester: 'María López',
    department: 'Comisiones',
    workflow: 'Comisiones',
    status: 'En revisión',
    priority: 'Media',
    created: '2023-06-14',
  },
  {
    id: 'REQ-2023-003',
    title: 'Soporte técnico para router',
    requester: 'Carlos Ruiz',
    department: 'Soporte',
    workflow: 'Soporte Técnico',
    status: 'Cerrado',
    priority: 'Baja',
    created: '2023-06-13',
  },
  {
    id: 'REQ-2023-004',
    title: 'Activación de plan corporativo',
    requester: 'Empresa XYZ',
    department: 'Activaciones',
    workflow: 'Activaciones',
    status: 'Borrador',
    priority: 'Alta',
    created: '2023-06-12',
  },
  {
    id: 'REQ-2023-005',
    title: 'Ajuste de facturación',
    requester: 'Ana Martínez',
    department: 'Facturación',
    workflow: 'Facturación',
    status: 'Cancelado',
    priority: 'Media',
    created: '2023-06-11',
  },
  {
    id: 'REQ-2023-006',
    title: 'Cambio de plan empresarial',
    requester: 'Tech Corp',
    department: 'Activaciones',
    workflow: 'Cambios de Plan',
    status: 'Aprobando cambio',
    priority: 'Alta',
    created: '2023-06-10',
  },
  {
    id: 'REQ-2023-007',
    title: 'Reclamo por facturación incorrecta',
    requester: 'Luis García',
    department: 'Reclamos',
    workflow: 'Reclamos',
    status: 'Investigando',
    priority: 'Media',
    created: '2023-06-09',
  },
];

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

export default function RecentRequests({ workflowFilter }: RecentRequestsProps) {
  // Filtrar solicitudes por workflow si se proporciona un filtro
  const filteredRequests = workflowFilter ? allRecentRequests.filter((request) => request.workflow === workflowFilter) : allRecentRequests;

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
          {filteredRequests.map((request) => (
            <TableRow key={request.id}>
              <TableCell className="font-medium">{request.id}</TableCell>
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
                <Button variant="ghost" size="sm">
                  Ver
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
