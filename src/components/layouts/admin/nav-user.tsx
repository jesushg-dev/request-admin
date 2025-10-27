'use client';

import { logout } from '@/actions/logout';
import { Link } from '@/i18n/routing';
import { BadgeCheck, Bell, ChevronsUpDown, CreditCard, LogOut, Sparkles } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from '@/components/ui/sidebar';
import { useTenantContext } from '@/components/hoc/tenant-provider';

export function NavUser({
  user,
}: {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}) {
  const { isMobile } = useSidebar();
  const { tenantId } = useTenantContext();
  const t = useTranslations('admin.sidebar.user');

  const onLogout = () => {
    logout();
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton size="lg" className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground">
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage src={user.image || undefined} alt={user.name ?? t('avatarAlt')} style={{ objectFit: 'contain', objectPosition: 'center' }} />
                <AvatarFallback className="rounded-lg"> {getAvatarFallback(user.name)}</AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">{user.name ?? t('noName')}</span>
                <span className="truncate text-xs">{user.email ?? t('noEmail')}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg" side={isMobile ? 'bottom' : 'right'} align="end" sideOffset={4}>
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={user.image || undefined} alt={user.name ?? t('avatarAlt')} style={{ objectFit: 'contain', objectPosition: 'center' }} />
                  <AvatarFallback className="rounded-lg"> {getAvatarFallback(user.name)}</AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">{user.name ?? t('noName')}</span>
                  <span className="truncate text-xs">{user.email ?? t('noEmail')}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {/* <DropdownMenuGroup>
              <DropdownMenuItem>
                <Sparkles />
                {t('upgrade')}
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem asChild>
                <Link href={{ pathname: '/admin/[tenantId]/settings/account', params: { tenantId } }}>
                  <BadgeCheck />
                  {t('account')}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={{ pathname: '/admin/[tenantId]/settings/organization/subscription', params: { tenantId } }}>
                  <CreditCard />
                  {t('billing')}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={{ pathname: '/admin/[tenantId]/notifications', params: { tenantId } }}>
                  <Bell />
                  {t('notifications')}
                </Link>
              </DropdownMenuItem>
            </DropdownMenuGroup>*/}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onLogout}>
              <LogOut />
              {t('logout')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

const getAvatarFallback = (name?: string | null) => {
  if (!name) return 'RA'; // Default fallback
  const nameParts = name.trim().split(' '); // Split the name by spaces
  return nameParts.length > 1
    ? `${nameParts[0]?.[0] ?? ''}${nameParts[1]?.[0] ?? ''}`.toUpperCase() // Use initials of the first and last name
    : (nameParts[0]?.[0] ?? '').toUpperCase(); // Use the first letter of the single name
};
