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
  FileBadgeIcon,
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
import { useTenantContext } from '@/components/hoc/tenant-provider';
import { useAuthorization, PERMISSION } from '@/hooks/use-authorization';

//import { NavFormSubmissions } from './nav-form-submissions';
import { MenuItem, NavMain } from './nav-main';
import { NavUser } from './nav-user';
import { TenantSwitcher } from './tenant-switcher';

/**
 * Filters menu items by hiding those that are disabled.
 * If a parent item has no available sub-items after filtering, it is also hidden.
 */
function filterMenuItems(items: MenuItem[]): MenuItem[] {
  return items
    .map((item) => {
      // If it has sub-items, filter out disabled sub-items
      if (item.items && item.items.length > 0) {
        const filteredSubItems = item.items.filter((subItem) => !subItem.disabled);
        // If no sub-items remain after filtering, return null to hide the parent item
        if (filteredSubItems.length === 0) {
          return null;
        }
        const { disabled, ...itemWithoutDisabled } = item;
        return {
          ...itemWithoutDisabled,
          items: filteredSubItems,
        };
      }
      // If it's a main item without sub-items, filter it if disabled
      if (item.disabled) {
        return null;
      }
      const { disabled, ...itemWithoutDisabled } = item;
      return itemWithoutDisabled;
    })
    .filter((item) => item !== null) as MenuItem[];
}

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
    isGlobalAdmin?: boolean | null;
  };
  isOnPremise?: boolean;
}

