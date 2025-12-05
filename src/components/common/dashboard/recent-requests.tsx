'use client';

import { memo, useEffect, useState } from 'react';
import { getRecentRequests } from '@/actions/dashboard';
import { Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';

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
  tenantId: string;
  workflowFilter?: string | null;
}

export function RecentRequestsFallback() {
  return (
    <div className="mt-8">
      <div className="h-64 animate-pulse rounded-lg bg-muted" />
    </div>
  );
}

// Determine badge variant for status
function getStatusBadgeVariant(status: string): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (status) {
    case 'En progreso':
    case 'Aprobando cambio':
    case 'Investigando':
      return 'default';
    case 'En revisión':
      return 'secondary';
    case 'Cerrado':
      return 'default';
    case 'Borrador':
      return 'outline';
    case 'Cancelado':
      return 'destructive';
    default:
      return 'default';
  }
}

// Determine badge variant for priority
function getPriorityBadgeVariant(priority: string): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (priority) {
    case 'Alta':
      return 'destructive';
    case 'Media':
      return 'default';
    case 'Baja':
      return 'secondary';
    default:
      return 'default';
  }
}

export default function RecentRequests({ tenantId, workflowFilter }: RecentRequestsProps) {
  const t = useTranslations('admin.dashboard.recentRequests');
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
              <TableHead>{t('table.id')}</TableHead>
              <TableHead>{t('table.title')}</TableHead>
              <TableHead>{t('table.requester')}</TableHead>
              <TableHead>{t('table.department')}</TableHead>
              {!workflowFilter && <TableHead>{t('table.workflow')}</TableHead>}
              <TableHead>{t('table.status')}</TableHead>
              <TableHead>{t('table.priority')}</TableHead>
              <TableHead>{t('table.date')}</TableHead>
              <TableHead className="text-right">{t('table.actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...Array(5)].map((_, i) => (
              <TableRow key={i}>
                <TableCell colSpan={9} className="text-center py-4">
                  {t('loading')}
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
              <TableHead>{t('table.id')}</TableHead>
              <TableHead>{t('table.title')}</TableHead>
              <TableHead>{t('table.requester')}</TableHead>
              <TableHead>{t('table.department')}</TableHead>
              {!workflowFilter && <TableHead>{t('table.workflow')}</TableHead>}
              <TableHead>{t('table.status')}</TableHead>
              <TableHead>{t('table.priority')}</TableHead>
              <TableHead>{t('table.date')}</TableHead>
              <TableHead className="text-right">{t('table.actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell colSpan={9} className="text-center py-4 text-muted-foreground">
                {t('empty')}
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
            <TableHead>{t('table.id')}</TableHead>
            <TableHead>{t('table.title')}</TableHead>
            <TableHead>{t('table.requester')}</TableHead>
            <TableHead>{t('table.department')}</TableHead>
            {!workflowFilter && <TableHead>{t('table.workflow')}</TableHead>}
            <TableHead>{t('table.status')}</TableHead>
            <TableHead>{t('table.priority')}</TableHead>
            <TableHead>{t('table.date')}</TableHead>
            <TableHead className="text-right">{t('table.actions')}</TableHead>
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
                  <Link href={{ pathname: '/admin/[tenantId]/requests/[slug]', params: { tenantId, slug: request.id } }}>{t('view')}</Link>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
