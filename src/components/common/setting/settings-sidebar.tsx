// components/layouts/admin/settings-sidebar.tsx
'use client';

import { useMemo, useState } from 'react';
import { Link, usePathname } from '@/i18n/routing';
import { Bell, Building2, ChevronDown, ChevronRight, CreditCard, FolderOpen, FolderOpenDot, Key, Lock, LogOut, Mail, Monitor, Palette, Settings, Shield, ShieldCheck, User, Users } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { cn } from '@/lib/utils';
import { MenuItem } from '@/components/layouts/admin/nav-main';

interface SettingsSidebarProps {
  tenantId: string;
}

export function SettingsSidebar({ tenantId }: SettingsSidebarProps) {
  const pathname = usePathname();
  const t = useTranslations('admin.setting.sidebar');
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});

  const navMain = useMemo<MenuItem[]>(() => {
    return [
      {
        title: t('account'),
        icon: User,
        url: {
          pathname: '/admin/[tenantId]/settings/account',
          params: { tenantId },
        },
        items: [],
      },
      {
        title: t('security'),
        icon: Shield,
        items: [
          {
            title: t('password'),
            url: {
              pathname: '/admin/[tenantId]/settings/security/password',
              params: { tenantId },
            },
            icon: Lock,
          },
          {
            title: t('email'),
            url: {
              pathname: '/admin/[tenantId]/settings/security/email',
              params: { tenantId },
            },
            icon: Mail,
          },
          {
            title: t('twoFactor'),
            url: {
              pathname: '/admin/[tenantId]/settings/security/two-factor',
              params: { tenantId },
            },
            icon: ShieldCheck,
          },
          {
            title: t('sessions'),
            url: {
              pathname: '/admin/[tenantId]/settings/security/sessions',
              params: { tenantId },
            },
            icon: Users,
          },
          {
            title: t('apiKeys'),
            url: {
              pathname: '/admin/[tenantId]/settings/security/api-keys',
              params: { tenantId },
            },
            icon: Key,
          },
          {
            title: t('connectedAccounts'),
            url: {
              pathname: '/admin/[tenantId]/settings/security/connected-accounts',
              params: { tenantId },
            },
            icon: LogOut,
          },
        ],
      },
      {
        title: t('organization'),
        icon: Building2,
        items: [
          {
            title: t('organization'),
            url: {
              pathname: '/admin/[tenantId]/settings/organization',
              params: { tenantId },
            },
            icon: Building2,
          },
          {
            title: t('subscription'),
            url: {
              pathname: '/admin/[tenantId]/settings/organization/subscription',
              params: { tenantId },
            },
            icon: CreditCard,
          },
          {
            title: t('rolesAndAccess'),
            url: {
              pathname: '/admin/[tenantId]/settings/organization/roles-and-access',
              params: { tenantId },
            },
            icon: Users,
          },
          {
            title: t('person'),
            url: {
              pathname: '/admin/[tenantId]/settings/organization/person',
              params: { tenantId },
            },
            icon: User,
          },
          {
            title: t('requestHierarchy'),
            url: {
              pathname: '/admin/[tenantId]/settings/organization/request-hierarchy',
              params: { tenantId },
            },
            icon: FolderOpen,
          },
          {
            title: t('assignementHierarchy'),
            url: {
              pathname: '/admin/[tenantId]/settings/organization/assignment-hierarchy',
              params: { tenantId },
            },
            icon: FolderOpenDot,
          },
        ],
      },
      {
        title: t('preferences'),
        icon: Settings,
        items: [
          {
            title: t('appearance'),
            url: {
              pathname: '/admin/[tenantId]/settings/preferences/appearance',
              params: { tenantId },
            },
            icon: Palette,
          },
          {
            title: t('display'),
            url: {
              pathname: '/admin/[tenantId]/settings/preferences/display',
              params: { tenantId },
            },
            icon: Monitor,
          },
          {
            title: t('notifications'),
            url: {
              pathname: '/admin/[tenantId]/settings/preferences/notifications',
              params: { tenantId },
            },
            icon: Bell,
          },
        ],
      },
    ];
  }, [t, tenantId]);

  const toggleExpanded = (title: string) => {
    setExpandedItems((prev) => ({ ...prev, [title]: !prev[title] }));
  };

  const isActivePath = (urlPath: string) => {
    const resolvedPath = urlPath.replace('[tenantId]', tenantId);
    return pathname === resolvedPath;
  };

  return (
    <div className="w-64 shrink-0 border-r bg-background/50 h-full">
      <div className="px-3 py-2 overflow-hidden h-full flex flex-col gap-4">
        <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">{t('settings')}</h2>
        <div className="h-full flex-1 overflow-y-auto">
          <div className="space-y-1">
            {navMain.map((item) => {
              const hasChildren = (item.items?.length ?? 0) > 0;
              const isActive = typeof item.url === 'object' && 'pathname' in item.url ? isActivePath(item.url.pathname) : false;
              const autoExpanded = hasChildren && item.items?.some((subItem) => typeof subItem.url === 'object' && 'pathname' in subItem.url && isActivePath(subItem.url.pathname));
              const isExpanded = expandedItems[item.title] ?? autoExpanded;

              return (
                <div key={item.title} className="space-y-1">
                  {hasChildren ? (
                    <>
                      <button
                        onClick={() => toggleExpanded(item.title)}
                        className={cn('flex w-full items-center justify-between rounded-md px-3 py-2 text-sm font-medium', isActive ? 'bg-accent' : 'hover:bg-accent/50')}>
                        <div className="flex items-center">
                          {item.icon && <item.icon className="h-4 w-4 mr-2" />}
                          {item.title}
                        </div>
                        {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                      </button>

                      {isExpanded && (
                        <div className="ml-6 space-y-1 border-l pl-2">
                          {item.items?.map((subItem) => {
                            const isSubActive = typeof subItem.url === 'object' && 'pathname' in subItem.url ? isActivePath(subItem.url.pathname) : false;

                            return (
                              <Link
                                key={subItem.title}
                                href={subItem.url}
                                className={cn('flex items-center rounded-md px-3 py-2 text-sm', isSubActive ? 'font-semibold bg-accent' : 'text-muted-foreground hover:bg-accent/50')}>
                                {subItem.icon && <subItem.icon className="h-4 w-4 mr-2" />}
                                {subItem.title}
                              </Link>
                            );
                          })}
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      {item.url && (
                        <Link href={item.url} className={cn('flex w-full items-center rounded-md px-3 py-2 text-sm font-medium', isActive ? 'bg-accent' : 'hover:bg-accent/50')}>
                          {item.icon && <item.icon className="h-4 w-4 mr-2" />}
                          {item.title}
                        </Link>
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
