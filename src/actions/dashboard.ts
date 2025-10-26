'use server';

import { STATUS } from '@/constants/requests';
import { db } from '@/server/db-client';
import { endOfDay, subDays } from 'date-fns';

export async function getDashboardRequestTrends(tenantId: string) {
  const requestTrends = await db.requestAssignment.groupBy({
    by: ['createdAt'],
    where: {
      tenantId,
      createdAt: {
        gte: new Date(new Date().setDate(new Date().getDate() - 30)),
      },
    },
    _count: {
      id: true,
    },
    orderBy: {
      createdAt: 'asc',
    },
  });

  return requestTrends.map((trend) => ({
    date: trend.createdAt.toISOString().split('T')[0],
    count: trend._count.id,
  }));
}

export async function getDashboardRequestCounts(tenantId: string) {
  const totalRequests = await db.request.count({
    where: { tenantId },
  });

  const openRequests = await db.request.count({
    where: {
      tenantId,
      requestAssignments: {
        some: {
          status: {
            type: { in: [STATUS.INITIAL, STATUS.DEFAULT] },
          },
        },
      },
    },
  });

  const overdueRequests = await db.request.count({
    where: {
      tenantId,
      requestAssignments: {
        some: {
          slaDeadline: { lt: new Date() },
          slaEnd: null,
        },
      },
    },
  });

  // get all requests with slaStart and slaEnd not null
  const resolvedRequests = await db.requestAssignment.findMany({
    select: { slaStart: true, slaEnd: true },
    where: { tenantId, slaStart: { not: null }, slaEnd: { not: null } },
  });

  // calculate the average resolution time in hours
  const avgResolutionTime =
    resolvedRequests.length > 0
      ? Math.round(
          resolvedRequests.reduce((acc, req) => {
            return acc + (new Date(req.slaEnd!).getTime() - new Date(req.slaStart!).getTime()) / 3600000;
          }, 0) / resolvedRequests.length
        )
      : 'N/A';

  return {
    totalRequests,
    openRequests,
    overdueRequests,
    avgResolutionTime,
  };
}

export async function getWorkflows(tenantId: string) {
  const workflows = await db.requestWorkflow.findMany({
    where: {
      tenantId,
      isActive: true,
    },
    select: {
      id: true,
      name: true,
      description: true,
      _count: {
        select: {
          requestCategory: true,
        },
      },
    },
    orderBy: {
      name: 'asc',
    },
  });

  return workflows;
}

interface AssignmentWhereClause {
  request: {
    tenantId: string;
  };
  requestCategory?: {
    requestWorkflowId: string;
  };
}

interface RequestWhereClause {
  tenantId: string;
  isDraft?: boolean;
  closedAt?: null | { gte?: Date };
  createdAt?: { lt?: Date };
  requestAssignments?: {
    some: {
      requestCategory: {
        requestWorkflowId: string;
      };
    };
  };
}

