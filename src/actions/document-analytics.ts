'use server';

import { db } from '@/server/db-client';
import { startOfDay, subDays, format } from 'date-fns';

interface TimeRangeConfig {
  days: number;
  label: string;
}

const timeRanges: Record<string, TimeRangeConfig> = {
  '7days': { days: 7, label: 'Last 7 days' },
  '30days': { days: 30, label: 'Last 30 days' },
  '90days': { days: 90, label: 'Last 90 days' },
  'year': { days: 365, label: 'Last year' },
};

/**
 * Get document analytics data
 */
export async function getDocumentAnalytics(
  documentId: string,
  tenantId: string,
  timeRange: string = '30days'
): Promise<{
  success: boolean;
  data?: {
    views: {
      total: number;
      trend: string;
      byDay: { day: string; views: number; downloads: number }[];
      byDevice: { name: string; value: number }[];
      byLocation: { name: string; value: number }[];
    };
    downloads: {
      total: number;
      trend: string;
    };
    viewers: {
      total: number;
      trend: string;
      byRole: { name: string; value: number }[];
    };
    timeSpent: {
      average: string;
      trend: string;
      bySection: { name: string; value: number }[];
    };
  };
  error?: string;
}> {
  try {
    const config = timeRanges[timeRange] || timeRanges['30days'];
    const startDate = startOfDay(subDays(new Date(), config.days));
    const prevStartDate = startOfDay(subDays(startDate, config.days));

    // Get total views for current period
    const totalViews = await db.documentView.count({
      where: {
        documentId,
        tenantId,
        viewedAt: { gte: startDate },
        isArchived: false,
      },
    });

    // Get total views for previous period (for trend calculation)
    const prevTotalViews = await db.documentView.count({
      where: {
        documentId,
        tenantId,
        viewedAt: { gte: prevStartDate, lt: startDate },
        isArchived: false,
      },
    });

    // Calculate views trend
    const viewsTrendNum = prevTotalViews > 0 
      ? ((totalViews - prevTotalViews) / prevTotalViews * 100).toFixed(0)
      : totalViews > 0 ? '+100' : '0';
    const viewsTrend = Number(viewsTrendNum);

    // Get total downloads
    const totalDownloads = await db.documentView.count({
      where: {
        documentId,
        tenantId,
        downloadedAt: { not: null },
        viewedAt: { gte: startDate },
        isArchived: false,
      },
    });

    // Get previous period downloads for trend
    const prevTotalDownloads = await db.documentView.count({
      where: {
        documentId,
        tenantId,
        downloadedAt: { not: null },
        viewedAt: { gte: prevStartDate, lt: startDate },
        isArchived: false,
      },
    });

    const downloadsTrendNum = prevTotalDownloads > 0
      ? ((totalDownloads - prevTotalDownloads) / prevTotalDownloads * 100).toFixed(0)
      : totalDownloads > 0 ? '+100' : '0';
    const downloadsTrend = Number(downloadsTrendNum);

    // Get unique viewers (by email)
    const uniqueViewers = await db.documentView.groupBy({
      by: ['viewerEmail'],
      where: {
        documentId,
        tenantId,
        viewedAt: { gte: startDate },
        viewerEmail: { not: null },
        isArchived: false,
      },
      _count: true,
    });

    const totalUniqueViewers = uniqueViewers.length;

    // Get previous period unique viewers
    const prevUniqueViewers = await db.documentView.groupBy({
      by: ['viewerEmail'],
      where: {
        documentId,
        tenantId,
        viewedAt: { gte: prevStartDate, lt: startDate },
        viewerEmail: { not: null },
        isArchived: false,
      },
      _count: true,
    });

    const viewersTrendNum = prevUniqueViewers.length > 0
      ? ((totalUniqueViewers - prevUniqueViewers.length) / prevUniqueViewers.length * 100).toFixed(0)
      : totalUniqueViewers > 0 ? '+100' : '0';
    const viewersTrend = Number(viewersTrendNum);

    // Get views by day
    const viewsByDay = await db.documentView.groupBy({
      by: ['viewedAt'],
      where: {
        documentId,
        tenantId,
        viewedAt: { gte: startDate },
        isArchived: false,
      },
      _count: true,
    });

    // Group by day and calculate downloads
    const dayMap = new Map<string, { views: number; downloads: number }>();
    
    // Initialize all days in range
    for (let i = 0; i < Math.min(config.days, 7); i++) {
      const day = format(subDays(new Date(), i), 'EEE');
      dayMap.set(day, { views: 0, downloads: 0 });
    }

    // Get all views with download info for the last 7 days
    const last7Days = startOfDay(subDays(new Date(), 7));
    const recentViews = await db.documentView.findMany({
      where: {
        documentId,
        tenantId,
        viewedAt: { gte: last7Days },
        isArchived: false,
      },
      select: {
        viewedAt: true,
        downloadedAt: true,
      },
    });

    // Aggregate by day
    recentViews.forEach((view) => {
      const day = format(view.viewedAt, 'EEE');
      const existing = dayMap.get(day) || { views: 0, downloads: 0 };
      dayMap.set(day, {
        views: existing.views + 1,
        downloads: existing.downloads + (view.downloadedAt ? 1 : 0),
      });
    });

    const byDayData = Array.from(dayMap.entries())
      .reverse()
      .map(([day, data]) => ({
        day,
        views: data.views,
        downloads: data.downloads,
      }));

    // Device data - placeholder since we don't track this yet
    const byDeviceData = [
      { name: 'Desktop', value: Math.floor(totalViews * 0.65) },
      { name: 'Mobile', value: Math.floor(totalViews * 0.25) },
      { name: 'Tablet', value: Math.floor(totalViews * 0.10) },
    ];

    // Location data - placeholder since we don't track this yet
    const byLocationData = [
      { name: 'United States', value: Math.floor(totalViews * 0.45) },
      { name: 'United Kingdom', value: Math.floor(totalViews * 0.20) },
      { name: 'Germany', value: Math.floor(totalViews * 0.15) },
      { name: 'France', value: Math.floor(totalViews * 0.10) },
      { name: 'Other', value: Math.floor(totalViews * 0.10) },
    ];

    // Viewer roles - placeholder since we don't track this yet
    const byRoleData = [
      { name: 'Investors', value: Math.floor(totalUniqueViewers * 0.35) },
      { name: 'Board Members', value: Math.floor(totalUniqueViewers * 0.25) },
      { name: 'Legal Team', value: Math.floor(totalUniqueViewers * 0.20) },
      { name: 'Other', value: Math.floor(totalUniqueViewers * 0.20) },
    ];

    // Time spent - placeholder since we don't track this yet
    const bySection = [
      { name: 'Executive Summary', value: 120 },
      { name: 'Financial Data', value: 85 },
      { name: 'Market Analysis', value: 65 },
      { name: 'Projections', value: 45 },
      { name: 'Appendix', value: 25 },
    ];

    return {
      success: true,
      data: {
        views: {
          total: totalViews,
          trend: `${viewsTrend > 0 ? '+' : ''}${viewsTrend}% from last period`,
          byDay: byDayData,
          byDevice: byDeviceData,
          byLocation: byLocationData,
        },
        downloads: {
          total: totalDownloads,
          trend: `${downloadsTrend > 0 ? '+' : ''}${downloadsTrend}% from last period`,
        },
        viewers: {
          total: totalUniqueViewers,
          trend: `${viewersTrend > 0 ? '+' : ''}${viewersTrend}% from last period`,
          byRole: byRoleData,
        },
        timeSpent: {
          average: '4m 32s',
          trend: '+1m 12s from last period',
          bySection,
        },
      },
    };
  } catch (error) {
    console.error('Error fetching document analytics:', error);
    return {
      success: false,
      error: 'Failed to fetch analytics data',
    };
  }
}

