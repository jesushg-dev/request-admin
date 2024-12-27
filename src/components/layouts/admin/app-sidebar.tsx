'use client';

import * as React from 'react';
import { ExtendedUser } from '@/server/auth/config';
import { ClipboardIcon, FileTextIcon, FolderIcon, Frame, GridIcon, HomeIcon, LandPlotIcon, LayersIcon, ListIcon, Map, PieChart, SettingsIcon, ShieldIcon, UsersIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';

import useTenantId from '@/hooks/use-tenant-id';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarRail } from '@/components/ui/sidebar';

import { MenuItem, NavMain } from './nav-main';
import { MenuProject, NavProjects } from './nav-projects';
import { NavUser } from './nav-user';
import { TenantSwitcher } from './tenant-switcher';

const projects: MenuProject[] = [
  {
    name: 'Design Engineering',
    url: '#',
    icon: Frame,
  },
  {
    name: 'Sales & Marketing',
    url: '#',
    icon: PieChart,
  },
  {
    name: 'Travel',
    url: '#',
    icon: Map,
  },
];

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  user: ExtendedUser;
  tenants: {
    id: string;
    name: string;
    logoUrl: string | null;
    description: string | null;
  }[];
}

export function AppSidebar({ tenants, user, ...props }: AppSidebarProps) {
  const tenantId = useTenantId();
  const t = useTranslations('admin.sidebar');

  const navMain: MenuItem[] = React.useMemo(() => {
    return [
      {
        title: t('dashboard'),
        icon: HomeIcon,
        url: { pathname: '/[tenantId]/admin', params: { tenantId } },
        items: [],
      },
      {
        title: t('requests'),
        icon: FolderIcon,
        items: [
          {
            title: t('request'),
            url: { pathname: '/[tenantId]/admin/request', params: { tenantId } },
            icon: ClipboardIcon,
          },
          {
            title: t('requestType'),
            url: { pathname: '/[tenantId]/admin/request-type', params: { tenantId } },
            icon: LayersIcon,
          },
          {
            title: t('requirements'),
            url: { pathname: '/[tenantId]/admin/requirement', params: { tenantId } },
            icon: ListIcon,
          },
          {
            title: t('documents'),
            url: { pathname: '/[tenantId]/admin/document', params: { tenantId } },
            icon: FileTextIcon,
          },
          {
            title: t('formDesigner'),
            url: { pathname: '/[tenantId]/admin/form-designer', params: { tenantId } },
            icon: GridIcon,
          },
        ],
      },
      {
        title: t('management'),
        icon: SettingsIcon,
        items: [
          {
            title: t('client'),
            url: { pathname: '/[tenantId]/admin/management/client', params: { tenantId } },
            icon: UsersIcon,
          },
          {
            title: t('area'),
            url: { pathname: '/[tenantId]/admin/management/area', params: { tenantId } },
            icon: LandPlotIcon,
          },
        ],
      },
      {
        title: t('security'),
        icon: ShieldIcon,
        items: [
          {
            title: t('role'),
            url: { pathname: '/[tenantId]/admin/security/role', params: { tenantId } },
            icon: ShieldIcon,
          },
          {
            title: t('user'),
            url: { pathname: '/[tenantId]/admin/security/user', params: { tenantId } },
            icon: UsersIcon,
          },
        ],
      },
    ];
  }, [t, tenantId]);

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TenantSwitcher isGlobalAdmin={user.isGlobalAdmin} tenants={tenants} tenantId={tenantId} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMain} />
        <NavProjects projects={projects} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
