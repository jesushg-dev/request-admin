'use server';

import { STATUS } from '@/constants/requests';
import { db } from '@/server/db-client';

interface ReportFilters {
  dateRange?: {
    from: Date;
    to: Date;
  };
  areas?: string[];
  statuses?: string[];
  priorities?: string[];
}

export async function getOverviewReport(tenantId: string, filters?: ReportFilters) {
  const whereClause = buildWhereClause(tenantId, filters);

  const totalRequests = await db.request.count({
    where: whereClause,
  });

  const openRequests = await db.request.count({
    where: {
      ...whereClause,
      requestAssignments: {
        some: {
          status: {
            type: { in: [STATUS.INITIAL, STATUS.DEFAULT] },
          },
        },
      },
    },
  });

  const closedRequests = await db.request.count({
    where: {
      ...whereClause,
      closedAt: { not: null },
    },
  });

  const overdueRequests = await db.request.count({
    where: {
      ...whereClause,
      requestAssignments: {
        some: {
          slaDeadline: { lt: new Date() },
          slaEnd: null,
        },
      },
    },
  });

  // Calculate average resolution time
  const resolvedRequests = await db.requestAssignment.findMany({
    select: { slaStart: true, slaEnd: true },
    where: {
      ...(whereClause as any),
      slaStart: { not: null },
      slaEnd: { not: null },
    },
  });

  const avgResolutionTime =
    resolvedRequests.length > 0
      ? Number.parseFloat(
          (
            resolvedRequests.reduce((acc, req) => {
              return acc + (new Date(req.slaEnd!).getTime() - new Date(req.slaStart!).getTime()) / (1000 * 60 * 60 * 24);
            }, 0) / resolvedRequests.length
          ).toFixed(1)
        )
      : 0;

  return {
    totalRequests,
    openRequests,
    closedRequests,
    overdueRequests,
    avgResolutionTime,
  };
}

export async function getMonthlyTrends(tenantId: string, filters?: ReportFilters) {
  const whereClause = buildWhereClause(tenantId, filters);

  const monthlyData = await db.requestAssignment.groupBy({
    by: ['createdAt'],
    where: whereClause,
    _count: {
      id: true,
    },
    orderBy: {
      createdAt: 'asc',
    },
  });

  // Group by month
  const monthlyCounts = monthlyData.reduce(
    (acc, item) => {
      const month = item.createdAt.toISOString().slice(0, 7); // YYYY-MM
      if (!acc[month]) {
        acc[month] = 0;
      }
      acc[month] += item._count.id;
      return acc;
    },
    {} as Record<string, number>
  );

  return Object.entries(monthlyCounts).map(([month, count]) => ({
    month,
    count,
  }));
}

export async function getAreaDistribution(tenantId: string, filters?: ReportFilters) {
  const whereClause = buildWhereClause(tenantId, filters);

  const areaData = await db.requestAssignment.groupBy({
    by: ['areaId'],
    where: whereClause,
    _count: {
      id: true,
    },
    orderBy: {
      _count: {
        id: 'desc',
      },
    },
  });

  const areas = await db.area.findMany({
    where: { tenantId },
    select: { id: true, name: true },
  });

  const areaMap = new Map(areas.map((a) => [a.id, a.name]));

  return areaData
    .map((item) => ({
      name: areaMap.get(item.areaId) || 'Desconocido',
      value: item._count.id,
    }))
    .filter((item) => item.value > 0);
}

export async function getStatusDistribution(tenantId: string, filters?: ReportFilters) {
  const whereClause = buildWhereClause(tenantId, filters);

  const statusData = await db.requestAssignment.groupBy({
    by: ['statusId'],
    where: whereClause,
    _count: {
      id: true,
    },
    orderBy: {
      _count: {
        id: 'desc',
      },
    },
  });

  const statuses = await db.requestWorkflowStatus.findMany({
    where: { tenantId },
    select: { id: true, name: true, color: true },
  });

  const statusMap = new Map(statuses.map((s) => [s.id, s]));

  return statusData.map((item) => {
    const status = statusMap.get(item.statusId);
    return {
      name: status?.name || 'Desconocido',
      value: item._count.id,
      color: status?.color || '#6b7280',
    };
  });
}