export function AppSidebar({ user, isOnPremise, ...props }: AppSidebarProps) {
  const pathname = usePathname();
  const t = useTranslations('admin.sidebar');
  const { tenantId, tenants } = useTenantContext();
  const { hasPermission } = useAuthorization(tenantId);

  const navMain = useMemo<MenuItem[]>(() => {
    const canViewDashboard = hasPermission(PERMISSION.DASHBOARD.VIEW);
    const canViewRequests = hasPermission(PERMISSION.REQUEST_MANAGEMENT.VIEW);
    const canViewReports = hasPermission(PERMISSION.REPORTS.VIEW);
    const canViewForms = hasPermission(PERMISSION.FORM_DESIGNER.VIEW);
    const canViewDocuments = hasPermission(PERMISSION.DOCUMENT_MANAGEMENT.VIEW);
    const canViewDataRooms = hasPermission(PERMISSION.DATA_ROOM.VIEW);
    const canViewSharedLinks = hasPermission(PERMISSION.SHARED_LINK.VIEW);
    const canViewAgreements = hasPermission(PERMISSION.AGREEMENT.VIEW);
    const canViewAreas = hasPermission(PERMISSION.AREA.VIEW);
    const canViewRequestTypes = hasPermission(PERMISSION.REQUEST_TYPE.VIEW);
    const canViewRequirements = hasPermission(PERMISSION.REQUIREMENT.VIEW);
    const canViewRequirementTypes = hasPermission(PERMISSION.REQUIREMENT_TYPE.VIEW);
    const canViewPriorities = hasPermission(PERMISSION.PRIORITY.VIEW);
    const canViewWorkflows = hasPermission(PERMISSION.WORKFLOW.VIEW);
    const canViewAssignmentHierarchy = hasPermission(PERMISSION.ASSIGNMENT_HIERARCHY.VIEW);
    const canViewRequestHierarchy = hasPermission(PERMISSION.REQUEST_HIERARCHY.VIEW);

    const allItems: MenuItem[] = [
      {
        title: t('dashboard'),
        icon: HomeIcon,
        url: { pathname: '/admin/[tenantId]', params: { tenantId } },
        items: [],
        disabled: !canViewDashboard,
      },
      {
        title: t('requests'),
        icon: ClipboardIcon,
        url: { pathname: '/admin/[tenantId]/requests', params: { tenantId } },
        items: [],
        disabled: !canViewRequests,
      },
      {
        title: t('reports'),
        icon: ChartColumnIncreasingIcon,
        url: { pathname: '/admin/[tenantId]/reports', params: { tenantId } },
        items: [],
        disabled: !canViewReports,
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
        disabled: !canViewForms,
      },
      {
        title: t('linksAndDocuments'),
        icon: FileKey2Icon,
        items: [
          {
            title: t('dataRooms'),
            url: { pathname: '/admin/[tenantId]/links-and-documents/data-rooms', params: { tenantId } },
            icon: BuildingIcon,
            disabled: !canViewDataRooms,
          },
          {
            title: t('documents'),
            url: { pathname: '/admin/[tenantId]/links-and-documents/documents', params: { tenantId } },
            icon: FileTextIcon,
            disabled: !canViewDocuments,
          },
          {
            title: t('links'),
            url: { pathname: '/admin/[tenantId]/links-and-documents/links', params: { tenantId } },
            icon: RadioTowerIcon,
            disabled: !canViewSharedLinks,
          },
          {
            title: t('agreements'),
            url: { pathname: '/admin/[tenantId]/links-and-documents/agreements', params: { tenantId } },
            icon: ScaleIcon,
            disabled: !canViewAgreements,
          },
        ],
        disabled: !canViewDataRooms || !canViewDocuments || !canViewSharedLinks || !canViewAgreements,
      },
      {
        title: t('configuration'),
        icon: SlidersHorizontalIcon,
        items: [
          {
            title: t('areas'),
            url: { pathname: '/admin/[tenantId]/configurations/areas', params: { tenantId } },
            icon: LandPlotIcon,
            disabled: !canViewAreas,
          },
          {
            title: t('assignmentHierarchy'),
            url: {
              pathname: '/admin/[tenantId]/configurations/assignment-hierarchies',
              params: { tenantId },
            },
            icon: FolderOpenDot,
            disabled: !canViewAssignmentHierarchy,
          },
          {
            title: t('requestTypes'),
            url: { pathname: '/admin/[tenantId]/configurations/request-types', params: { tenantId } },
            icon: LayersIcon,
            disabled: !canViewRequestTypes,
          },
          {
            title: t('requestHierarchy'),
            url: {
              pathname: '/admin/[tenantId]/configurations/request-hierarchies',
              params: { tenantId },
            },
            icon: FolderOpen,
            disabled: !canViewRequestHierarchy,
          },
          {
            title: t('requirements'),
            url: { pathname: '/admin/[tenantId]/configurations/requirements', params: { tenantId } },
            icon: BookIcon,
            disabled: !canViewRequirements,
          },
          {
            title: t('requirementTypes'),
            url: { pathname: '/admin/[tenantId]/configurations/requirement-types', params: { tenantId } },
            icon: BookTypeIcon,
            disabled: !canViewRequirementTypes,
          },
          {
            title: t('priorities'),
            url: { pathname: '/admin/[tenantId]/configurations/priorities', params: { tenantId } },
            icon: TagsIcon,
            disabled: !canViewPriorities,
          },
          {
            title: t('workflows'),
            url: { pathname: '/admin/[tenantId]/configurations/workflows', params: { tenantId } },
            icon: WorkflowIcon,
            disabled: !canViewWorkflows,
          },
        ],
        disabled:
          !canViewAreas || !canViewAssignmentHierarchy || !canViewRequestTypes || !canViewRequestHierarchy || !canViewRequirements || !canViewRequirementTypes || !canViewPriorities || !canViewWorkflows,
      },
    ];

    return filterMenuItems(allItems);
  }, [t, tenantId, hasPermission]);

  const systemMain = useMemo<MenuItem[]>(() => {
    const canViewUsers = hasPermission(PERMISSION.USER_MANAGEMENT.VIEW);
    const canViewRoles = hasPermission(PERMISSION.ROLE_MANAGEMENT.VIEW);
    const canViewInvitations = hasPermission(PERMISSION.USER_MANAGEMENT.CREATE);
    const canViewIdentificationTypes = hasPermission(PERMISSION.IDENTIFICATION_TYPE.VIEW);

    const allItems: MenuItem[] = [
      {
        title: t('security'),
        icon: ShieldIcon,
        items: [
          {
            title: t('dashboard'),
            url: { pathname: '/admin/[tenantId]/security', params: { tenantId } },
            icon: RadarIcon,
            disabled: !canViewUsers || !canViewRoles,
          },
          {
            title: t('identificationTypes'),
            url: { pathname: '/admin/[tenantId]/security/identification-types', params: { tenantId } },
            icon: IdCardIcon,
            disabled: !canViewIdentificationTypes,
          },
          {
            title: t('roles'),
            url: { pathname: '/admin/[tenantId]/security/roles', params: { tenantId } },
            icon: ShieldIcon,
            disabled: !canViewRoles,
          },
          {
            title: t('users'),
            url: { pathname: '/admin/[tenantId]/security/users', params: { tenantId } },
            icon: UsersIcon,
            disabled: !canViewUsers,
          },
          {
            title: t('invitations'),
            url: { pathname: '/admin/[tenantId]/security/invitations', params: { tenantId } },
            icon: FileBadgeIcon,
            disabled: !canViewInvitations,
          },
        ],
        disabled: !canViewUsers || !canViewRoles || !canViewIdentificationTypes,
      },
      {
        title: t('settings'),
        url: { pathname: '/admin/[tenantId]/settings/account', params: { tenantId } },
        icon: SettingsIcon,
        items: [],
        disabled: false, // Settings accessible to all authenticated users
      },
      {
        title: t('help'),
        url: { pathname: '/admin/[tenantId]/help', params: { tenantId } },
        icon: MessageCircleQuestionIcon,
        items: [],
        disabled: false, // Help accessible to all authenticated users
      },
    ];

    return filterMenuItems(allItems);
  }, [t, tenantId, hasPermission]);

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TenantSwitcher isGlobalAdmin={user.isGlobalAdmin} isOnPremise={isOnPremise} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain title={t('request')} items={navMain} currentPath={pathname} />
        {/*<NavFormSubmissions tenantId={tenantId} currentPath={pathname} /> */}
        <NavMain title={t('systemTitle')} items={systemMain} currentPath={pathname} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
