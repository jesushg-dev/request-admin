'use client';

import { Background, Controls, ReactFlow } from '@xyflow/react';
import { Check, CheckCircle2, FileText, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useTheme } from 'next-themes';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { WorkflowData } from './flow-diagram-editor';
import { WorkflowFormValues } from './request-workflow-form';

export default function WorkflowReview({ data, state }: { data: WorkflowFormValues; state: WorkflowData }) {
  const theme = useTheme();
  const t = useTranslations('admin.workflow.form.review');

  const getNodeColor = (colorValue: string) => {
    switch (colorValue) {
      case 'gray':
        return '#f3f4f6';
      case 'blue':
        return '#dbeafe';
      case 'indigo':
        return '#bfdbfe';
      case 'green':
        return '#d1fae5';
      case 'red':
        return '#fee2e2';
      default:
        return '#f3f4f6';
    }
  };

  const getNodeTypeLabel = (typeValue: string) => {
    switch (typeValue) {
      case 'initial':
        return t('types.initial');
      case 'final':
        return t('types.final');
      default:
        return t('types.default');
    }
  };

  return (
    <Card className="flex-1 flex flex-col overflow-hidden">
      <CardHeader>
        <CardTitle>{t('header.title')}</CardTitle>
        <CardDescription>{t('header.description')}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex-col flex overflow-hidden gap-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1">
          <Card className="h-full md:col-span-1 flex-1">
            <CardContent className="p-4">
              <div className="space-y-4">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <FileText className="h-4 w-4" />
                    <span className="text-sm font-medium">{data.name || t('noName')}</span>
                  </div>
                  <p className="text-sm pl-6">{data.description || t('noDescription')}</p>
                </div>

                <Separator />

                <div className="space-y-2.5">
                  <div className="flex items-center gap-2">
                    {data.isDefault ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : <X className="h-4 w-4 text-slate-300" />}
                    <span className="text-sm">{t('isDefault')}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {data.requireComments ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : <X className="h-4 w-4 text-slate-300" />}
                    <span className="text-sm">{t('requiresComments')}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {data.notifyChanges ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : <X className="h-4 w-4 text-slate-300" />}
                    <span className="text-sm">{t('notifyChanges')}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="md:col-span-2 flex flex-col flex-1">
            <Tabs defaultValue="diagram" className="flex-1 flex-col flex overflow-hidden">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="diagram" className="flex-1">
                  {t('tabs.diagram')}
                </TabsTrigger>
                <TabsTrigger value="states" className="flex-1">
                  {t('tabs.states')}
                </TabsTrigger>
                <TabsTrigger value="transitions" className="flex-1">
                  {t('tabs.transitions')}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="diagram" className="mt-2 flex-1 flex-col overflow-hidden">
                <Card style={{ width: '100%', height: '100%' }}>
                  <ReactFlow nodes={state.nodes} edges={state.edges} fitView colorMode={theme.theme === 'dark' ? 'dark' : 'light'}>
                    <Controls />
                    <Background color="#f8fafc" gap={16} />
                  </ReactFlow>
                </Card>
              </TabsContent>

              <TabsContent value="states" className="mt-2 flex-1 flex-col overflow-hidden">
                <Card>
                  <CardContent className="p-2 overflow-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>{t('table.name')}</TableHead>
                          <TableHead>{t('table.type')}</TableHead>
                          <TableHead>{t('table.color')}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {state.nodes.map((node) => (
                          <TableRow key={node.id}>
                            <TableCell>{node.data.label}</TableCell>
                            <TableCell>
                              <Badge variant={node.data.type.value === 'initial' ? 'default' : 'outline'} className="text-xs">
                                {getNodeTypeLabel(String(node.data.type.value))}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <div
                                  className="w-3 h-3 rounded-full"
                                  style={{
                                    backgroundColor: getNodeColor(String(node.data.color.value)),
                                  }}></div>
                                <span className="text-xs capitalize">{node.data.color.label}</span>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="transitions" className="mt-2 flex-1 flex-col overflow-hidden">
                <Card>
                  <CardContent className="p-2 overflow-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>{t('table.name')}</TableHead>
                          <TableHead>{t('table.from')}</TableHead>
                          <TableHead>{t('table.to')}</TableHead>
                          <TableHead className="w-[100px]">{t('table.approval')}</TableHead>
                          <TableHead className="w-[100px]">{t('table.justification')}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {state.edges.map((edge) => {
                          const sourceNode = state.nodes.find((n) => n.id === edge.source);
                          const targetNode = state.nodes.find((n) => n.id === edge.target);

                          return (
                            <TableRow key={edge.id}>
                              <TableCell>{edge.label}</TableCell>
                              <TableCell>{sourceNode?.data.label || edge.source}</TableCell>
                              <TableCell>{targetNode?.data.label || edge.target}</TableCell>
                              <TableCell className="text-center">
                                {edge.data?.requiresApproval ? <Check className="h-4 w-4 text-green-500 mx-auto" /> : <X className="h-4 w-4 text-red-500 mx-auto" />}
                              </TableCell>
                              <TableCell className="text-center">
                                {edge.data?.requiresJustification ? <Check className="h-4 w-4 text-green-500 mx-auto" /> : <X className="h-4 w-4 text-red-500 mx-auto" />}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
