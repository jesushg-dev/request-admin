'use client';

import * as React from 'react';
import { logout } from '@/actions/logout';
import { ExtendedUser } from '@/server/auth/config';
import { useUpdateUserTenant } from '@/services/api/hooks';
import { ClipboardIcon, FileTextIcon, FolderIcon, Frame, GridIcon, HomeIcon, LayersIcon, ListIcon, Map, PieChart, SettingsIcon, ShieldIcon, UsersIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

import useTenantId from '@/hooks/use-tenant-id';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarRail } from '@/components/ui/sidebar';

import { MenuItem, NavMain } from './nav-main';
import { MenuProject, NavProjects } from './nav-projects';
import { NavUser } from './nav-user';
import { TeamSwitcher } from './team-switcher';

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
    userTenants: {
      isCurrent: boolean;
    }[];
  }[];
}

export function AppSidebar({ tenants, user, ...props }: AppSidebarProps) {
  const tenantId = useTenantId();
  const t = useTranslations('admin.sidebar');

  const { mutateAsync } = useUpdateUserTenant();

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
            icon: SettingsIcon,
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

  const onLogout = () => {
    logout();
  };

  const onTeamChange = async (tenantId: string) => {
    try {
      //find the current user tenant and set it to false
      const userTenant = tenants?.find((team) => team.userTenants.some((userTenant) => userTenant.isCurrent));
      if (userTenant) {
        await mutateAsync({ data: { isCurrent: false }, where: { userId_tenantId: { userId: user.id, tenantId: userTenant.id } } });
      }

      await mutateAsync({ data: { isCurrent: true }, where: { userId_tenantId: { userId: user.id, tenantId } } });

      toast.success(t('success.changeTenantSuccess'));
    } catch (error) {
      toast.error(t('errors.changeTenantError'));
    }
  };

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={tenants ?? []} onTeamChange={onTeamChange} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMain} />
        <NavProjects projects={projects} />
      </SidebarContent>
      <SidebarFooter>{user && <NavUser onLogout={onLogout} user={user} />}</SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
