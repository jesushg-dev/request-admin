'use client';

import * as React from 'react';
import { logout } from '@/actions/logout';
import { useFindManyTenant, useUpdateUserTenant } from '@/services/api/hooks';
import {
  BookOpen,
  BriefcaseIcon,
  ClipboardIcon,
  FileTextIcon,
  FolderIcon,
  Frame,
  GridIcon,
  HomeIcon,
  LayersIcon,
  ListIcon,
  LockIcon,
  Map,
  PieChart,
  Settings2,
  SettingsIcon,
  ShieldIcon,
  UsersIcon,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

import { useCurrentUser } from '@/hooks/use-current-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarRail } from '@/components/ui/sidebar';
import { Skeleton } from '@/components/ui/skeleton';
import { MenuItem, NavMain } from '@/components/admin/layout/nav-main';
import { MenuProject, NavProjects } from '@/components/admin/layout/nav-projects';
import { NavUser } from '@/components/admin/layout/nav-user';
import { TeamSwitcher } from '@/components/admin/layout/team-switcher';

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

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const user = useCurrentUser();
  const { data: teams, isLoading } = useFindManyTenant({
    select: { id: true, name: true, description: true, logoUrl: true, userTenants: { select: { isCurrent: true } } },
    where: { userTenants: { some: { userId: { equals: user?.id } } } },
  });
  const t = useTranslations('admin.sidebar');

  const { mutateAsync } = useUpdateUserTenant();

  const navMain: MenuItem[] = [
    {
      title: t('dashboard'),
      icon: HomeIcon, // Icon for "Main Menu"
      url: '/admin',
      items: [],
    },
    {
      title: t('requests'),
      icon: FolderIcon, // Icon for "Incidents and Documents"
      items: [
        {
          title: t('case'),
          url: '/admin/request',
          icon: ClipboardIcon,
        },
        {
          title: t('documents'),
          url: '/admin/document',
          icon: FileTextIcon,
        },
        {
          title: t('serviceType'),
          url: '/admin/service-type',
          icon: LayersIcon,
        },
        {
          title: t('salesChannel'),
          url: '/admin/sales-channel',
          icon: BriefcaseIcon,
        },
        {
          title: t('requirements'),
          url: '/admin/requirement',
          icon: ListIcon,
        },
        {
          title: t('formDesigner'),
          url: '/admin/form-designer',
          icon: GridIcon,
        },
      ],
    },
    {
      title: t('management'),
      icon: SettingsIcon, // Icon for "Management and Organization"
      items: [
        {
          title: t('area'),
          url: '/admin/area',
          icon: GridIcon,
        },
        {
          title: t('caseType'),
          url: '/admin/request-type',
          icon: ClipboardIcon,
        },
        {
          title: t('category'),
          url: '/admin/category',
          icon: LayersIcon,
        },
        {
          title: t('client'),
          url: '/admin/client',
          icon: UsersIcon,
        },
      ],
    },
    {
      title: t('security'),
      icon: ShieldIcon, // Icon for "Security and Access"
      items: [
        {
          title: t('role'),
          url: '/admin/role',
          icon: ShieldIcon,
        },
        {
          title: t('module'),
          url: '/admin/module',
          icon: LockIcon,
        },
        {
          title: t('user'),
          url: '/admin/user',
          icon: UsersIcon,
        },
      ],
    },
    {
      title: 'Documentation',
      icon: BookOpen,
      items: [
        {
          title: 'Introduction',
          url: '#',
        },
        {
          title: 'Get Started',
          url: '#',
        },
        {
          title: 'Tutorials',
          url: '#',
        },
        {
          title: 'Changelog',
          url: '#',
        },
      ],
    },
    {
      title: 'Settings',
      icon: Settings2,
      items: [
        {
          title: 'General',
          url: '#',
        },
        {
          title: 'Team',
          url: '#',
        },
        {
          title: 'Billing',
          url: '#',
        },
        {
          title: 'Limits',
          url: '#',
        },
      ],
    },
  ];

  const onLogout = () => {
    logout();
  };

  const onTeamChange = async (tenantId: string) => {
    try {
      if (!user?.id) throw new Error('User not found');
      //find the current user tenant and set it to false
      const userTenant = teams?.find((team) => team.userTenants.some((userTenant) => userTenant.isCurrent));
      if (userTenant) {
        await mutateAsync({ data: { isCurrent: false }, where: { userId_tenantId: { userId: user?.id, tenantId: userTenant.id } } });
      }

      await mutateAsync({ data: { isCurrent: true }, where: { userId_tenantId: { userId: user?.id, tenantId } } });

      toast.success(t('success.changeTenantSuccess'));
    } catch (error) {
      toast.error(t('errors.changeTenantError'));
    }
  };

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>{isLoading ? <Skeleton className="h-2 w-full" /> : <TeamSwitcher teams={teams ?? []} onTeamChange={onTeamChange} />}</SidebarHeader>
      <SidebarContent>
        <NavMain items={navMain} />
        <NavProjects projects={projects} />
      </SidebarContent>
      <SidebarFooter>{user && <NavUser onLogout={onLogout} user={user} />}</SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
