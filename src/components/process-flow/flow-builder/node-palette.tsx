'use client';

import type React from 'react';
import { Bell, Box, CheckSquare, Clock, Cpu, FileText, GitBranch, GitMerge, Layers, MessageSquare, Play, RefreshCw, Square } from 'lucide-react';

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ScrollArea } from '@/components/ui/scroll-area';

// Node types with their icons and categories
const nodeTypes = [
  {
    id: 'basic',
    label: 'Basic Blocks',
    items: [
      { type: 'start', label: 'Start', icon: <Play className="w-5 h-5" /> },
      { type: 'end', label: 'End', icon: <Square className="w-5 h-5" /> },
      { type: 'step', label: 'Step', icon: <Box className="w-5 h-5" /> },
      { type: 'condition', label: 'Condition', icon: <GitBranch className="w-5 h-5" /> },
      { type: 'loop', label: 'Loop', icon: <RefreshCw className="w-5 h-5" /> },
    ],
  },
  {
    id: 'advanced',
    label: 'Advanced Blocks',
    items: [
      { type: 'subprocess', label: 'Subprocess', icon: <Layers className="w-5 h-5" /> },
      { type: 'task', label: 'Task', icon: <Cpu className="w-5 h-5" /> },
      { type: 'approval', label: 'Approval', icon: <CheckSquare className="w-5 h-5" /> },
      { type: 'notification', label: 'Notification', icon: <Bell className="w-5 h-5" /> },
      { type: 'timer', label: 'Timer', icon: <Clock className="w-5 h-5" /> },
      { type: 'gateway', label: 'Gateway', icon: <GitMerge className="w-5 h-5" /> },
      { type: 'message', label: 'Message', icon: <MessageSquare className="w-5 h-5" /> },
      { type: 'annotation', label: 'Annotation', icon: <FileText className="w-5 h-5" /> },
    ],
  },
];

export default function NodePalette() {
  const onDragStart = (event: React.DragEvent<HTMLDivElement>, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div className="w-64 h-full border-l bg-background">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold">Node Palette</h2>
        <p className="text-sm text-muted-foreground">Drag nodes to the canvas</p>
      </div>

      <ScrollArea className="h-[calc(100%-73px)]">
        <div className="p-4">
          <Accordion type="multiple" defaultValue={['basic', 'advanced']} className="w-full">
            {nodeTypes.map((category) => (
              <AccordionItem key={category.id} value={category.id}>
                <AccordionTrigger className="py-3 text-sm font-medium">{category.label}</AccordionTrigger>
                <AccordionContent>
                  <div className="grid grid-cols-2 gap-2 py-2">
                    {category.items.map((item) => (
                      <div
                        key={item.type}
                        className="flex flex-col items-center p-2 border rounded cursor-move hover:bg-accent hover:text-accent-foreground"
                        onDragStart={(e) => onDragStart(e, item.type)}
                        draggable>
                        <div className="flex items-center justify-center w-10 h-10 mb-1 bg-background border rounded-full">{item.icon}</div>
                        <span className="text-xs text-center">{item.label}</span>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </ScrollArea>
    </div>
  );
}
