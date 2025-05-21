'use client';

import type React from 'react';
import { Bell, Box, CheckSquare, Clock, Cpu, FileText, GitBranch, GitMerge, Layers, MessageSquare, Play, RefreshCw, Square } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ScrollArea } from '@/components/ui/scroll-area';

// Node types with their icons and categories
const nodeTypes = [
  {
    id: 'basic',
    items: [
      { type: 'start', icon: <Play className="w-5 h-5" /> },
      { type: 'end', icon: <Square className="w-5 h-5" /> },
      { type: 'step', icon: <Box className="w-5 h-5" /> },
      { type: 'condition', icon: <GitBranch className="w-5 h-5" /> },
      { type: 'loop', icon: <RefreshCw className="w-5 h-5" /> },
    ],
  },
  {
    id: 'advanced',
    items: [
      { type: 'subprocess', icon: <Layers className="w-5 h-5" /> },
      { type: 'task', icon: <Cpu className="w-5 h-5" /> },
      { type: 'approval', icon: <CheckSquare className="w-5 h-5" /> },
      { type: 'notification', icon: <Bell className="w-5 h-5" /> },
      { type: 'timer', icon: <Clock className="w-5 h-5" /> },
      { type: 'gateway', icon: <GitMerge className="w-5 h-5" /> },
      { type: 'message', icon: <MessageSquare className="w-5 h-5" /> },
      { type: 'annotation', icon: <FileText className="w-5 h-5" /> },
    ],
  },
] as const;

export default function NodePalette() {
  const t = useTranslations('component.flowExecution.build.nodePalette');

  const onDragStart = (event: React.DragEvent<HTMLDivElement>, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div className="w-64 h-full border-l bg-background">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold">{t('title')}</h2>
        <p className="text-sm text-muted-foreground">{t('subtitle')}</p>
      </div>

      <ScrollArea className="h-[calc(100%-73px)]">
        <div className="p-4">
          <Accordion type="multiple" defaultValue={['basic', 'advanced']} className="w-full">
            {nodeTypes.map((category) => (
              <AccordionItem key={category.id} value={category.id}>
                <AccordionTrigger className="py-3 text-sm font-medium">{t(`categories.${category.id}`)}</AccordionTrigger>
                <AccordionContent>
                  <div className="grid grid-cols-2 gap-2 py-2">
                    {category.items.map((item) => (
                      <div
                        key={item.type}
                        className="flex flex-col items-center p-2 border rounded cursor-move hover:bg-accent hover:text-accent-foreground"
                        onDragStart={(e) => onDragStart(e, item.type)}
                        draggable>
                        <div className="flex items-center justify-center w-10 h-10 mb-1 bg-background border rounded-full">{item.icon}</div>
                        <span className="text-xs text-center">{t(`nodes.${item.type}`)}</span>
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