export async function getAverageResolutionTime(tenantId: string, filters?: ReportFilters) {
  const whereClause = buildWhereClause(tenantId, filters);

  // Get all assignments grouped by area
  const areaData = await db.requestAssignment.groupBy({
    by: ['areaId'],
    where: {
      ...whereClause,
      slaStart: { not: null },
      slaEnd: { not: null },
    },
    _count: {
      id: true,
    },
  });

  const areas = await db.area.findMany({
    where: { tenantId },
    select: { id: true, name: true },
  });

  const areaMap = new Map(areas.map((a) => [a.id, a.name]));

  // Calculate average resolution time for each area
  const result = await Promise.all(
    areaData.map(async (item) => {
      const assignments = await db.requestAssignment.findMany({
        where: {
          ...whereClause,
          areaId: item.areaId,
          slaStart: { not: null },
          slaEnd: { not: null },
        },
        select: {
          slaStart: true,
          slaEnd: true,
        },
      });

      if (assignments.length === 0) return null;

      const totalDays = assignments.reduce((acc, assignment) => {
        const diffTime = new Date(assignment.slaEnd!).getTime() - new Date(assignment.slaStart!).getTime();
        return acc + diffTime / (1000 * 60 * 60 * 24);
      }, 0);

      const avgTime = totalDays / assignments.length;

      return {
        name: areaMap.get(item.areaId) || 'Desconocido',
        tiempo: Number.parseFloat(avgTime.toFixed(1)),
      };
    })
  );

  return result.filter((item): item is { name: string; tiempo: number } => item !== null);
}

export async function getSLACompliance(tenantId: string, filters?: ReportFilters) {
  const whereClause = buildWhereClause(tenantId, filters);

  // Get all assignments with SLA
  const assignments = await db.requestAssignment.findMany({
    where: {
      ...whereClause,
      slaStart: { not: null },
    },
    select: {
      id: true,
      slaStart: true,
      slaDeadline: true,
      slaEnd: true,
      createdAt: true,
    },
  });

  const monthlyData = assignments.reduce(
    (acc, assignment) => {
      const month = assignment.createdAt.toISOString().slice(0, 7);
      if (!acc[month]) {
        acc[month] = { total: 0, compliant: 0 };
      }
      acc[month].total++;
      if (assignment.slaEnd && assignment.slaDeadline) {
        if (new Date(assignment.slaEnd) <= new Date(assignment.slaDeadline)) {
          acc[month].compliant++;
        }
      }
      return acc;
    },
    {} as Record<string, { total: number; compliant: number }>
  );

  return Object.entries(monthlyData).map(([month, data]) => ({
    name: month.slice(5, 7), // Get month (MM)
    cumplimiento: data.total > 0 ? Number.parseInt(((data.compliant / data.total) * 100).toFixed(0)) : 0,
  }));
}

export async function getWorkflowTypes(tenantId: string) {
  const workflows = await db.requestWorkflow.findMany({
    where: {
      tenantId,
      isActive: true,
    },
    select: {
      id: true,
      name: true,
    },
    orderBy: {
      name: 'asc',
    },
  });

  return workflows;
}

export async function getAreas(tenantId: string) {
  const areas = await db.area.findMany({
    where: {
      tenantId,
      isActive: true,
    },
    select: {
      id: true,
      name: true,
    },
    orderBy: {
      name: 'asc',
    },
  });

  return areas;
}

export async function getStatuses(tenantId: string) {
  const statuses = await db.requestWorkflowStatus.findMany({
    where: {
      tenantId,
      isActive: true,
    },
    select: {
      id: true,
      name: true,
      color: true,
      type: true,
    },
    orderBy: {
      name: 'asc',
    },
  });

  return statuses;
}

export async function getPriorities(tenantId: string) {
  const priorities = await db.requestPriorityType.findMany({
    where: {
      tenantId,
      isActive: true,
    },
    select: {
      id: true,
      name: true,
    },
    orderBy: {
      level: 'asc',
    },
  });

  return priorities;
}

