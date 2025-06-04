'use client';

import * as React from 'react';
import { Menu, Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';

import { Button } from '@/components/ui/button';
import { useSidebar } from '@/components/ui/sidebar';
import { AdvancedBreadcrumb } from '@/components/advanced-breadcrumb';
import ClientOnly from '@/components/client-only';
import LocaleSwitcherSelect from '@/components/locale-switcher-select';
import { NotificationCenter } from '@/components/notification/notification-center';
import NotificationProvider from '@/components/notification/notification-context';

interface NavbarProps {
  tenantId: string;
  userTenantId: string;
  tenants: Array<{ id: string; name: string }>;
}

const Navbar = ({ tenants = [], tenantId, userTenantId }: NavbarProps) => {
  const { setTheme, theme } = useTheme();
  const { toggleSidebar } = useSidebar();

  // Toggle theme function
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
  };

  return (
    <header className="bg-background sticky top-0 z-50 w-full border-b px-4">
      <div className="flex h-14 items-center justify-between">
        <div className="flex w-full items-center gap-2">
          <Button variant="ghost" size="icon" onClick={toggleSidebar}>
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle sidebar</span>
          </Button>
          <AdvancedBreadcrumb tenants={tenants} />
        </div>

        <div className="flex items-center gap-2">
          {/* Language Selector */}
          <LocaleSwitcherSelect />

          {/* Theme Switcher */}
          <Button variant="ghost" size="icon" onClick={toggleTheme}>
            <ClientOnly>{theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}</ClientOnly>
            <span className="sr-only">Toggle theme</span>
          </Button>

          {/* Notifications */}
          <NotificationProvider tenantId={tenantId} userTenantId={userTenantId}>
            <NotificationCenter />
          </NotificationProvider>
        </div>
      </div>
    </header>
  );
};

export { Navbar };