export async function getDashboardMetrics(tenantId: string, workflowId?: string | null) {
  const now = new Date();
  const lastMonth = subDays(now, 30);
  
  // Build where condition for request assignments based on workflow
  const assignmentWhere: AssignmentWhereClause = {
    request: {
      tenantId,
    },
  };

  // If workflowId is provided, filter by categories that belong to that workflow
  if (workflowId && workflowId !== 'all') {
    assignmentWhere.requestCategory = {
      requestWorkflowId: workflowId,
    };
  }

  // Build where condition for requests based on workflow
  const requestWhere: RequestWhereClause = { tenantId };
  
  if (workflowId && workflowId !== 'all') {
    requestWhere.requestAssignments = {
      some: {
        requestCategory: {
          requestWorkflowId: workflowId,
        },
      },
    };
  }

  // Total de solicitudes
  const totalRequests = await db.request.count({
    where: requestWhere,
  });

  // Total de solicitudes del mes anterior para comparación
  const totalRequestsLastMonthWhere = { ...requestWhere };
  totalRequestsLastMonthWhere.createdAt = { lt: lastMonth };
  
  const totalRequestsLastMonth = await db.request.count({
    where: totalRequestsLastMonthWhere,
  });

  // Solicitudes en borrador
  const draftRequestsWhere = { ...requestWhere };
  draftRequestsWhere.isDraft = true;
  
  const draftRequests = await db.request.count({
    where: draftRequestsWhere,
  });

  const draftRequestsLastMonthWhere = { ...draftRequestsWhere };
  draftRequestsLastMonthWhere.createdAt = { lt: lastMonth };
  
  const draftRequestsLastMonth = await db.request.count({
    where: draftRequestsLastMonthWhere,
  });

  // Tiempo promedio de resolución (obteniendo resueltos en los últimos 30 días)
  const resolvedRequests = await db.requestAssignment.findMany({
    where: {
      ...assignmentWhere,
      slaStart: { not: null },
      slaEnd: { 
        not: null,
        gte: lastMonth 
      },
    },
    select: { slaStart: true, slaEnd: true },
  });

  const avgResolutionTime =
    resolvedRequests.length > 0
      ? resolvedRequests.reduce((acc, req) => {
          return acc + (new Date(req.slaEnd!).getTime() - new Date(req.slaStart!).getTime()) / (1000 * 60 * 60 * 24);
        }, 0) / resolvedRequests.length
      : 0;

  // Calcular tiempo promedio de resolución del mes anterior para tendencia
  const lastTwoMonths = subDays(now, 60);
  const lastMonthStart = subDays(now, 30);
  
  const lastMonthResolvedRequests = await db.requestAssignment.findMany({
    where: {
      ...assignmentWhere,
      slaStart: { not: null },
      slaEnd: { 
        not: null,
        gte: lastTwoMonths,
        lt: lastMonthStart
      },
    },
    select: { slaStart: true, slaEnd: true },
  });

  const lastMonthAvgResolutionTime = lastMonthResolvedRequests.length > 0
    ? lastMonthResolvedRequests.reduce((acc, req) => {
        return acc + (new Date(req.slaEnd!).getTime() - new Date(req.slaStart!).getTime()) / (1000 * 60 * 60 * 24);
      }, 0) / lastMonthResolvedRequests.length
    : 0;

  // Solicitudes resueltas en el mes
  const resolvedRequestsCountWhere = { ...requestWhere };
  resolvedRequestsCountWhere.closedAt = { gte: lastMonth };
  
  const resolvedRequestsCount = await db.request.count({
    where: resolvedRequestsCountWhere,
  });

  // Solicitudes con SLA vencido
  const slaOverdueWhere = {
    ...assignmentWhere,
    slaDeadline: { lt: now },
    slaEnd: null,
    isActive: true,
  };
  
  const slaOverdue = await db.requestAssignment.count({
    where: slaOverdueWhere,
  });

  // Solicitudes con SLA vencido el mes anterior
  const slaOverdueLastMonthWhere = {
    ...assignmentWhere,
    slaDeadline: { lt: subDays(now, 31) },
    slaEnd: null,
    isActive: true,
  };
  
  const slaOverdueLastMonth = await db.requestAssignment.count({
    where: slaOverdueLastMonthWhere,
  });

  // Solicitudes en riesgo (75% del tiempo transcurrido)
  const slaAtRisk = await db.requestAssignment.findMany({
    where: {
      ...assignmentWhere,
      slaStart: { not: null },
      slaDeadline: { not: null },
      slaEnd: null,
      isActive: true,
    },
    select: { slaStart: true, slaDeadline: true },
  });

  const requestsAtRisk = slaAtRisk.filter((req) => {
    if (!req.slaStart || !req.slaDeadline) return false;
    const totalTime = new Date(req.slaDeadline).getTime() - new Date(req.slaStart).getTime();
    const elapsed = now.getTime() - new Date(req.slaStart).getTime();
    const percentage = (elapsed / totalTime) * 100;
    return percentage >= 75 && percentage < 100;
  }).length;

  // Solicitudes en riesgo el mes anterior
  const slaAtRiskLastMonthWhere = {
    ...assignmentWhere,
    slaStart: { not: null },
    slaDeadline: { not: null },
    slaEnd: null,
    isActive: true,
  };
  
  const slaAtRiskLastMonth = await db.requestAssignment.findMany({
    where: slaAtRiskLastMonthWhere,
    select: { slaStart: true, slaDeadline: true },
  });

  const requestsAtRiskLastMonth = slaAtRiskLastMonth.filter((req) => {
    if (!req.slaStart || !req.slaDeadline) return false;
    const lastMonthDate = subDays(now, 31);
    const totalTime = new Date(req.slaDeadline).getTime() - new Date(req.slaStart).getTime();
    const elapsed = lastMonthDate.getTime() - new Date(req.slaStart).getTime();
    const percentage = (elapsed / totalTime) * 100;
    return percentage >= 75 && percentage < 100;
  }).length;

  // Calcular SLA promedio cumplido
  const allSlaRequestsWhere = {
    ...assignmentWhere,
    slaStart: { not: null },
    slaDeadline: { not: null },
  };
  
  const allSlaRequests = await db.requestAssignment.findMany({
    where: allSlaRequestsWhere,
    select: { slaEnd: true, slaDeadline: true },
  });

  const slaComplianceCount = allSlaRequests.filter((req) => {
    if (!req.slaDeadline || !req.slaEnd) return false;
    return new Date(req.slaEnd) <= new Date(req.slaDeadline);
  }).length;

  const slaCompliancePercentage = allSlaRequests.length > 0 ? (slaComplianceCount / allSlaRequests.length) * 100 : 0;

  // Solicitudes pendientes (no borrador, no cerradas)
  const pendingRequestsWhere = {
    ...assignmentWhere,
    request: {
      isDraft: false,
      closedAt: null,
    },
    isActive: true,
  };
  
  const pendingRequests = await db.requestAssignment.count({
    where: pendingRequestsWhere,
  });

  // Cálculo de tendencias
  const calculateTrend = (current: number, previous: number) => {
    if (previous === 0) return { value: 0, isPositive: true };
    const change = ((current - previous) / previous) * 100;
    return { value: Math.abs(change), isPositive: change >= 0 };
  };

  // Solicitudes pendientes con prioridad alta
  const pendingHighPriorityWhere = {
    ...pendingRequestsWhere,
    priority: {
      level: { gte: 7 }, // Alta prioridad
    },
  };
  
  const pendingHighPriority = await db.requestAssignment.count({
    where: pendingHighPriorityWhere,
  });

  // Cálculo de tendencia de avgResolutionTime
  const resolutionTimeTrend = calculateTrend(avgResolutionTime, lastMonthAvgResolutionTime);

  return {
    totalRequests: {
      value: totalRequests,
      trend: calculateTrend(totalRequests, totalRequestsLastMonth),
    },
    draftRequests: {
      value: draftRequests,
      trend: calculateTrend(draftRequests, draftRequestsLastMonth),
    },
    avgResolutionTime: avgResolutionTime,
    avgResolutionTimeTrend: resolutionTimeTrend,
    resolutionRate: {
      value: totalRequests > 0 ? (resolvedRequestsCount / totalRequests) * 100 : 0,
      trend: { value: 0, isPositive: true }, // TODO: calcular tendencia real
    },
    pendingRequests: {
      value: pendingRequests,
      trend: { value: 0, isPositive: true }, // TODO: calcular tendencia real
      highPriority: pendingHighPriority,
    },
    completedRequests: {
      value: resolvedRequestsCount,
      avgResolutionTime: avgResolutionTime,
    },
    slaOverdue: {
      value: slaOverdue,
      trend: calculateTrend(slaOverdue, slaOverdueLastMonth),
    },
    slaCompliance: {
      value: slaCompliancePercentage,
      trend: { value: 0, isPositive: true }, // TODO: calcular tendencia real
    },
    slaAtRisk: {
      value: requestsAtRisk,
      trend: calculateTrend(requestsAtRisk, requestsAtRiskLastMonth),
    },
  };
}

