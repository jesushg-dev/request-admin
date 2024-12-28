'use client';

import * as React from 'react';
import { Link } from '@/i18n/routing';
import { Avatar, AvatarFallback, AvatarImage } from '@radix-ui/react-avatar';
import { ChevronsUpDown, Plus } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuShortcut, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from '@/components/ui/sidebar';

interface TenantUser {
  id: string;
  name: string;
  logoUrl: string | null;
  description: string | null;
}

export function TenantSwitcher({ tenants, tenantId, isGlobalAdmin }: { tenants: TenantUser[]; tenantId: string; isGlobalAdmin: boolean }) {
  const t = useTranslations('admin.sidebar.tenantSwitcher');
  const { isMobile } = useSidebar();
  const currentTenant = React.useMemo(() => tenants.find((tenant) => tenant.id === tenantId), [tenants, tenantId]);

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton size="lg" className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground">
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg border border-dashed bg-accent p-0.5">
                {currentTenant?.logoUrl && (
                  <Avatar>
                    <AvatarImage src={currentTenant.logoUrl ?? ''} alt={currentTenant.name} style={{ objectFit: 'contain', objectPosition: 'center' }} />
                    <AvatarFallback>RE</AvatarFallback>
                  </Avatar>
                )}
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">{currentTenant?.name}</span>
                <span className="truncate text-xs">{currentTenant?.description}</span>
              </div>
              <ChevronsUpDown className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg" align="start" side={isMobile ? 'bottom' : 'right'} sideOffset={4}>
            <DropdownMenuLabel className="text-xs text-muted-foreground">{t('label.tenants')}</DropdownMenuLabel>
            {tenants.length > 1 && (
              <>
                {tenants.map((tenant, index) => {
                  if (tenant.id === tenantId) return null;
                  return (
                    <DropdownMenuItem key={tenant.id} className="p-0">
                      <Link className="flex w-full cursor-pointer items-center gap-2 p-2 hover:bg-accent" href={{ pathname: '/admin/[tenantId]', params: { tenantId: tenant.id } }} passHref>
                        <div className="flex aspect-square size-6 items-center justify-center rounded-lg border border-dashed bg-accent p-0.5">
                          {tenant?.logoUrl && (
                            <Avatar>
                              <AvatarImage src={tenant.logoUrl ?? ''} alt={tenant.name} style={{ objectFit: 'contain', objectPosition: 'center' }} />
                              <AvatarFallback>RE</AvatarFallback>
                            </Avatar>
                          )}
                        </div>
                        {tenant.name}
                        <DropdownMenuShortcut>⌘{index + 1}</DropdownMenuShortcut>
                      </Link>
                    </DropdownMenuItem>
                  );
                })}
                <DropdownMenuSeparator />
              </>
            )}
            {isGlobalAdmin && (
              <DropdownMenuItem className="p-0">
                <Link className="flex w-full cursor-pointer items-center gap-2 p-2 hover:bg-accent" href="/admin/global/tenants/new" passHref>
                  <div className="flex size-6 items-center justify-center rounded-md border bg-background">
                    <Plus className="size-4" />
                  </div>
                  <div className="font-medium text-muted-foreground">{t('addTenant')}</div>
                </Link>
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
