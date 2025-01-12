'use client';

import { ComponentProps } from 'react';
import { Link } from '@/i18n/routing';
import { ChevronRight, type LucideIcon } from 'lucide-react';

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarMenuSub, SidebarMenuSubButton, SidebarMenuSubItem } from '@/components/ui/sidebar';

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

export function NavMain({ items }: { items: MenuItem[] }) {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>Platform</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => (
          <Collapsible key={item.title} asChild defaultOpen={item.isActive} className="group/collapsible">
            {item.url && item.items?.length === 0 ? (
              <SidebarMenuItem>
                <SidebarMenuButton tooltip={item.title} asChild>
                  <Link href={item.url} className="text-xs">
                    {item.icon && <item.icon />}
                    {item.title}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ) : (
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton tooltip={item.title}>
                    {item.icon && <item.icon />}
                    <span className="text-xs">{item.title}</span>
                    <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenuSub>
                    {item.items?.map((subItem) => (
                      <SidebarMenuSubItem key={subItem.title}>
                        <SidebarMenuSubButton asChild className="py-1">
                          <Link href={subItem.url} className="text-xs">
                            {subItem.icon && <subItem.icon />}
                            {subItem.title}
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            )}
          </Collapsible>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