export async function getDashboardAssignmentTrends(tenantId: string, timeRange?: string) {
  const days = timeRange === '30d' ? 30 : timeRange === '7d' ? 7 : 90;

  const endDate = endOfDay(new Date());
  const startDate = subDays(endDate, days);

  const assignments = await db.requestAssignment.findMany({
    where: {
      tenantId,
      assignmentDate: {
        gte: startDate,
        lte: endDate,
      },
    },
    include: {
      assignedUsers: true,
    },
  });

  // Proccess data for the chart
  const chartData = assignments.reduce((acc, assignment) => {
    const date = assignment.assignmentDate.toISOString().split('T')[0];
    const entry = acc.get(date) || { date, user: 0, area: 0 };

    return acc.set(date, {
      date,
      user: entry.user + assignment.assignedUsers.length,
      area: entry.area + 1,
    });
  }, new Map<string, { date: string; user: number; area: number }>());

  return Array.from(chartData.values()).sort((a, b) => a.date.localeCompare(b.date));
}

interface WorkflowWhereClause {
  tenantId: string;
  assignmentDate: {
    gte: Date;
  };
  requestCategory?: {
    requestWorkflowId: string;
  };
}

interface WorkflowQueryWhereClause {
  tenantId: string;
  isActive: boolean;
  id?: string;
}

