'use client';

import { useMemo } from 'react';
import { usePathname } from '@/i18n/routing';
import {
  BuildingIcon,
  ClipboardIcon,
  FileKey2Icon,
  FileTextIcon,
  FolderIcon,
  GridIcon,
  HomeIcon,
  IdCardIcon,
  LandPlotIcon,
  LayersIcon,
  ListIcon,
  RadarIcon,
  RadioTowerIcon,
  ScaleIcon,
  SettingsIcon,
  ShieldIcon,
  UsersIcon,
} from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarRail } from '@/components/ui/sidebar';

import { NavFormSubmissions } from './nav-form-submissions';
import { MenuItem, NavMain } from './nav-main';
import { NavUser } from './nav-user';
import { TenantSwitcher } from './tenant-switcher';

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  tenantId: string;
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
    isGlobalAdmin: boolean;
  };
  tenants: {
    id: string;
    name: string;
    logo: string | null;
    description: string | null;
  }[];
}

export function AppSidebar({ tenantId, tenants, user, ...props }: AppSidebarProps) {
  const pathname = usePathname();
  const t = useTranslations('admin.sidebar');

  const navMain = useMemo<MenuItem[]>(() => {
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
            title: t('requirements'),
            url: { pathname: '/admin/[tenantId]/requests-portal/requirements', params: { tenantId } },
            icon: ListIcon,
          },
          {
            title: t('areas'),
            url: { pathname: '/admin/[tenantId]/requests-portal/areas', params: { tenantId } },
            icon: LandPlotIcon,
          },
        ],
      },
      {
        title: t('linksAndDocuments'),
        icon: FileKey2Icon,
        items: [
          {
            title: t('dataRooms'),
            url: { pathname: '/admin/[tenantId]/links-and-documents/data-rooms', params: { tenantId } },
            icon: BuildingIcon,
          },
          {
            title: t('documents'),
            url: { pathname: '/admin/[tenantId]/links-and-documents/documents', params: { tenantId } },
            icon: FileTextIcon,
          },
          {
            title: t('links'),
            url: { pathname: '/admin/[tenantId]/links-and-documents/links', params: { tenantId } },
            icon: RadioTowerIcon,
          },
          {
            title: t('agreements'),
            url: { pathname: '/admin/[tenantId]/links-and-documents/agreements', params: { tenantId } },
            icon: ScaleIcon,
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
            title: t('identificationTypes'),
            url: { pathname: '/admin/[tenantId]/security/identification-types', params: { tenantId } },
            icon: IdCardIcon,
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
      {
        title: t('settings'),
        url: { pathname: '/admin/[tenantId]/settings/account', params: { tenantId } },
        icon: SettingsIcon,
        items: [],
      },
    ];
  }, [t, tenantId]);

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TenantSwitcher isGlobalAdmin={user.isGlobalAdmin} tenants={tenants} tenantId={tenantId} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMain} currentPath={pathname} />
        <NavFormSubmissions tenantId={tenantId} currentPath={pathname} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
