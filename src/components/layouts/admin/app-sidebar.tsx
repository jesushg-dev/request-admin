'use client';

import * as React from 'react';
import { ExtendedUser } from '@/server/auth/config';
import {
  ClipboardIcon,
  FileTextIcon,
  FolderIcon,
  Frame,
  GridIcon,
  HomeIcon,
  IdCardIcon,
  LandPlotIcon,
  LayersIcon,
  ListIcon,
  ListTreeIcon,
  Map,
  PieChart,
  RadarIcon,
  SettingsIcon,
  ShieldIcon,
  UsersIcon,
} from 'lucide-react';
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
        url: { pathname: '/admin/[tenantId]', params: { tenantId } },
        items: [],
      },
      {
        title: t('requestsPortal'),
        icon: FolderIcon,
        items: [
          {
            title: t('requests'),
            url: { pathname: '/admin/[tenantId]/requests-portal/requests', params: { tenantId } },
            icon: ClipboardIcon,
          },
          {
            title: t('requestTypes'),
            url: { pathname: '/admin/[tenantId]/requests-portal/request-types', params: { tenantId } },
            icon: LayersIcon,
          },
          {
            title: t('requestTypesHierarchies'),
            url: { pathname: '/admin/[tenantId]/requests-portal/request-types/hierarchies', params: { tenantId } },
            icon: ListTreeIcon,
          },
          {
            title: t('requirements'),
            url: { pathname: '/admin/[tenantId]/requests-portal/requirements', params: { tenantId } },
            icon: ListIcon,
          },
          {
            title: t('documents'),
            url: { pathname: '/admin/[tenantId]/requests-portal/documents', params: { tenantId } },
            icon: FileTextIcon,
          },
        ],
      },

      {
        title: t('formDesigner'),
        url: { pathname: '/admin/[tenantId]/form-designer', params: { tenantId } },
        icon: GridIcon,
        items: [],
      },
      {
        title: t('management'),
        icon: SettingsIcon,
        items: [
          {
            title: t('areas'),
            url: { pathname: '/admin/[tenantId]/management/areas', params: { tenantId } },
            icon: LandPlotIcon,
          },
          {
            title: t('areasHierarchies'),
            url: { pathname: '/admin/[tenantId]/management/areas/hierarchies', params: { tenantId } },
            icon: ListTreeIcon,
          },
          {
            title: t('identificationTypes'),
            url: { pathname: '/admin/[tenantId]/management/identification-types', params: { tenantId } },
            icon: IdCardIcon,
          },
        ],
      },
      {
        title: t('security'),
        icon: ShieldIcon,
        items: [
          {
            //dashboard
            title: t('dashboard'),
            url: { pathname: '/admin/[tenantId]/security', params: { tenantId } },
            icon: RadarIcon,
          },
          {
            title: t('roles'),
            url: { pathname: '/admin/[tenantId]/security/roles', params: { tenantId } },
            icon: ShieldIcon,
          },
          {
            title: t('users'),
            url: { pathname: '/admin/[tenantId]/security/users', params: { tenantId } },
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
