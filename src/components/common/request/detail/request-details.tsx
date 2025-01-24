'use client';

import { Link } from '@/i18n/routing';
import { CalendarIcon, Edit3Icon, FlagIcon, FolderIcon, StarIcon, TagIcon, UserIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MetadataItem } from '@/components/metadata-item';
import { ProgressCircle } from '@/components/progress-circle';

import { AddAttachment, Attachments } from './attachments';
import { mockRequest, mockSatisfactionSurvey, mockSLA, mockSubmissions, mockTaskProgress } from './mock-data';
import TeamMembers from './user-members';

export default function ProjectDetails({ tenantId, slug }: { tenantId: string; slug: string }) {
  return (
    <Card className="flex flex-1 flex-col">
      <CardHeader>
        <CardTitle className="flex w-full justify-between">
          {mockRequest.issueSubject}
          <Button variant="outline" size="sm" asChild>
            <Link
              href={{
                pathname: '/admin/[tenantId]/requests-portal/requests/[slug]/edit',
                params: { tenantId, slug },
              }}>
              <Edit3Icon className="h-4 w-4" />
              <span className="sr-only">Edit</span>
            </Link>
          </Button>
        </CardTitle>
        <CardDescription>{mockRequest.description}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-1">
        <div className="relative flex flex-1">
          <div className="absolute inset-0 flex overflow-hidden">
            <div className="flex flex-1 flex-col overflow-y-auto">
              <div className="space-y-4">
                {/* Progress Indicators */}
                <div>
                  <div className="flex gap-4 pb-4">
                    <ProgressCircle value={mockTaskProgress.completed} total={mockTaskProgress.total} label="Tasks Completed" />
                    <ProgressCircle value={mockSubmissions.count} total={mockSubmissions.total} label="Submissions" />
                    <div className="min-w-[200px] p-4">
                      <h4 className="mb-2 text-sm font-medium">Current SLA</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Resolution: {mockSLA.resolutionTime}h</span>
                          <span>Remaining: {mockSLA.timeRemaining}h</span>
                        </div>
                        <Progress value={mockSLA.progress} />
                      </div>
                    </div>
                  </div>
                </div>
                <Separator />
                {/*todo: metadata can be fixed at the top and be hidden when scrolling down but shown when scrolling up */}
                {/* Metadata */}
                <div className="w-full overflow-x-auto">
                  <div className="flex gap-4">
                    <MetadataItem icon={<UserIcon className="h-4 w-4" />} label="Client" value={mockRequest.clientName} />
                    <MetadataItem
                      icon={<FlagIcon className="h-4 w-4" />}
                      label="Priority"
                      value={
                        <Select defaultValue={mockRequest.priority}>
                          <SelectTrigger className="w-[100px]">
                            <SelectValue placeholder="Priority" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Low">Low</SelectItem>
                            <SelectItem value="Medium">Medium</SelectItem>
                            <SelectItem value="High">High</SelectItem>
                          </SelectContent>
                        </Select>
                      }
                    />
                    <MetadataItem icon={<TagIcon className="h-4 w-4" />} label="Status" value={mockRequest.statusName} />
                    <MetadataItem icon={<FolderIcon className="h-4 w-4" />} label="Category" value={mockRequest.requestCategoryName} />
                    <MetadataItem icon={<CalendarIcon className="h-4 w-4" />} label="Created" value={new Date(mockRequest.createdAt).toLocaleDateString()} />
                  </div>
                </div>
                {/* Satisfaction Survey */}
                {mockSatisfactionSurvey && (
                  <div className="bg-muted/50 flex items-center gap-4 rounded-lg p-4">
                    <div className="flex">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <StarIcon key={i} className={`h-5 w-5 ${i < mockSatisfactionSurvey.rating ? 'fill-current text-yellow-400' : 'text-gray-300'}`} />
                      ))}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm">{mockSatisfactionSurvey.feedback}</p>
                      <p className="text-muted-foreground text-xs">Submitted {new Date(mockSatisfactionSurvey.submittedAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                )}

                {/* Team Members */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Team Members</CardTitle>
                      <Button>Assign</Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <TeamMembers />
                  </CardContent>
                </Card>

                {/* Attachments */}
                <Tabs defaultValue="document">
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle>Attachments</CardTitle>
                        <div className="flex items-center gap-2">
                          <TabsList className="h-8">
                            <TabsTrigger value="document" className="h-7 text-xs">
                              Documents
                            </TabsTrigger>
                            <TabsTrigger value="guide" className="h-7 text-xs">
                              Guides
                            </TabsTrigger>
                          </TabsList>
                          <AddAttachment />
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <TabsContent value="document">
                        <Attachments type="document" />
                      </TabsContent>
                      <TabsContent value="guide">
                        <Attachments type="guide" />
                      </TabsContent>
                    </CardContent>
                  </Card>
                </Tabs>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
