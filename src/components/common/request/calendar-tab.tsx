'use client';

import { useState, useMemo, useEffect } from 'react';
import { Prisma } from '@zenstackhq/runtime/models';

import Calendar from '@/components/calendar/calendar';
import { CalendarEvent, Mode } from '@/components/calendar/calendar-types';
import { useFindManyRequestAssignment } from '@/services/api/hooks';
import useTenantId from '@/hooks/use-tenant-id';
import { getRequestsFilteredByAreaAccess } from '@/actions/request';

const RequestAssignmentCalendarSelect = Prisma.validator<Prisma.RequestAssignmentFindManyArgs>()({
  select: {
    id: true,
    requestId: true,
    slaDeadline: true,
    request: {
      select: {
        id: true,
        slug: true,
        issueSubject: true,
      },
    },
    priority: {
      select: {
        id: true,
        name: true,
        primaryColor: true,
      },
    },
    status: {
      select: {
        id: true,
        name: true,
        color: true,
      },
    },
  },
});

type AssignmentForCalendar = Prisma.RequestAssignmentGetPayload<typeof RequestAssignmentCalendarSelect>;

// Mapea colores hex a colores del calendario
function getCalendarColorFromHex(hexColor: string | null | undefined): string {
  if (!hexColor) return 'blue';
  
  // Convertir hex a RGB
  const hex = hexColor.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  
  // Determinar el color más cercano basado en RGB
  // Rojo
  if (r > g && r > b && r > 200) return 'red';
  // Naranja/Amber
  if (r > g && g > b && r > 180) return 'orange';
  // Amarillo/Amber
  if (r > 200 && g > 200 && b < 100) return 'amber';
  // Verde/Emerald
  if (g > r && g > b && g > 150) return 'emerald';
  // Azul/Indigo
  if (b > r && b > g) return 'blue';
  // Rosa/Pink
  if (r > 200 && g < 150 && b > 150) return 'pink';
  
  // Por defecto
  return 'blue';
}

function convertAssignmentsToEvents(assignments: AssignmentForCalendar[]): CalendarEvent[] {
  return assignments
    .filter((assignment) => assignment.slaDeadline != null)
    .map((assignment) => {
      const slaDeadline = new Date(assignment.slaDeadline!);
      // Crear un evento de un día (de inicio del día a fin del día)
      const start = new Date(slaDeadline);
      start.setHours(0, 0, 0, 0);
      
      const end = new Date(slaDeadline);
      end.setHours(23, 59, 59, 999);
      
      // Usar el color de la prioridad o del estado, o azul por defecto
      const color = getCalendarColorFromHex(
        assignment.priority?.primaryColor ?? assignment.status?.color ?? null
      );
      
      const title = assignment.request.issueSubject || `Request #${assignment.request.slug || assignment.requestId}`;
      
      return {
        id: assignment.id,
        title,
        color,
        start,
        end,
      };
    });
}

export default function CalendarTab() {
  const tenantId = useTenantId();
  const [mode, setMode] = useState<Mode>('month');
  const [date, setDate] = useState<Date>(new Date());
  const [requestFilter, setRequestFilter] = useState<Prisma.RequestWhereInput | null>(null);

  // Obtener el filtro de requests basado en acceso del área
  useEffect(() => {
    if (!tenantId) {
      setRequestFilter(null);
      return;
    }

    let active = true;

    async function loadFilter() {
      try {
        const where = await getRequestsFilteredByAreaAccess(tenantId);
        if (!active) return;
        setRequestFilter(where);
      } catch (error) {
        console.error('Error fetching request filters', error);
        if (!active) return;
        // Set empty filter on error - user sees nothing
        setRequestFilter({ id: { in: [] } });
      }
    }

    loadFilter();

    return () => {
      active = false;
    };
  }, [tenantId]);

  // Query para obtener assignments con SLA
  const assignmentsArgs = useMemo(() => {
    if (!tenantId || !requestFilter) return undefined;
    
    return {
      ...RequestAssignmentCalendarSelect,
      where: {
        tenantId,
        isActive: true,
        slaDeadline: { not: null }, // Solo assignments con SLA
        request: requestFilter,
      },
      orderBy: [{ slaDeadline: 'asc' as const }],
    } satisfies Prisma.RequestAssignmentFindManyArgs;
  }, [tenantId, requestFilter]);

  const assignmentsQuery = useFindManyRequestAssignment(assignmentsArgs, {
    enabled: Boolean(assignmentsArgs),
    staleTime: 15_000,
  });

  const assignments = useMemo(
    () => (assignmentsQuery.data ?? []) as AssignmentForCalendar[],
    [assignmentsQuery.data]
  );

  // Convertir assignments a eventos del calendario
  const events = useMemo(() => {
    return convertAssignmentsToEvents(assignments);
  }, [assignments]);

  return <Calendar events={events} setEvents={() => {}} mode={mode} setMode={setMode} date={date} setDate={setDate} />;
}
