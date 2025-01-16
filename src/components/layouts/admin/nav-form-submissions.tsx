'use client';

import { ComponentProps } from 'react';
import { Link } from '@/i18n/routing';
import { useDroppable } from '@dnd-kit/core';
import { Plus, type LucideIcon } from 'lucide-react';

import { cn } from '@/lib/utils';
import { SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuItem, useSidebar } from '@/components/ui/sidebar';

export type MenuItem = {
  title: string;
  icon?: LucideIcon;
  isActive?: boolean;
  url?: ComponentProps<typeof Link>['href'];
  items?: {
    title: string;
    icon?: LucideIcon;
    url: ComponentProps<typeof Link>['href'];
  }[];
};

export function NavFormSubmissions({ forms }: { forms: MenuItem[] }) {
  const { isMobile } = useSidebar();
  const { setNodeRef, isOver } = useDroppable({
    id: 'form-submissions',
  });

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>Form Submissions</SidebarGroupLabel>
      <SidebarMenu ref={setNodeRef}>
        {forms.length === 0 && (
          <SidebarMenuItem>
            <div className={cn('p-2', 'transition-colors duration-200', isOver && 'bg-muted/50')}>
              <div className="rounded-lg border-2 border-dashed p-4">
                <div className="flex flex-col items-center gap-2 text-center">
                  <Plus className="h-6 w-6" />
                  <p className="text-sm font-medium">Drop forms here</p>
                  <p className="text-xs text-muted-foreground">Drag and drop forms to add them to your navigation</p>
                </div>
              </div>
            </div>
          </SidebarMenuItem>
        )}
      </SidebarMenu>
    </SidebarGroup>
  );
}
