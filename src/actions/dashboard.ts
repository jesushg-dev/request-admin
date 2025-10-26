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

export async function getDashboardMetrics(tenantId: string, workflowId?: string | null) {
  const now = new Date();
  const lastMonth = subDays(now, 30);
  
  // Build where condition for request assignments based on workflow
  const assignmentWhere: any = {
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
  const requestWhere: any = { tenantId };
  
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

export async function getWorkflowStatsByMonth(tenantId: string, months: number = 6, workflowId?: string | null) {
  const now = new Date();
  const startDate = new Date(now.getFullYear(), now.getMonth() - months + 1, 1);
  
  // Build where condition based on workflow
  const whereCondition: any = {
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
  const workflowWhereCondition: any = {
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

export async function getRecentRequests(tenantId: string, workflowFilter?: string | null, limit: number = 10) {
  const whereCondition: any = {
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