export async function getWorkflowDistribution(tenantId: string, filters?: ReportFilters) {
  const whereClause = buildWhereClause(tenantId, filters);

  // Get status distribution from assignments
  const statusData = await db.requestAssignment.groupBy({
    by: ['statusId'],
    where: whereClause,
    _count: {
      id: true,
    },
    orderBy: {
      _count: {
        id: 'desc',
      },
    },
  });

  // Get all statuses with their workflows
  const statuses = await db.requestWorkflowStatus.findMany({
    where: { tenantId },
    select: {
      id: true,
      name: true,
      color: true,
      type: true,
    },
  });

  const statusMap = new Map(statuses.map((s) => [s.id, s]));

  return statusData
    .filter((item) => {
      const status = statusMap.get(item.statusId);
      return status && ['initial', 'default', 'final'].includes(status.type);
    })
    .map((item) => {
      const status = statusMap.get(item.statusId);
      return {
        name: status?.name || 'Desconocido',
        value: item._count.id,
        color: status?.color || '#6b7280',
      };
    });
}

interface AlertData {
  id: string;
  requestId: string;
  statusName: string;
  type: 'critical' | 'warning' | 'info';
  message: string;
  daysInStatus: number;
}

export async function getAlerts(tenantId: string, filters?: ReportFilters) {
  const now = new Date();
  const whereClause = buildWhereClause(tenantId, filters);

  // Get all active assignments with status info
  const assignments = await db.requestAssignment.findMany({
    where: {
      ...whereClause,
      isActive: true,
      slaStart: { not: null },
      slaDeadline: { not: null },
    },
    select: {
      id: true,
      requestId: true,
      assignmentDate: true,
      status: {
        select: {
          id: true,
          name: true,
          type: true,
        },
      },
      request: {
        select: {
          issueSubject: true,
        },
      },
      slaStart: true,
      slaDeadline: true,
      slaEnd: true,
      requestCategory: {
        select: {
          name: true,
        },
      },
    },
    orderBy: {
      slaDeadline: 'asc',
    },
    take: 100,
  });

  const alerts: AlertData[] = [];

  for (const assignment of assignments) {
    if (!assignment.slaStart || !assignment.slaDeadline) continue;

    const startTime = new Date(assignment.slaStart).getTime();
    const deadlineTime = new Date(assignment.slaDeadline).getTime();
    const currentTime = now.getTime();

    const isCompleted = !!assignment.slaEnd;
    const isOverdue = !isCompleted && currentTime > deadlineTime;

    // Calculate percentage of SLA
    const totalTime = deadlineTime - startTime;
    const elapsed = isCompleted && assignment.slaEnd
      ? new Date(assignment.slaEnd).getTime() - startTime
      : currentTime - startTime;
    const percentage = (elapsed / totalTime) * 100;

    // Days in current status
    const daysInStatus = Math.floor((currentTime - new Date(assignment.assignmentDate).getTime()) / (1000 * 60 * 60 * 24));

    if (isOverdue) {
      const hoursOverdue = (currentTime - deadlineTime) / (1000 * 60 * 60);
      alerts.push({
        id: assignment.id,
        requestId: assignment.requestId,
        statusName: assignment.status.name,
        type: 'critical',
        message: `${assignment.request.issueSubject} vencido hace ${hoursOverdue.toFixed(0)} horas (${percentage.toFixed(0)}% del SLA)`,
        daysInStatus,
      });
    } else if (percentage >= 75 && !isCompleted) {
      const timeRemaining = deadlineTime - currentTime;
      const hoursRemaining = timeRemaining / (1000 * 60 * 60);
      alerts.push({
        id: assignment.id,
        requestId: assignment.requestId,
        statusName: assignment.status.name,
        type: 'warning',
        message: `${assignment.request.issueSubject} vence en ${hoursRemaining.toFixed(0)} horas (${percentage.toFixed(0)}% del SLA)`,
        daysInStatus,
      });
    }
  }

  // Group alerts by status and count
  const statusGroups = new Map<string, { count: number; alerts: AlertData[] }>();

  alerts.forEach((alert) => {
    if (!statusGroups.has(alert.statusName)) {
      statusGroups.set(alert.statusName, { count: 0, alerts: [] });
    }
    const group = statusGroups.get(alert.statusName)!;
    group.count++;
    group.alerts.push(alert);
  });

  // Create summary alerts
  const summaryAlerts: { type: string; count: number; statusName: string; alerts: AlertData[] }[] = [];

  statusGroups.forEach((data, statusName) => {
    const criticalCount = data.alerts.filter(a => a.type === 'critical').length;
    const warningCount = data.alerts.filter(a => a.type === 'warning').length;

    if (criticalCount > 0) {
      const avgDays = data.alerts
        .filter(a => a.type === 'critical')
        .reduce((sum, a) => sum + a.daysInStatus, 0) / criticalCount;
      summaryAlerts.push({
        type: 'critical',
        count: criticalCount,
        statusName,
        alerts: data.alerts.filter(a => a.type === 'critical'),
      });
    }

    if (warningCount > 0) {
      const avgDays = data.alerts
        .filter(a => a.type === 'warning')
        .reduce((sum, a) => sum + a.daysInStatus, 0) / warningCount;
      summaryAlerts.push({
        type: 'warning',
        count: warningCount,
        statusName,
        alerts: data.alerts.filter(a => a.type === 'warning'),
      });
    }
  });

  return summaryAlerts.sort((a, b) => {
    if (a.type === 'critical' && b.type !== 'critical') return -1;
    if (a.type !== 'critical' && b.type === 'critical') return 1;
    return b.count - a.count;
  });
}

