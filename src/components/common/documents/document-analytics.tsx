'use client';

import { useEffect, useState } from 'react';
import { Calendar, Clock, Download, Eye, FileText, Globe, Map, Users } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { toast } from 'sonner';

import { DocumentWithRelations } from '@/types/zenstackhq/document';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface DocumentAnalyticsProps {
  documentId: string;
  document: DocumentWithRelations;
}

export function DocumentAnalytics({ documentId, document }: DocumentAnalyticsProps) {
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
  const [timeRange, setTimeRange] = useState('30days');

  useEffect(() => {
    // Simulate API call to fetch analytics data
    const fetchAnalytics = async () => {
      setIsLoading(true);
      try {
        // In a real application, you would fetch from your API
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Mock analytics data
        setAnalyticsData({
          views: {
            total: document._count.views,
            trend: '+12% from last period',
            byDay: [
              { day: 'Mon', views: 12, downloads: 3 },
              { day: 'Tue', views: 8, downloads: 2 },
              { day: 'Wed', views: 15, downloads: 5 },
              { day: 'Thu', views: 10, downloads: 3 },
              { day: 'Fri', views: 14, downloads: 6 },
              { day: 'Sat', views: 5, downloads: 2 },
              { day: 'Sun', views: 4, downloads: 1 },
            ],
            byDevice: [
              { name: 'Desktop', value: 45 },
              { name: 'Mobile', value: 15 },
              { name: 'Tablet', value: 8 },
            ],
            byLocation: [
              { name: 'United States', value: 32 },
              { name: 'United Kingdom', value: 14 },
              { name: 'Germany', value: 9 },
              { name: 'France', value: 7 },
              { name: 'Other', value: 6 },
            ],
          },
          downloads: {
            total: 23, //document.downloadCount ||
            trend: '+8% from last period',
          },
          viewers: {
            total: 32,
            trend: '+5% from last period',
            byRole: [
              { name: 'Investors', value: 12 },
              { name: 'Board Members', value: 8 },
              { name: 'Legal Team', value: 6 },
              { name: 'Other', value: 6 },
            ],
          },
          timeSpent: {
            average: '4m 32s',
            trend: '+1m 12s from last period',
            bySection: [
              { name: 'Executive Summary', value: 120 },
              { name: 'Financial Data', value: 85 },
              { name: 'Market Analysis', value: 65 },
              { name: 'Projections', value: 45 },
              { name: 'Appendix', value: 25 },
            ],
          },
        });
      } catch {
        toast.error('Failed to fetch analytics data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalytics();
  }, [documentId, document, timeRange]);

  // Colors for charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  if (isLoading || !analyticsData) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold">Document Analytics</h2>
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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Document Analytics</h2>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select time range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7days">Last 7 days</SelectItem>
            <SelectItem value="30days">Last 30 days</SelectItem>
            <SelectItem value="90days">Last 90 days</SelectItem>
            <SelectItem value="year">Last year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Eye className="h-4 w-4 mr-2 text-blue-500" />
              Total Views
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
              Total Downloads
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
              Unique Viewers
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
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="viewers">Viewers</TabsTrigger>
          <TabsTrigger value="engagement">Engagement</TabsTrigger>
          <TabsTrigger value="geography">Geography</TabsTrigger>
        </TabsList>

        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Views & Downloads Over Time</CardTitle>
              <CardDescription>Document activity for the past week</CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analyticsData.views.byDay} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="views" fill="#0088FE" name="Views" />
                  <Bar dataKey="downloads" fill="#00C49F" name="Downloads" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Device Breakdown</CardTitle>
                <CardDescription>Views by device type</CardDescription>
              </CardHeader>
              <CardContent className="h-64">
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
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Time Spent by Section</CardTitle>
                <CardDescription>Average time spent on each section</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analyticsData.timeSpent.bySection.map(
                    (
                      section: {
                        name: string;
                        value: number;
                      },
                      index: number
                    ) => (
                      <div key={index} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>{section.name}</span>
                          <span className="font-medium">
                            {Math.floor(section.value / 60)}m {section.value % 60}s
                          </span>
                        </div>
                        <Progress value={(section.value / analyticsData.timeSpent.bySection[0].value) * 100} />
                      </div>
                    )
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="viewers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Viewer Groups</CardTitle>
              <CardDescription>Distribution of viewers by group</CardDescription>
            </CardHeader>
            <CardContent className="h-80">
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
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Top Viewers</CardTitle>
              <CardDescription>Users who viewed this document the most</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mr-3">JD</div>
                    <div>
                      <div className="font-medium">John Doe</div>
                      <div className="text-sm text-muted-foreground">john@example.com</div>
                    </div>
                  </div>
                  <Badge>12 views</Badge>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600 mr-3">AS</div>
                    <div>
                      <div className="font-medium">Alice Smith</div>
                      <div className="text-sm text-muted-foreground">alice@example.com</div>
                    </div>
                  </div>
                  <Badge>9 views</Badge>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 mr-3">RJ</div>
                    <div>
                      <div className="font-medium">Robert Johnson</div>
                      <div className="text-sm text-muted-foreground">robert@example.com</div>
                    </div>
                  </div>
                  <Badge>7 views</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="engagement" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Average Time Spent</CardTitle>
              <CardDescription>How long viewers spend on this document</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center py-8">
                <div className="text-center">
                  <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <div className="text-4xl font-bold">{analyticsData.timeSpent.average}</div>
                  <p className="text-sm text-muted-foreground mt-2">{analyticsData.timeSpent.trend}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Engagement Metrics</CardTitle>
              <CardDescription>How users interact with this document</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>Completion Rate</span>
                      <span className="font-medium">78%</span>
                    </div>
                    <Progress value={78} />
                    <p className="text-xs text-muted-foreground">Percentage of viewers who viewed all pages</p>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>Return Rate</span>
                      <span className="font-medium">42%</span>
                    </div>
                    <Progress value={42} />
                    <p className="text-xs text-muted-foreground">Percentage of viewers who returned to view again</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>Download Rate</span>
                      <span className="font-medium">34%</span>
                    </div>
                    <Progress value={34} />
                    <p className="text-xs text-muted-foreground">Percentage of viewers who downloaded the document</p>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>Share Rate</span>
                      <span className="font-medium">12%</span>
                    </div>
                    <Progress value={12} />
                    <p className="text-xs text-muted-foreground">Percentage of viewers who shared the document</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="geography" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Geographic Distribution</CardTitle>
              <CardDescription>Where your document is being viewed from</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-center items-center py-8">
                <Globe className="h-48 w-48 text-muted-foreground" />
              </div>
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
                        <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                        <span>{location.name}</span>
                      </div>
                      <div className="flex items-center">
                        <span className="font-medium mr-2">{location.value}</span>
                        <span className="text-xs text-muted-foreground">({((location.value / analyticsData.views.total) * 100).toFixed(1)}%)</span>
                      </div>
                    </div>
                  )
                )}
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-center">
            <Button variant="outline">
              <Map className="mr-2 h-4 w-4" />
              View Detailed Map
            </Button>
          </div>
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle>Export Analytics</CardTitle>
          <CardDescription>Download analytics data for this document</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <Button variant="outline" className="flex-1">
              <FileText className="mr-2 h-4 w-4" />
              Export as CSV
            </Button>
            <Button variant="outline" className="flex-1">
              <FileText className="mr-2 h-4 w-4" />
              Export as PDF
            </Button>
            <Button variant="outline" className="flex-1">
              <Calendar className="mr-2 h-4 w-4" />
              Schedule Reports
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
