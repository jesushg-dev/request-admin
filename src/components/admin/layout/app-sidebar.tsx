'use client';

import * as React from 'react';
import { MenuItem, NavMain } from '@/components/admin/layout/nav-main';
import { MenuProject, NavProjects } from '@/components/admin/layout/nav-projects';
import { NavUser } from '@/components/admin/layout/nav-user';
import { TeamSwitcher } from '@/components/admin/layout/team-switcher';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarRail } from '@/components/ui/sidebar';

import { PieChartIcon, FolderIcon, SettingsIcon } from 'lucide-react';
import { AudioWaveform, BookOpen, Bot, Command, Frame, GalleryVerticalEnd, Map, PieChart, Settings2, SquareTerminal } from 'lucide-react';
import { HomeIcon, FileTextIcon, BriefcaseIcon, UsersIcon, LockIcon, LayersIcon, ShieldIcon, ClipboardIcon, GridIcon, ListIcon } from 'lucide-react';

import { logout } from '@/actions/logout';
import { useCurrentUser } from '@/hooks/use-current-user.hook';
import { useTranslations } from 'next-intl';

const teams = [
  {
    name: 'Acme Inc',
    logo: GalleryVerticalEnd,
    plan: 'Enterprise',
  },
  {
    name: 'Acme Corp.',
    logo: AudioWaveform,
    plan: 'Startup',
  },
  {
    name: 'Evil Corp.',
    logo: Command,
    plan: 'Free',
  },
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const user = useCurrentUser();
  const t = useTranslations('admin.sidebar');

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

  const onLogout = () => {
    logout();
  };

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={teams} />
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
