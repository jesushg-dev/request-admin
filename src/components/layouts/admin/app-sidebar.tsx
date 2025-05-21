'use client';

import { useMemo } from 'react';
import { usePathname } from '@/i18n/routing';
import {
  BookIcon,
  BookTypeIcon,
  BuildingIcon,
  ChartColumnIncreasingIcon,
  ClipboardIcon,
  FileKey2Icon,
  FileTextIcon,
  FolderOpen,
  FolderOpenDot,
  GridIcon,
  HomeIcon,
  IdCardIcon,
  LandPlotIcon,
  LayersIcon,
  MessageCircleQuestionIcon,
  //MessagesSquareIcon,
  RadarIcon,
  RadioTowerIcon,
  ScaleIcon,
  SettingsIcon,
  ShieldIcon,
  SlidersHorizontalIcon,
  TagsIcon,
  UsersIcon,
  WorkflowIcon,
} from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarRail } from '@/components/ui/sidebar';

//import { NavFormSubmissions } from './nav-form-submissions';
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
        title: t('requests'),
        icon: ClipboardIcon,
        url: { pathname: '/admin/[tenantId]/requests', params: { tenantId } },
        items: [],
      },
      {
        title: t('reports'),
        icon: ChartColumnIncreasingIcon,
        url: { pathname: '/admin/[tenantId]/reports', params: { tenantId } },
        items: [],
      },
      /*{
        title: t('messages'),
        icon: MessagesSquareIcon,
        url: { pathname: '/admin/[tenantId]/messages', params: { tenantId } },
        items: [],
      },*/
      {
        title: t('formDesigner'),
        url: { pathname: '/admin/[tenantId]/form-designer', params: { tenantId } },
        icon: GridIcon,
        items: [],
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
        title: t('configuration'),
        icon: SlidersHorizontalIcon,
        items: [
          {
            title: t('areas'),
            url: { pathname: '/admin/[tenantId]/configurations/areas', params: { tenantId } },
            icon: LandPlotIcon,
          },
          {
            title: t('assignmentHierarchy'),
            url: {
              pathname: '/admin/[tenantId]/configurations/assignment-hierarchies',
              params: { tenantId },
            },
            icon: FolderOpenDot,
          },
          {
            title: t('requestTypes'),
            url: { pathname: '/admin/[tenantId]/configurations/request-types', params: { tenantId } },
            icon: LayersIcon,
          },
          {
            title: t('requestHierarchy'),
            url: {
              pathname: '/admin/[tenantId]/configurations/request-hierarchies',
              params: { tenantId },
            },
            icon: FolderOpen,
          },
          {
            title: t('requirements'),
            url: { pathname: '/admin/[tenantId]/configurations/requirements', params: { tenantId } },
            icon: BookIcon,
          },
          {
            title: t('requirementTypes'),
            url: { pathname: '/admin/[tenantId]/configurations/requirement-types', params: { tenantId } },
            icon: BookTypeIcon,
          },
          {
            title: t('priorities'),
            url: { pathname: '/admin/[tenantId]/configurations/priorities', params: { tenantId } },
            icon: TagsIcon,
          },
          {
            title: t('workflows'),
            url: { pathname: '/admin/[tenantId]/configurations/workflows', params: { tenantId } },
            icon: WorkflowIcon,
          },
        ],
      },
    ];
  }, [t, tenantId]);

  const systemMain = useMemo<MenuItem[]>(() => {
    return [
      {
        title: t('security'),
        icon: ShieldIcon,
        items: [
          {
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
      {
        title: t('help'),
        url: { pathname: '/admin/[tenantId]/help', params: { tenantId } },
        icon: MessageCircleQuestionIcon,
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
        <NavMain title="Request" items={navMain} currentPath={pathname} />
        {/*<NavFormSubmissions tenantId={tenantId} currentPath={pathname} /> */}
        <NavMain title="System" items={systemMain} currentPath={pathname} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
