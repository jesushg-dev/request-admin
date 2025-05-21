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
