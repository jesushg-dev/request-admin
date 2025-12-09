'use client';

import { useEffect, useState } from 'react';
import { Calendar, Clock, Download, Eye, FileText, Globe, Map, Users } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';

import { getDocumentAnalytics, getDocumentViewers } from '@/actions/document-analytics';
import { DocumentWithRelations } from '@/types/zenstackhq/document';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Helper function to download file
const downloadFile = (content: string, filename: string, type: string) => {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

interface DocumentAnalyticsProps {
  documentId: string;
  document: DocumentWithRelations;
  tenantId: string;
}

export function DocumentAnalytics({ documentId, document, tenantId }: DocumentAnalyticsProps) {
  const t = useTranslations('admin.document.view.analytics');
  const [isLoading, setIsLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState<{
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
  } | null>(null);
  const [topViewers, setTopViewers] = useState<Array<{
    email: string;
    name: string | null;
    viewCount: number;
    lastViewedAt: Date;
  }>>([]);
  const [timeRange, setTimeRange] = useState('30days');

  useEffect(() => {
    const fetchAnalytics = async () => {
      setIsLoading(true);
      try {
        const [analyticsResult, viewersResult] = await Promise.all([
          getDocumentAnalytics(documentId, tenantId, timeRange),
          getDocumentViewers(documentId, tenantId, 10),
        ]);
        
        if (analyticsResult.success && analyticsResult.data) {
          setAnalyticsData(analyticsResult.data);
        } else {
          toast.error(analyticsResult.error || t('error'));
        }

        if (viewersResult.success && viewersResult.viewers) {
          setTopViewers(viewersResult.viewers);
        }
      } catch (error) {
        console.error('Error fetching analytics:', error);
        toast.error(t('error'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalytics();
  }, [documentId, tenantId, timeRange, t]);

  // Colors for charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  // Helper to get initials from name or email
  const getInitials = (name: string | null, email: string): string => {
    if (name) {
      return name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    return email.slice(0, 2).toUpperCase();
  };

  // Export to CSV
  const exportToCSV = () => {
    if (!analyticsData) return;

    try {
      const csvContent = [
        // Header
        ['Document Analytics Report'],
        ['Document Name', document.name],
        ['Time Range', timeRange],
        ['Generated', new Date().toLocaleString()],
        [],
        // Summary
        ['Summary'],
        ['Metric', 'Value', 'Trend'],
        ['Total Views', analyticsData.views.total.toString(), analyticsData.views.trend],
        ['Total Downloads', analyticsData.downloads.total.toString(), analyticsData.downloads.trend],
        ['Unique Viewers', analyticsData.viewers.total.toString(), analyticsData.viewers.trend],
        [],
        // Views by Day
        ['Views by Day'],
        ['Day', 'Views', 'Downloads'],
        ...analyticsData.views.byDay.map((day) => [day.day, day.views.toString(), day.downloads.toString()]),
        [],
        // Device Breakdown
        ['Device Breakdown'],
        ['Device', 'Count'],
        ...analyticsData.views.byDevice.map((device) => [device.name, device.value.toString()]),
        [],
        // Geographic Distribution
        ['Geographic Distribution'],
        ['Location', 'Count'],
        ...analyticsData.views.byLocation.map((location) => [location.name, location.value.toString()]),
        [],
        // Top Viewers
        ['Top Viewers'],
        ['Email', 'Name', 'View Count'],
        ...topViewers.map((viewer) => [
          viewer.email,
          viewer.name || 'N/A',
          viewer.viewCount.toString(),
        ]),
      ]
        .map((row) => row.map((cell) => `"${cell}"`).join(','))
        .join('\n');

      const filename = `${document.name}-analytics-${new Date().toISOString().split('T')[0]}.csv`;
      downloadFile(csvContent, filename, 'text/csv;charset=utf-8;');
      toast.success(t('export.exportCsv') + ' - Success');
    } catch (error) {
      console.error('Error exporting to CSV:', error);
      toast.error('Failed to export CSV');
    }
  };

  // Export to PDF (using print functionality)
  const exportToPDF = () => {
    if (!analyticsData) return;

    try {
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        toast.error('Please allow pop-ups to export PDF');
        return;
      }

      const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${document.name} - Analytics Report</title>
  <style>
    @media print {
      body { margin: 0; }
      @page { margin: 2cm; }
    }
    body {
      font-family: Arial, sans-serif;
      padding: 20px;
      color: #333;
    }
    h1 {
      color: #1a1a1a;
      border-bottom: 3px solid #0088FE;
      padding-bottom: 10px;
      margin-bottom: 20px;
    }
    h2 {
      color: #0088FE;
      margin-top: 30px;
      margin-bottom: 15px;
      border-bottom: 1px solid #e5e7eb;
      padding-bottom: 8px;
    }
    .summary {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 20px;
      margin: 20px 0;
    }
    .metric-card {
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      padding: 15px;
      background: #f9fafb;
    }
    .metric-title {
      font-size: 12px;
      color: #6b7280;
      margin-bottom: 8px;
    }
    .metric-value {
      font-size: 28px;
      font-weight: bold;
      color: #1a1a1a;
      margin-bottom: 4px;
    }
    .metric-trend {
      font-size: 11px;
      color: #6b7280;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 15px 0;
    }
    th {
      background: #f3f4f6;
      padding: 12px;
      text-align: left;
      font-weight: 600;
      border-bottom: 2px solid #e5e7eb;
    }
    td {
      padding: 10px 12px;
      border-bottom: 1px solid #e5e7eb;
    }
    tr:hover {
      background: #f9fafb;
    }
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #e5e7eb;
      text-align: center;
      color: #6b7280;
      font-size: 12px;
    }
  </style>
</head>
<body>
  <h1>📊 ${document.name} - Analytics Report</h1>
  <p><strong>Time Range:</strong> ${timeRange} | <strong>Generated:</strong> ${new Date().toLocaleString()}</p>
  
  <div class="summary">
    <div class="metric-card">
      <div class="metric-title">👁 Total Views</div>
      <div class="metric-value">${analyticsData.views.total}</div>
      <div class="metric-trend">${analyticsData.views.trend}</div>
    </div>
    <div class="metric-card">
      <div class="metric-title">⬇️ Total Downloads</div>
      <div class="metric-value">${analyticsData.downloads.total}</div>
      <div class="metric-trend">${analyticsData.downloads.trend}</div>
    </div>
    <div class="metric-card">
      <div class="metric-title">👥 Unique Viewers</div>
      <div class="metric-value">${analyticsData.viewers.total}</div>
      <div class="metric-trend">${analyticsData.viewers.trend}</div>
    </div>
  </div>

  <h2>Views by Day</h2>
  <table>
    <thead>
      <tr>
        <th>Day</th>
        <th>Views</th>
        <th>Downloads</th>
      </tr>
    </thead>
    <tbody>
      ${analyticsData.views.byDay.map((day) => `
        <tr>
          <td>${day.day}</td>
          <td>${day.views}</td>
          <td>${day.downloads}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>

  <h2>Device Breakdown</h2>
  <table>
    <thead>
      <tr>
        <th>Device</th>
        <th>Count</th>
      </tr>
    </thead>
    <tbody>
      ${analyticsData.views.byDevice.map((device) => `
        <tr>
          <td>${device.name}</td>
          <td>${device.value}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>

  <h2>Geographic Distribution</h2>
  <table>
    <thead>
      <tr>
        <th>Location</th>
        <th>Count</th>
      </tr>
    </thead>
    <tbody>
      ${analyticsData.views.byLocation.map((location) => `
        <tr>
          <td>${location.name}</td>
          <td>${location.value}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>

  <h2>Top Viewers</h2>
  <table>
    <thead>
      <tr>
        <th>Email</th>
        <th>Name</th>
        <th>View Count</th>
      </tr>
    </thead>
    <tbody>
      ${topViewers.map((viewer) => `
        <tr>
          <td>${viewer.email}</td>
          <td>${viewer.name || 'N/A'}</td>
          <td>${viewer.viewCount}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>

  <div class="footer">
    <p>Generated by Document Analytics System - ${new Date().toLocaleString()}</p>
  </div>

  <script>
    window.onload = function() {
      window.print();
      setTimeout(() => window.close(), 500);
    }
  </script>
</body>
</html>`;

      printWindow.document.write(htmlContent);
      printWindow.document.close();
      toast.success(t('export.exportPdf') + ' - Opening print dialog');
    } catch (error) {
      console.error('Error exporting to PDF:', error);
      toast.error('Failed to export PDF');
    }
  };

  if (isLoading || !analyticsData) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold">{t('title')}</h2>
          <div className="h-10 w-32 animate-pulse rounded bg-muted"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded bg-muted"></div>
          ))}
        </div>
        <div className="h-80 animate-pulse rounded bg-muted"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center pb-4 flex-shrink-0">
        <h2 className="text-xl font-bold">{t('title')}</h2>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder={t('selectTimeRange')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7days">{t('last7days')}</SelectItem>
            <SelectItem value="30days">{t('last30days')}</SelectItem>
            <SelectItem value="90days">{t('last90days')}</SelectItem>
            <SelectItem value="year">{t('lastYear')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 space-y-6">

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Eye className="h-4 w-4 mr-2 text-blue-500" />
              {t('totalViews')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.views.total}</div>
            <p className="text-xs text-muted-foreground">{analyticsData.views.trend}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Download className="h-4 w-4 mr-2 text-green-500" />
              {t('totalDownloads')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.downloads.total}</div>
            <p className="text-xs text-muted-foreground">{analyticsData.downloads.trend}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Users className="h-4 w-4 mr-2 text-purple-500" />
              {t('uniqueViewers')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.viewers.total}</div>
            <p className="text-xs text-muted-foreground">{analyticsData.viewers.trend}</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="activity" className="space-y-4">
        <TabsList>
          <TabsTrigger value="activity">{t('tabs.activity')}</TabsTrigger>
          <TabsTrigger value="viewers">{t('tabs.viewers')}</TabsTrigger>
          <TabsTrigger value="engagement">{t('tabs.engagement')}</TabsTrigger>
          <TabsTrigger value="geography">{t('tabs.geography')}</TabsTrigger>
        </TabsList>

        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t('activity.viewsDownloadsOverTime')}</CardTitle>
              <CardDescription>{t('activity.activityDescription')}</CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analyticsData.views.byDay} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="views" fill="#0088FE" name={t('totalViews')} />
                  <Bar dataKey="downloads" fill="#00C49F" name={t('totalDownloads')} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>{t('activity.deviceBreakdown')}</CardTitle>
                <CardDescription>{t('activity.deviceDescription')}</CardDescription>
              </CardHeader>
              <CardContent className="h-64">
                {analyticsData.views.total === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-sm text-muted-foreground">{t('activity.notAvailable')}</p>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={analyticsData.views.byDevice}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${((Number(percent) || 0) * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value">
                        {analyticsData.views.byDevice.map(
                          (
                            entry: {
                              name: string;
                              value: number;
                            },
                            index: number
                          ) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          )
                        )}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t('activity.timeSpentBySection')}</CardTitle>
                <CardDescription>{t('activity.timeSpentDescription')}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center py-8">
                  <p className="text-sm text-muted-foreground">{t('activity.notAvailable')}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="viewers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t('viewers.viewerGroups')}</CardTitle>
              <CardDescription>{t('viewers.viewerGroupsDescription')}</CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              {analyticsData.viewers.total === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <p className="text-sm text-muted-foreground">{t('activity.notAvailable')}</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={analyticsData.viewers.byRole}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      label={({ name, percent }) => `${name}: ${(Number(percent ?? 0) * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value">
                      {analyticsData.viewers.byRole.map(
                        (
                          entry: {
                            name: string;
                            value: number;
                          },
                          index: number
                        ) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        )
                      )}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t('viewers.topViewers')}</CardTitle>
              <CardDescription>{t('viewers.topViewersDescription')}</CardDescription>
            </CardHeader>
            <CardContent>
              {topViewers.length === 0 ? (
                <div className="flex items-center justify-center py-8">
                  <p className="text-sm text-muted-foreground">{t('viewers.noViewers')}</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {topViewers.map((viewer, index) => {
                    const initials = getInitials(viewer.name, viewer.email);
                    const colors = [
                      'bg-blue-100 text-blue-600',
                      'bg-green-100 text-green-600',
                      'bg-purple-100 text-purple-600',
                      'bg-orange-100 text-orange-600',
                      'bg-pink-100 text-pink-600',
                    ];
                    return (
                      <div key={viewer.email} className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                              colors[index % colors.length]
                            }`}>
                            {initials}
                          </div>
                          <div>
                            <div className="font-medium">{viewer.name || viewer.email}</div>
                            {viewer.name && <div className="text-sm text-muted-foreground">{viewer.email}</div>}
                          </div>
                        </div>
                        <Badge>
                          {viewer.viewCount} {t('viewers.views')}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="engagement" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t('engagement.averageTimeSpent')}</CardTitle>
              <CardDescription>{t('engagement.timeSpentDescription')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center py-8">
                <div className="text-center">
                  <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <div className="text-4xl font-bold">{analyticsData.timeSpent.average}</div>
                  <p className="text-sm text-muted-foreground mt-2">{t('engagement.notTracked')}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t('engagement.engagementMetrics')}</CardTitle>
              <CardDescription>{t('engagement.engagementDescription')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center py-8">
                <p className="text-sm text-muted-foreground">{t('engagement.notTracked')}</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="geography" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t('geography.geographicDistribution')}</CardTitle>
              <CardDescription>{t('geography.geographicDescription')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-center items-center py-8">
                <Globe className="h-48 w-48 text-muted-foreground" />
              </div>
              {analyticsData.views.total > 0 && analyticsData.views.byLocation.length > 0 ? (
                <div className="space-y-4 mt-4">
                  {analyticsData.views.byLocation.map(
                    (
                      location: {
                        name: string;
                        value: number;
                      },
                      index: number
                    ) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div
                            className="w-3 h-3 rounded-full mr-2"
                            style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                          <span>{location.name}</span>
                        </div>
                        <div className="flex items-center">
                          <span className="font-medium mr-2">{location.value}</span>
                          <span className="text-xs text-muted-foreground">
                            ({((location.value / analyticsData.views.total) * 100).toFixed(1)}%)
                          </span>
                        </div>
                      </div>
                    )
                  )}
                </div>
              ) : (
                <div className="text-center mt-4">
                  <p className="text-sm text-muted-foreground">{t('geography.notAvailable')}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex justify-center">
            <Button variant="outline" disabled>
              <Map className="mr-2 h-4 w-4" />
              {t('geography.viewDetailedMap')}
            </Button>
          </div>
        </TabsContent>
      </Tabs>

        {/* Export section - always visible below tabs */}
        <div className="pt-6 mt-6 border-t">
          <Card>
            <CardHeader>
              <CardTitle>{t('export.title')}</CardTitle>
              <CardDescription>{t('export.description')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4">
                <Button variant="outline" className="flex-1" onClick={exportToCSV}>
                  <FileText className="mr-2 h-4 w-4" />
                  {t('export.exportCsv')}
                </Button>
                <Button variant="outline" className="flex-1" onClick={exportToPDF}>
                  <FileText className="mr-2 h-4 w-4" />
                  {t('export.exportPdf')}
                </Button>
                <Button variant="outline" className="flex-1" disabled>
                  <Calendar className="mr-2 h-4 w-4" />
                  {t('export.scheduleReports')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
