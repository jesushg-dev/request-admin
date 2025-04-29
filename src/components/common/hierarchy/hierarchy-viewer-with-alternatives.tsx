'use client';

import { ChevronRight, CircleDot, Layers } from 'lucide-react';

import { Badge } from '@/components/ui/badge';

interface HierarchyLevel {
  id: string;
  name: string;
  position: number;
}

interface Hierarchy {
  id: string;
  name: string;
  description: string | null;
  levels: HierarchyLevel[];
}

// Alternative 1: Minimalist Breadcrumb
export function MiniBreadcrumb({ hierarchy }: { hierarchy: Hierarchy }) {
  return (
    <div className="flex items-center flex-wrap gap-1 text-xs">
      <span className="font-medium">{hierarchy.name}</span>
      {hierarchy.levels.map((level, index) => (
        <div key={level.id} className="flex items-center">
          <ChevronRight className="h-3 w-3 text-muted-foreground mx-0.5" />
          <span className={index === hierarchy.levels.length - 1 ? 'font-medium' : 'text-muted-foreground'}>{level.name}</span>
        </div>
      ))}
    </div>
  );
}

// Alternative 2: Pill Chain
export function PillChain({ hierarchy }: { hierarchy: Hierarchy }) {
  return (
    <div className="flex items-center flex-wrap gap-1">
      <Badge variant="outline" className="px-2 py-0.5 text-xs font-medium">
        {hierarchy.name}
      </Badge>
      {hierarchy.levels.map((level) => (
        <div key={level.id} className="flex items-center">
          <ChevronRight className="h-3 w-3 text-muted-foreground" />
          <Badge variant="secondary" className="px-2 py-0.5 text-xs">
            {level.name}
          </Badge>
        </div>
      ))}
    </div>
  );
}

// Alternative 3: Mini Horizontal Tree
export function MiniTree({ hierarchy }: { hierarchy: Hierarchy }) {
  return (
    <div className="rounded-md border p-1.5">
      <div className="flex items-center gap-1.5 text-xs font-medium mb-1">
        <Layers className="h-3.5 w-3.5" />
        {hierarchy.name}
      </div>
      <div className="flex items-center">
        {hierarchy.levels.map((level, index) => (
          <div key={level.id} className="flex items-center" style={{ marginLeft: index === 0 ? '0.5rem' : '0' }}>
            {index > 0 && <div className="h-px w-4 bg-muted-foreground/30"></div>}
            <div className="flex flex-col items-center">
              <CircleDot className="h-3 w-3 text-primary" />
              <div className="text-[10px] mt-0.5 max-w-16 truncate text-center">{level.name}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Alternative 4: Numbered Tags
export function NumberedTags({ hierarchy }: { hierarchy: Hierarchy }) {
  return (
    <div className="space-y-1">
      <div className="text-xs font-medium">{hierarchy.name}</div>
      <div className="flex flex-wrap gap-1">
        {hierarchy.levels.map((level, index) => (
          <Badge key={level.id} variant="outline" className="flex items-center gap-1 text-xs py-0">
            <div className="flex items-center justify-center bg-primary text-primary-foreground rounded-full h-3.5 w-3.5 text-[9px] font-bold">{index + 1}</div>
            {level.name}
          </Badge>
        ))}
      </div>
    </div>
  );
}

// Alternative 5: Compact Table
export function CompactTable({ hierarchy }: { hierarchy: Hierarchy }) {
  return (
    <div className="rounded-md border overflow-hidden text-xs">
      <div className="bg-muted px-2 py-1 font-medium">{hierarchy.name}</div>
      <table className="w-full">
        <tbody>
          {hierarchy.levels.map((level, index) => (
            <tr key={level.id} className={index !== hierarchy.levels.length - 1 ? 'border-b' : ''}>
              <td className="px-2 py-1 text-muted-foreground">{index + 1}</td>
              <td className="px-2 py-1">{level.name}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
