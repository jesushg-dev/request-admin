'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import type { Area, Status, Priority } from './types';

interface ReportFiltersProps {
  areas: Area[];
  statuses: Status[];
  priorities: Priority[];
  selectedAreas: string[];
  selectedStatuses: string[];
  selectedPriorities: string[];
  onAreaToggle: (areaId: string) => void;
  onStatusToggle: (statusId: string) => void;
  onPriorityToggle: (priorityId: string) => void;
  onClearFilters: () => void;
}

export function ReportFilters({
  areas,
  statuses,
  priorities,
  selectedAreas,
  selectedStatuses,
  selectedPriorities,
  onAreaToggle,
  onStatusToggle,
  onPriorityToggle,
  onClearFilters,
}: ReportFiltersProps) {
  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle>Filtros</CardTitle>
        <CardDescription>Personaliza los datos mostrados en los reportes</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <h3 className="mb-2 font-medium">Áreas</h3>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {areas.map((area) => (
                <div key={area.id} className="flex items-center space-x-2">
                  <Checkbox 
                    id={`area-${area.id}`} 
                    checked={selectedAreas.includes(area.id)} 
                    onCheckedChange={() => onAreaToggle(area.id)} 
                  />
                  <Label htmlFor={`area-${area.id}`}>{area.name}</Label>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h3 className="mb-2 font-medium">Estados</h3>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {statuses.map((status) => (
                <div key={status.id} className="flex items-center space-x-2">
                  <Checkbox 
                    id={`status-${status.id}`} 
                    checked={selectedStatuses.includes(status.id)}
                    onCheckedChange={() => onStatusToggle(status.id)}
                  />
                  <Label htmlFor={`status-${status.id}`}>
                    <div className="flex items-center">
                      {status.name}
                      <span className="ml-2 inline-block h-3 w-3 rounded-full" style={{ backgroundColor: status.color }}></span>
                    </div>
                  </Label>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h3 className="mb-2 font-medium">Prioridades</h3>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {priorities.map((priority) => (
                <div key={priority.id} className="flex items-center space-x-2">
                  <Checkbox 
                    id={`priority-${priority.id}`} 
                    checked={selectedPriorities.includes(priority.id)}
                    onCheckedChange={() => onPriorityToggle(priority.id)}
                  />
                  <Label htmlFor={`priority-${priority.id}`}>{priority.name}</Label>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-4 flex justify-end space-x-2">
          <Button variant="outline" onClick={onClearFilters}>
            Limpiar filtros
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