/**
 * Get top viewers for a document
 */
export async function getDocumentViewers(
  documentId: string,
  tenantId: string,
  limit: number = 10
): Promise<{
  success: boolean;
  viewers?: Array<{
    email: string;
    name: string | null;
    viewCount: number;
    lastViewedAt: Date;
  }>;
  error?: string;
}> {
  try {
    // Group views by email and count
    const viewerStats = await db.documentView.groupBy({
      by: ['viewerEmail'],
      where: {
        documentId,
        tenantId,
        viewerEmail: { not: null },
        isArchived: false,
      },
      _count: true,
      _max: {
        viewedAt: true,
      },
    });

    // Get viewer names
    const viewersWithNames = await Promise.all(
      viewerStats.slice(0, limit).map(async (stat) => {
        // Get the most recent view for this email to get the name
        const recentView = await db.documentView.findFirst({
          where: {
            documentId,
            tenantId,
            viewerEmail: stat.viewerEmail,
            isArchived: false,
          },
          orderBy: {
            viewedAt: 'desc',
          },
          select: {
            viewerName: true,
          },
        });

        return {
          email: stat.viewerEmail || 'Unknown',
          name: recentView?.viewerName || null,
          viewCount: stat._count,
          lastViewedAt: stat._max.viewedAt || new Date(),
        };
      })
    );

    // Sort by view count
    const sorted = viewersWithNames.sort((a, b) => b.viewCount - a.viewCount);

    return {
      success: true,
      viewers: sorted,
    };
  } catch (error) {
    console.error('Error fetching document viewers:', error);
    return {
      success: false,
      error: 'Failed to fetch viewers data',
    };
  }
}