export interface ExecutionFlowInfo {
  id: string;
  name: string;
  categoryName?: string;
  version: number;
  nodeCount: number;
  edgeCount: number;
  executionCount: number;
  successRate: number;
  avgCompletionTime: number;
}

export interface ExecutionStep {
  id: string;
  name: string;
  avgTime: number;
  compliance: number;
}

export async function getExecutionFlows(tenantId: string) {
  // Get all execution flows with their categories
  const flows = await db.executionFlowDefinition.findMany({
    where: {
      tenantId,
      isActive: true,
    },
    select: {
      id: true,
      version: true,
      requestCategory: {
        select: {
          name: true,
        },
      },
      _count: {
        select: {
          nodes: true,
          edges: true,
          executions: true,
        },
      },
    },
  });

  // Get execution statistics
  const flowsWithStats = await Promise.all(
    flows.map(async (flow) => {
      // Get all executions for this flow
      const executions = await db.executionModelInstance.findMany({
        where: {
          flowId: flow.id,
          tenantId,
        },
        select: {
          id: true,
          status: true,
          createdAt: true,
          logs: {
            select: {
              timestamp: true,
              node: {
                select: {
                  type: true,
                },
              },
            },
            orderBy: {
              timestamp: 'asc',
            },
          },
        },
      });

      // Calculate success rate (completed vs total)
      const completed = executions.filter((e) => e.status === 'completed').length;
      const successRate = executions.length > 0 ? (completed / executions.length) * 100 : 0;

      // Calculate average completion time
      let avgCompletionTime = 0;
      if (executions.length > 0) {
        const completionTimes = executions
          .filter((e) => e.status === 'completed' && e.logs.length > 0)
          .map((e) => {
            const startTime = e.createdAt.getTime();
            const endTime = e.logs.length > 0 ? e.logs[e.logs.length - 1].timestamp.getTime() : startTime;
            return (endTime - startTime) / (1000 * 60 * 60 * 24); // Convert to days
          })
          .filter((t) => t > 0);
        avgCompletionTime =
          completionTimes.length > 0 ? completionTimes.reduce((a, b) => a + b, 0) / completionTimes.length : 0;
      }

      return {
        id: flow.id,
        name: flow.requestCategory?.name || 'Sin categoría',
        categoryName: flow.requestCategory?.name || 'Sin categoría',
        version: flow.version,
        nodeCount: flow._count.nodes,
        edgeCount: flow._count.edges,
        executionCount: flow._count.executions,
        successRate: Number(successRate.toFixed(1)),
        avgCompletionTime: Number(avgCompletionTime.toFixed(1)),
      };
    })
  );

  return flowsWithStats;
}