export async function getWorkflowStatsByMonth(tenantId: string, months: number = 6, workflowId?: string | null) {
  const now = new Date();
  const startDate = new Date(now.getFullYear(), now.getMonth() - months + 1, 1);
  
  // Build where condition based on workflow
  const whereCondition: WorkflowWhereClause = {
    tenantId,
    assignmentDate: {
      gte: startDate,
    },
  };

  // If workflowId is provided, filter by categories that belong to that workflow
  if (workflowId && workflowId !== 'all') {
    whereCondition.requestCategory = {
      requestWorkflowId: workflowId,
    };
  }

  // Get all assignments with their categories and workflows
  const assignments = await db.requestAssignment.findMany({
    where: whereCondition,
    select: {
      assignmentDate: true,
      requestCategory: {
        select: {
          requestWorkflow: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
  });

  // Get all unique workflows
  const workflowWhereCondition: WorkflowQueryWhereClause = {
    tenantId,
    isActive: true,
  };

  // If a specific workflow is selected, only get that one
  if (workflowId && workflowId !== 'all') {
    workflowWhereCondition.id = workflowId;
  }

  const workflows = await db.requestWorkflow.findMany({
    where: workflowWhereCondition,
    select: {
      id: true,
      name: true,
    },
  });

  // Group by month and workflow
  const monthlyData = new Map<string, Map<string, number>>();

  // Initialize map with all months and workflows
  const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'];
  for (let i = 0; i < months; i++) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthKey = date.toLocaleDateString('es-ES', { month: 'short' }).replace('.', '');
    monthlyData.set(monthKey, new Map<string, number>());
    workflows.forEach((workflow) => {
      monthlyData.get(monthKey)!.set(workflow.name, 0);
    });
  }

  // Process assignments
  assignments.forEach((assignment) => {
    const assignmentDate = new Date(assignment.assignmentDate);
    const monthKey = assignmentDate.toLocaleDateString('es-ES', { month: 'short' }).replace('.', '');
    const workflowName = assignment.requestCategory.requestWorkflow?.name;

    if (workflowName) {
      const monthData = monthlyData.get(monthKey);
      if (monthData) {
        const currentCount = monthData.get(workflowName) || 0;
        monthData.set(workflowName, currentCount + 1);
      }
    }
  });

  // Convert to array format for chart
  const result = Array.from(monthlyData.entries())
    .sort((a, b) => {
      const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
      return months.indexOf(b[0]) - months.indexOf(a[0]);
    })
    .slice(0, months)
    .reverse()
    .map(([month, workflowMap]) => {
      const entry: Record<string, string | number> = { name: month };
      workflowMap.forEach((count, workflowName) => {
        entry[workflowName] = count;
      });
      return entry;
    });

  return {
    data: result,
    workflows: workflows.map((w) => ({ id: w.id, name: w.name })),
  };
}

interface RecentRequestsWhereClause {
  tenantId: string;
  requestAssignments?: {
    some: {
      requestCategory: {
        requestWorkflowId: string;
      };
    };
  };
}

export async function getRecentRequests(tenantId: string, workflowFilter?: string | null, limit: number = 10) {
  const whereCondition: RecentRequestsWhereClause = {
    tenantId,
  };

  // If workflowId is provided, filter by categories that belong to that workflow
  if (workflowFilter && workflowFilter !== 'all') {
    whereCondition.requestAssignments = {
      some: {
        requestCategory: {
          requestWorkflowId: workflowFilter,
        },
      },
    };
  }

  const requests = await db.request.findMany({
    where: whereCondition,
    select: {
      id: true,
      issueSubject: true,
      createdAt: true,
      requestAssignments: {
        where: { isActive: true },
        take: 1,
        orderBy: { createdAt: 'desc' },
        select: {
          requestCategory: {
            select: {
              name: true,
              requestWorkflow: {
                select: {
                  name: true,
                },
              },
            },
          },
          assignmentCategory: {
            select: {
              name: true,
            },
          },
          status: {
            select: {
              name: true,
            },
          },
          priority: {
            select: {
              name: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: limit,
  });

  return requests.map((request) => ({
    id: request.id,
    title: request.issueSubject,
    workflow: request.requestAssignments[0]?.requestCategory?.requestWorkflow?.name || 'Sin workflow',
    status: request.requestAssignments[0]?.status?.name || 'N/A',
    priority: request.requestAssignments[0]?.priority?.name || 'N/A',
    department: request.requestAssignments[0]?.requestCategory?.name || 'N/A',
    created: request.createdAt.toISOString().split('T')[0],
    requester: 'N/A', // TODO: Add requester data when available
  }));
}

interface SLAFilters {
  slaStatus?: string;
  slaPercentage?: number[];
  slaTimeRange?: string;
  workflowType?: string;
}

interface BaseWhereClause {
  tenantId: string;
  slaStart: { not: null };
  slaDeadline: { not: null };
  isActive: boolean;
  requestCategory?: {
    requestWorkflowId: string;
  };
}

export async function getSLADashboardData(tenantId: string, filters?: SLAFilters) {
  const now = new Date();

  // Construir filtros de where según los filtros recibidos
  const baseWhere: BaseWhereClause = {
    tenantId,
    slaStart: { not: null },
    slaDeadline: { not: null },
    isActive: true,
  };

  // Filtro por workflowType
  if (filters?.workflowType && filters.workflowType !== 'all') {
    baseWhere.requestCategory = {
      requestWorkflowId: filters.workflowType,
    };
  }

  // Obtener todas las asignaciones con SLA
  const assignmentsWithSLA = await db.requestAssignment.findMany({
    where: baseWhere,
    select: {
      slaStart: true,
      slaDeadline: true,
      slaEnd: true,
      assignmentDate: true,
      requestCategory: {
        select: {
          name: true,
          requestWorkflow: {
            select: {
              name: true,
            },
          },
        },
      },
    },
  });

  // Calcular estados de SLA
  const slaStates = {
    onTime: 0,
    warning: 0,
    overdue: 0,
    completed: 0,
  };

  const slaByWorkflow = new Map<string, { onTime: number; warning: number; overdue: number; completed: number }>();
  const slaByDepartment = new Map<string, { onTime: number; warning: number; overdue: number; completed: number }>();
  const slaHourlyData = new Map<number, { violations: number; total: number }>();

  assignmentsWithSLA.forEach((assignment) => {
    if (!assignment.slaStart || !assignment.slaDeadline) return;

    const startTime = new Date(assignment.slaStart).getTime();
    const deadlineTime = new Date(assignment.slaDeadline).getTime();
    const currentTime = now.getTime();

    const isCompleted = !!assignment.slaEnd;
    const isOverdue = !isCompleted && currentTime > deadlineTime;
    
    const percentage = isCompleted && assignment.slaEnd
      ? ((new Date(assignment.slaEnd).getTime() - startTime) / (deadlineTime - startTime)) * 100
      : ((currentTime - startTime) / (deadlineTime - startTime)) * 100;

    // Aplicar filtro de porcentaje de SLA
    if (filters?.slaPercentage) {
      const [minPercent, maxPercent] = filters.slaPercentage;
      if (percentage < minPercent || percentage > maxPercent) {
        return; // Skip this assignment
      }
    }

    // Aplicar filtro de estado de SLA
    if (filters?.slaStatus && filters.slaStatus !== 'all') {
      if (filters.slaStatus === 'completed' && !isCompleted) return;
      if (filters.slaStatus === 'overdue' && !isOverdue) return;
      if (filters.slaStatus === 'warning' && (percentage < 75 || percentage >= 100 || isOverdue || isCompleted)) return;
      if (filters.slaStatus === 'on-time' && (percentage >= 75 || isOverdue || isCompleted)) return;
    }

    // Aplicar filtro de tiempo restante
    if (filters?.slaTimeRange && filters.slaTimeRange !== 'all') {
      const timeRemaining = deadlineTime - currentTime;
      const hoursRemaining = timeRemaining / (1000 * 60 * 60);
      
      switch (filters.slaTimeRange) {
        case 'less-than-1h':
          if (!isOverdue && hoursRemaining >= 1) return;
          break;
        case '1-4h':
          if (!isOverdue && (hoursRemaining < 1 || hoursRemaining > 4)) return;
          break;
        case '4-24h':
          if (!isOverdue && (hoursRemaining < 4 || hoursRemaining > 24)) return;
          break;
        case '1-3d':
          if (!isOverdue && (hoursRemaining < 24 || hoursRemaining > 72)) return;
          break;
        case 'more-than-3d':
          if (!isOverdue && hoursRemaining <= 72) return;
          break;
        case 'overdue':
          if (!isOverdue) return;
          break;
      }
    }

    // Clasificar por estado
    if (isOverdue) {
      slaStates.overdue++;
    } else if (isCompleted && percentage <= 100) {
      slaStates.completed++;
    } else if (percentage >= 75 && percentage < 100) {
      slaStates.warning++;
    } else {
      slaStates.onTime++;
    }

    // Por workflow
    const workflowName = assignment.requestCategory?.requestWorkflow?.name || 'Sin workflow';
    if (!slaByWorkflow.has(workflowName)) {
      slaByWorkflow.set(workflowName, { onTime: 0, warning: 0, overdue: 0, completed: 0 });
    }
    const workflowData = slaByWorkflow.get(workflowName)!;
    if (isOverdue) workflowData.overdue++;
    else if (isCompleted) workflowData.completed++;
    else if (percentage >= 75) workflowData.warning++;
    else workflowData.onTime++;

    // Por departamento (categoría)
    const deptName = assignment.requestCategory?.name || 'Sin categoría';
    if (!slaByDepartment.has(deptName)) {
      slaByDepartment.set(deptName, { onTime: 0, warning: 0, overdue: 0, completed: 0 });
    }
    const deptData = slaByDepartment.get(deptName)!;
    if (isOverdue) deptData.overdue++;
    else if (isCompleted) deptData.completed++;
    else if (percentage >= 75) deptData.warning++;
    else deptData.onTime++;

    // Por hora
    const hour = new Date(assignment.assignmentDate).getHours();
    if (!slaHourlyData.has(hour)) {
      slaHourlyData.set(hour, { violations: 0, total: 0 });
    }
    const hourlyData = slaHourlyData.get(hour)!;
    hourlyData.total++;
    if (isOverdue || (percentage >= 75 && !isCompleted)) {
      hourlyData.violations++;
    }
  });

  // Calcular cumplimiento total
  const totalAssignments = assignmentsWithSLA.length;
  const completedOnTime = slaStates.onTime + slaStates.completed;
  const compliancePercentage = totalAssignments > 0 ? (completedOnTime / totalAssignments) * 100 : 0;

  // Calcular tiempo promedio de resolución
  const completedAssignments = assignmentsWithSLA.filter((a) => a.slaEnd && a.slaStart);
  const totalResolutionDays = completedAssignments.reduce((sum, a) => {
    if (!a.slaStart || !a.slaEnd) return sum;
    const start = new Date(a.slaStart).getTime();
    const end = new Date(a.slaEnd).getTime();
    return sum + (end - start) / (1000 * 60 * 60 * 24);
  }, 0);
  const avgResolutionTime = completedAssignments.length > 0
    ? totalResolutionDays / completedAssignments.length
    : 0;

  // Solicitudes en riesgo
  const atRisk = slaStates.warning;
  const overdue = slaStates.overdue;

  // Convertir datos para los gráficos
  const slaPieData = [
    { name: 'A tiempo', value: slaStates.onTime, color: '#3b82f6' },
    { name: 'Próximo a vencer', value: slaStates.warning, color: '#f59e0b' },
    { name: 'Vencido', value: slaStates.overdue, color: '#ef4444' },
    { name: 'Completado', value: slaStates.completed, color: '#10b981' },
  ];

  const slaWorkflowData = Array.from(slaByWorkflow.entries()).map(([name, data]) => ({
    name,
    onTime: data.onTime,
    warning: data.warning,
    overdue: data.overdue,
    completed: data.completed,
  }));

  // Datos por hora (convertir a formato requerido)
  const slaHourlyChartData = Array.from(slaHourlyData.entries())
    .sort(([a], [b]) => a - b)
    .map(([hour, data]) => ({
      hour: `${hour.toString().padStart(2, '0')}`,
      violations: data.violations,
      total: data.total,
    }));

  // Datos por departamento
  const slaDeptData = Array.from(slaByDepartment.entries()).map(([name, data]) => {
    const total = data.onTime + data.warning + data.overdue + data.completed;
    const compliance = total > 0 ? ((data.onTime + data.completed) / total) * 100 : 0;
    return {
      name,
      compliance,
    };
  });

  // Obtener mejor workflow por cumplimiento
  let bestWorkflow = 'N/A';
  let bestCompliance = 0;
  slaByWorkflow.forEach((data, name) => {
    const total = data.onTime + data.warning + data.overdue + data.completed;
    const compliance = total > 0 ? ((data.onTime + data.completed) / total) * 100 : 0;
    if (compliance > bestCompliance) {
      bestCompliance = compliance;
      bestWorkflow = name;
    }
  });

  // Obtener alertas de SLA (solicitudes en riesgo o vencidas) con filtros
  const alerts = await db.requestAssignment.findMany({
    where: baseWhere,
    select: {
      id: true,
      requestId: true,
      slaStart: true,
      slaDeadline: true,
      slaEnd: true,
      requestCategory: {
        select: {
          name: true,
          requestWorkflow: {
            select: {
              name: true,
            },
          },
        },
      },
      request: {
        select: {
          issueSubject: true,
        },
      },
    },
    orderBy: {
      slaDeadline: 'asc',
    },
    take: 10,
  });

  const slaAlerts = alerts
    .map((assignment) => {
      if (!assignment.slaStart || !assignment.slaDeadline) return null;

      const startTime = new Date(assignment.slaStart).getTime();
      const deadlineTime = new Date(assignment.slaDeadline).getTime();
      const currentTime = now.getTime();

      const isCompleted = !!assignment.slaEnd;
      const isOverdue = !isCompleted && currentTime > deadlineTime;
      const totalTime = deadlineTime - startTime;
      const endDate = assignment.slaEnd ? new Date(assignment.slaEnd) : null;
      const elapsed = isCompleted && endDate
        ? endDate.getTime() - startTime 
        : currentTime - startTime;
      const percentage = (elapsed / totalTime) * 100;

      if (isOverdue) {
        const hoursOverdue = (currentTime - deadlineTime) / (1000 * 60 * 60);
        const slaPercent = percentage;

        return {
          id: assignment.id,
          requestId: assignment.requestId,
          issueSubject: assignment.request.issueSubject,
          type: 'overdue',
          level: 'danger',
          message: `Vencido hace ${hoursOverdue.toFixed(0)} horas (${slaPercent.toFixed(0)}% del SLA)`,
          department: `${assignment.requestCategory?.requestWorkflow?.name || 'N/A'} - ${assignment.requestCategory?.name || 'N/A'}`,
        };
      } else if (percentage >= 75 && !isCompleted) {
        const timeRemaining = deadlineTime - currentTime;
        const hoursRemaining = timeRemaining / (1000 * 60 * 60);

        return {
          id: assignment.id,
          requestId: assignment.requestId,
          issueSubject: assignment.request.issueSubject,
          type: 'warning',
          level: 'warning',
          message: `Vence en ${hoursRemaining.toFixed(0)} horas (${percentage.toFixed(0)}% del SLA)`,
          department: `${assignment.requestCategory?.requestWorkflow?.name || 'N/A'} - ${assignment.requestCategory?.name || 'N/A'}`,
        };
      }

      return null;
    })
    .filter((alert): alert is NonNullable<typeof alert> => alert !== null)
    .slice(0, 3);

  // Calcular tiempo promedio por tipo (solo para completados)
  const avgTimeByType = new Map<string, { total: number; sum: number }>();
  
  assignmentsWithSLA.filter(a => a.slaEnd).forEach((assignment) => {
    if (!assignment.slaStart || !assignment.slaEnd) return;
    
    const deptName = assignment.requestCategory?.name || 'Sin categoría';
    const resolutionHours = (new Date(assignment.slaEnd).getTime() - new Date(assignment.slaStart).getTime()) / (1000 * 60 * 60);
    
    if (!avgTimeByType.has(deptName)) {
      avgTimeByType.set(deptName, { total: 0, sum: 0 });
    }
    
    const data = avgTimeByType.get(deptName)!;
    data.total++;
    data.sum += resolutionHours;
  });

  const avgTimeByTypeData = Array.from(avgTimeByType.entries())
    .map(([name, data]) => ({
      name,
      hours: data.total > 0 ? data.sum / data.total : 0,
      count: data.total,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 4);

  // Calcular tiempo SLA promedio asignado
  const slaTotalTime = assignmentsWithSLA
    .filter(a => a.slaStart && a.slaDeadline)
    .reduce((sum, a) => {
      const start = new Date(a.slaStart!).getTime();
      const deadline = new Date(a.slaDeadline!).getTime();
      return sum + (deadline - start);
    }, 0);

  const avgSlaHours = assignmentsWithSLA.length > 0 ? slaTotalTime / (assignmentsWithSLA.length * 1000 * 60 * 60) : 0;

  // Calcular tendencias (comparar con mes anterior)
  const lastMonthStart = subDays(now, 60);
  const lastMonthEnd = subDays(now, 30);

  const lastMonthCompliance = await db.requestAssignment.findMany({
    where: {
      tenantId,
      slaStart: { not: null },
      slaDeadline: { not: null },
      assignmentDate: {
        gte: lastMonthStart,
        lt: lastMonthEnd,
      },
      isActive: true,
    },
    select: {
      slaStart: true,
      slaDeadline: true,
      slaEnd: true,
    },
  });

  const lastMonthCompliancePercentage = lastMonthCompliance.length > 0
    ? (lastMonthCompliance.filter(a => {
        if (!a.slaStart || !a.slaDeadline) return false;
        const isCompleted = !!a.slaEnd;
        if (!isCompleted) return false;
        const startTime = new Date(a.slaStart).getTime();
        const deadlineTime = new Date(a.slaDeadline).getTime();
        const endDate = a.slaEnd ? new Date(a.slaEnd) : null;
        if (!endDate) return false;
        const endTime = endDate.getTime();
        const percentage = ((endTime - startTime) / (deadlineTime - startTime)) * 100;
        return percentage <= 100;
      }).length / lastMonthCompliance.length) * 100
    : 0;

  // Calcular tendencia de alertas
  const lastMonthAtRisk = await db.requestAssignment.count({
    where: {
      tenantId,
      slaStart: { not: null },
      slaDeadline: { not: null },
      assignmentDate: {
        gte: lastMonthStart,
        lt: lastMonthEnd,
      },
      isActive: true,
    },
  });

  const lastMonthOverdue = await db.requestAssignment.count({
    where: {
      tenantId,
      slaDeadline: { lt: lastMonthEnd },
      slaEnd: null,
      isActive: true,
    },
  });

  // Función para calcular tendencias
  const calculateTrend = (current: number, previous: number) => {
    if (previous === 0) return { value: 0, isPositive: true };
    const change = ((current - previous) / previous) * 100;
    return { value: Math.abs(change), isPositive: change >= 0 };
  };

  // Calcular datos de tendencia mensual
  const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'];
  const trendData = [];

  for (let i = 5; i >= 0; i--) {
    const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
    
    const monthAssignments = await db.requestAssignment.findMany({
      where: {
        tenantId,
        slaStart: { not: null },
        slaDeadline: { not: null },
        assignmentDate: {
          gte: monthStart,
          lte: monthEnd,
        },
        isActive: true,
      },
      select: {
        slaStart: true,
        slaDeadline: true,
        slaEnd: true,
      },
    });

    const monthComplianceCount = monthAssignments.filter(a => {
      if (!a.slaStart || !a.slaDeadline) return false;
      const isCompleted = !!a.slaEnd;
      if (!isCompleted) return false;
      const startTime = new Date(a.slaStart).getTime();
      const deadlineTime = new Date(a.slaDeadline).getTime();
      const endDate = a.slaEnd ? new Date(a.slaEnd) : null;
      if (!endDate) return false;
      const endTime = endDate.getTime();
      const percentage = ((endTime - startTime) / (deadlineTime - startTime)) * 100;
      return percentage <= 100;
    }).length;

    const monthCompliance = monthAssignments.length > 0 ? (monthComplianceCount / monthAssignments.length) * 100 : 0;

    trendData.push({
      name: months[i],
      cumplimiento: monthCompliance,
      promedio: 85,
      solicitudes: monthAssignments.length,
    });
  }

  // Calcular tendencia de tiempo de resolución (mes anterior)
  const lastMonthCompletedStart = subDays(now, 60);
  const lastMonthCompletedEnd = subDays(now, 30);
  
  const lastMonthCompletedAssignments = await db.requestAssignment.findMany({
    where: {
      ...baseWhere,
      slaEnd: { not: null },
      assignmentDate: {
        gte: lastMonthCompletedStart,
        lte: lastMonthCompletedEnd,
      },
    },
    select: {
      slaStart: true,
      slaEnd: true,
    },
  });

  const lastMonthAvgResolution = lastMonthCompletedAssignments.length > 0
    ? lastMonthCompletedAssignments.reduce((sum, a) => {
        if (!a.slaStart || !a.slaEnd) return sum;
        const start = new Date(a.slaStart).getTime();
        const end = new Date(a.slaEnd).getTime();
        return sum + (end - start) / (1000 * 60 * 60 * 24);
      }, 0) / lastMonthCompletedAssignments.length
    : 0;

  return {
    compliance: compliancePercentage,
    avgResolutionTime,
    atRisk,
    overdue,
    slaPieData,
    slaWorkflowData,
    slaHourlyChartData,
    slaDeptData,
    bestWorkflow: {
      name: bestWorkflow,
      compliance: bestCompliance,
    },
    avgSlaHours: avgSlaHours.toFixed(0),
    alerts: slaAlerts,
    avgTimeByType: avgTimeByTypeData,
    trendData: trendData,
    trends: {
      complianceTrend: { ...calculateTrend(compliancePercentage, lastMonthCompliancePercentage), text: 'vs. mes anterior' },
      resolutionTimeTrend: { ...calculateTrend(avgResolutionTime, lastMonthAvgResolution), text: 'vs. mes anterior' },
      atRiskTrend: { ...calculateTrend(atRisk, lastMonthAtRisk), text: 'vs. mes anterior' },
      overdueTrend: { ...calculateTrend(overdue, lastMonthOverdue), text: 'vs. mes anterior' },
    },
  };
}
