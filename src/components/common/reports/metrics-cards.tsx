'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface MetricsCardsProps {
  totalRequests: number;
  avgResolutionTime: number;
  openRequests: number;
  closedRequests: number;
  overdueRequests: number;
  loading: boolean;
}

export function MetricsCards({
  totalRequests,
  avgResolutionTime,
  openRequests,
  closedRequests,
  overdueRequests,
  loading,
}: MetricsCardsProps) {
  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Skeletons para las primeras 4 cards */}
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-24 mb-2" />
              <Skeleton className="h-3 w-48" />
            </CardContent>
          </Card>
        ))}
        {/* Skeleton para la card ancha de abajo */}
        <Card className="md:col-span-2 lg:col-span-4">
          <CardHeader className="pb-2">
            <Skeleton className="h-4 w-48" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-24 mb-2" />
            <Skeleton className="h-3 w-64" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Total de Solicitudes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalRequests || 0}</div>
          <p className="text-xs text-muted-foreground">Total de solicitudes en el período</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Tiempo Promedio de Resolución</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{avgResolutionTime || 0} días</div>
          <p className="text-xs text-muted-foreground">Tiempo promedio de resolución</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Solicitudes Abiertas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{openRequests || 0}</div>
          <p className="text-xs text-muted-foreground">Solicitudes en curso</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Solicitudes Cerradas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{closedRequests || 0}</div>
          <p className="text-xs text-muted-foreground">Solicitudes completadas</p>
        </CardContent>
      </Card>
      <Card className="md:col-span-2 lg:col-span-4">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Solicitudes Vencidas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">{overdueRequests || 0}</div>
          <p className="text-xs text-muted-foreground">Solicitudes con SLA vencido</p>
        </CardContent>
      </Card>
    </div>
  );
}