export async function getExecutionFlowDetails(tenantId: string, flowId: string) {
  const flow = await db.executionFlowDefinition.findUnique({
    where: {
      id: flowId,
      tenantId,
    },
    select: {
      id: true,
      version: true,
      nodes: {
        select: {
          id: true,
          type: true,
          config: true,
        },
      },
      edges: true,
      requestCategory: {
        select: {
          name: true,
        },
      },
      executions: {
        select: {
          id: true,
          status: true,
          createdAt: true,
          logs: {
            select: {
              timestamp: true,
              node: {
                select: {
                  id: true,
                  type: true,
                  config: true,
                },
              },
              eventType: true,
              outcome: true,
            },
            orderBy: {
              timestamp: 'asc',
            },
          },
        },
        take: 100,
      },
    },
  });

  if (!flow) {
    return null;
  }

  // Calculate step statistics
  const steps: ExecutionStep[] = [];
  const nodeTypeCounts = new Map<string, number>();
  const nodeTypeCompliance = new Map<string, number[]>();

  flow.executions.forEach((execution) => {
    if (execution.status === 'completed' && execution.logs.length > 0) {
      const startTime = execution.createdAt.getTime();
      const endTime = execution.logs[execution.logs.length - 1].timestamp.getTime();
      const totalTime = (endTime - startTime) / (1000 * 60 * 60 * 24); // days

      flow.nodes.forEach((node) => {
        const nodeLogs = execution.logs.filter((log) => log.node.id === node.id);
        if (nodeLogs.length > 0) {
          const nodeTime = (nodeLogs[nodeLogs.length - 1].timestamp.getTime() - nodeLogs[0].timestamp.getTime()) / (1000 * 60 * 60 * 24);
          nodeTypeCounts.set(node.id, (nodeTypeCounts.get(node.id) || 0) + 1);
          if (!nodeTypeCompliance.has(node.id)) {
            nodeTypeCompliance.set(node.id, []);
          }
          nodeTypeCompliance.get(node.id)!.push(nodeLogs.filter((log) => log.outcome === 'success').length / nodeLogs.length);
        }
      });
    }
  });

  // Create steps from nodes
  flow.nodes.forEach((node) => {
    const count = nodeTypeCounts.get(node.id) || 0;
    const complianceArray = nodeTypeCompliance.get(node.id) || [];
    const avgCompliance = complianceArray.length > 0 
      ? (complianceArray.reduce<number>((a, b) => Number(a) + Number(b), 0) / complianceArray.length) * 100 
      : 0;
    const avgTime = count > 0 ? 0.5 : 0;

    try {
      const config = JSON.parse(node.config);
      steps.push({
        id: node.id,
        name: config.label || config.name || node.type,
        avgTime,
        compliance: Number(avgCompliance.toFixed(1)),
      });
    } catch {
      steps.push({
        id: node.id,
        name: node.type,
        avgTime,
        compliance: Number(avgCompliance.toFixed(1)),
      });
    }
  });

  return {
    flow,
    steps,
  };
}

function buildWhereClause(tenantId: string, filters?: ReportFilters) {
  const baseWhere: any = {
    tenantId,
  };

  if (filters?.dateRange) {
    baseWhere.createdAt = {
      gte: filters.dateRange.from,
      lte: filters.dateRange.to,
    };
  }

  if (filters?.areas && filters.areas.length > 0) {
    baseWhere.areaId = { in: filters.areas };
  }

  if (filters?.statuses && filters.statuses.length > 0) {
    baseWhere.statusId = { in: filters.statuses };
  }

  if (filters?.priorities && filters.priorities.length > 0) {
    baseWhere.priorityId = { in: filters.priorities };
  }

  return baseWhere;
}

