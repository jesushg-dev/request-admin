'use client';

import { useEffect, useState } from 'react';
import { getWorkflows } from '@/actions/dashboard';
import { AlertTriangle, CheckCircle, Clock, Search } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { useTranslations } from 'next-intl';

export interface SLAFilterValues {
  slaStatus: string;
  slaPercentage: number[];
  slaTimeRange: string;
  workflowType: string;
}

interface SLAFiltersProps {
  tenantId: string;
  onSearch: (filters: SLAFilterValues) => void;
}

interface Workflow {
  id: string;
  name: string;
  _count: {
    requestCategory: number;
  };
}

export function SLAFilters({ tenantId, onSearch }: SLAFiltersProps) {
  const t = useTranslations('admin.dashboard.slaFilters');
  const [slaStatus, setSlaStatus] = useState<string>('all');
  const [slaPercentage, setSlaPercentage] = useState<number[]>([0, 100]);
  const [slaTimeRange, setSlaTimeRange] = useState<string>('all');
  const [workflowType, setWorkflowType] = useState<string>('all');
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [searchText, setSearchText] = useState<string>('');

  useEffect(() => {
    async function fetchWorkflows() {
      try {
        const workflowsData = await getWorkflows(tenantId);
        setWorkflows(workflowsData as Workflow[]);
      } catch (error) {
        console.error('Error fetching workflows:', error);
      }
    }

    fetchWorkflows();
  }, [tenantId]);

  const handleSearch = () => {
    onSearch({
      slaStatus,
      slaPercentage,
      slaTimeRange,
      workflowType,
    });
  };

  return (
    <Card className="p-4">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-2">
          <Label htmlFor="sla-status">{t('labels.status')}</Label>
          <RadioGroup id="sla-status" value={slaStatus} onValueChange={setSlaStatus} className="flex flex-col space-y-1">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="all" id="all" />
              <Label htmlFor="all" className="flex items-center">
                {t('status.all')}
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="on-time" id="on-time" />
              <Label htmlFor="on-time" className="flex items-center">
                <Clock className="mr-1 h-4 w-4 text-blue-500" />{t('status.onTime')}
                <Badge variant="outline" className="ml-2 bg-blue-50 text-blue-700">
                  {t('badges.normal')}
                </Badge>
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="warning" id="warning" />
              <Label htmlFor="warning" className="flex items-center">
                <Clock className="mr-1 h-4 w-4 text-amber-500" />
                {t('status.warning')}
                <Badge variant="outline" className="ml-2 bg-amber-50 text-amber-700">
                  &gt;75%
                </Badge>
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="overdue" id="overdue" />
              <Label htmlFor="overdue" className="flex items-center">
                <AlertTriangle className="mr-1 h-4 w-4 text-red-500" />
                {t('status.overdue')}
                <Badge variant="outline" className="ml-2 bg-red-50 text-red-700">
                  &gt;100%
                </Badge>
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="completed" id="completed" />
              <Label htmlFor="completed" className="flex items-center">
                <CheckCircle className="mr-1 h-4 w-4 text-green-500" />
                {t('status.completed')}
              </Label>
            </div>
          </RadioGroup>
        </div>

        <div className="space-y-2">
          <Label>{t('labels.slaPercentage')}</Label>
          <div className="pt-6 px-2">
            <Slider value={slaPercentage} min={0} max={150} step={5} onValueChange={setSlaPercentage} className="mb-6" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{slaPercentage[0]}%</span>
              <span>{slaPercentage[1]}%</span>
            </div>
          </div>
          <div className="flex justify-between text-xs text-muted-foreground mt-2">
            <span>0%</span>
            <span>50%</span>
            <span>100%</span>
            <span>150%</span>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="sla-time">{t('labels.timeRange')}</Label>
          <Select value={slaTimeRange} onValueChange={setSlaTimeRange}>
            <SelectTrigger id="sla-time">
              <SelectValue placeholder={t('placeholders.selectRange')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('timeRanges.all')}</SelectItem>
              <SelectItem value="less-than-1h">{t('timeRanges.lessThan1h')}</SelectItem>
              <SelectItem value="1-4h">{t('timeRanges.1to4h')}</SelectItem>
              <SelectItem value="4-24h">{t('timeRanges.4to24h')}</SelectItem>
              <SelectItem value="1-3d">{t('timeRanges.1to3d')}</SelectItem>
              <SelectItem value="more-than-3d">{t('timeRanges.moreThan3d')}</SelectItem>
              <SelectItem value="overdue">{t('timeRanges.overdue')}</SelectItem>
            </SelectContent>
          </Select>

          <Label htmlFor="workflow-type" className="mt-4 block">
            {t('labels.workflowType')}
          </Label>
          <Select value={workflowType} onValueChange={setWorkflowType}>
            <SelectTrigger id="workflow-type">
              <SelectValue placeholder={t('placeholders.selectWorkflow')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('workflows.all')}</SelectItem>
              {workflows.map((workflow) => (
                <SelectItem key={workflow.id} value={workflow.id}>
                  {workflow.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="sla-search">{t('labels.search')}</Label>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              id="sla-search"
              type="search"
              placeholder={t('placeholders.search')}
              className="pl-8"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </div>
          <Button onClick={handleSearch} className="w-full mt-6">
            {t('buttons.search')}
          </Button>
        </div>
      </div>
    </Card>
  );
}
