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
  const [slaStatus, setSlaStatus] = useState<string>('all');
  const [slaPercentage, setSlaPercentage] = useState<number[]>([0, 100]);
  const [slaTimeRange, setSlaTimeRange] = useState<string>('all');
  const [workflowType, setWorkflowType] = useState<string>('all');
  const [workflows, setWorkflows] = useState<Workflow[]>([]);

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
          <Label htmlFor="sla-status">Estado de SLA</Label>
          <RadioGroup id="sla-status" value={slaStatus} onValueChange={setSlaStatus} className="flex flex-col space-y-1">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="all" id="all" />
              <Label htmlFor="all" className="flex items-center">
                Todos los estados
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="on-time" id="on-time" />
              <Label htmlFor="on-time" className="flex items-center">
                <Clock className="mr-1 h-4 w-4 text-blue-500" />A tiempo
                <Badge variant="outline" className="ml-2 bg-blue-50 text-blue-700">
                  Normal
                </Badge>
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="warning" id="warning" />
              <Label htmlFor="warning" className="flex items-center">
                <Clock className="mr-1 h-4 w-4 text-amber-500" />
                Próximo a vencer
                <Badge variant="outline" className="ml-2 bg-amber-50 text-amber-700">
                  &gt;75%
                </Badge>
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="overdue" id="overdue" />
              <Label htmlFor="overdue" className="flex items-center">
                <AlertTriangle className="mr-1 h-4 w-4 text-red-500" />
                Vencido
                <Badge variant="outline" className="ml-2 bg-red-50 text-red-700">
                  &gt;100%
                </Badge>
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="completed" id="completed" />
              <Label htmlFor="completed" className="flex items-center">
                <CheckCircle className="mr-1 h-4 w-4 text-green-500" />
                Completado
              </Label>
            </div>
          </RadioGroup>
        </div>

        <div className="space-y-2">
          <Label>Porcentaje de SLA consumido</Label>
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
          <Label htmlFor="sla-time">Tiempo restante de SLA</Label>
          <Select value={slaTimeRange} onValueChange={setSlaTimeRange}>
            <SelectTrigger id="sla-time">
              <SelectValue placeholder="Seleccionar rango" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los rangos</SelectItem>
              <SelectItem value="less-than-1h">Menos de 1 hora</SelectItem>
              <SelectItem value="1-4h">1 a 4 horas</SelectItem>
              <SelectItem value="4-24h">4 a 24 horas</SelectItem>
              <SelectItem value="1-3d">1 a 3 días</SelectItem>
              <SelectItem value="more-than-3d">Más de 3 días</SelectItem>
              <SelectItem value="overdue">Tiempo vencido</SelectItem>
            </SelectContent>
          </Select>

          <Label htmlFor="workflow-type" className="mt-4 block">
            Tipo de Workflow
          </Label>
          <Select value={workflowType} onValueChange={setWorkflowType}>
            <SelectTrigger id="workflow-type">
              <SelectValue placeholder="Seleccionar workflow" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los workflows</SelectItem>
              {workflows.map((workflow) => (
                <SelectItem key={workflow.id} value={workflow.id}>
                  {workflow.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="sla-search">Buscar por ID o descripción</Label>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input id="sla-search" type="search" placeholder="Buscar solicitudes..." className="pl-8" />
          </div>
          <Button onClick={handleSearch} className="w-full mt-6">
            Buscar
          </Button>
        </div>
      </div>
    </Card>
  );
}
