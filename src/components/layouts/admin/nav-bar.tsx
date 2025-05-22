'use client';

import * as React from 'react';
import { Bell, Menu, Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';

import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useSidebar } from '@/components/ui/sidebar';
import { AdvancedBreadcrumb } from '@/components/advanced-breadcrumb';
import ClientOnly from '@/components/client-only';
import LocaleSwitcherSelect from '@/components/locale-switcher-select';

// Sample notifications
const notifications = [
  {
    id: 1,
    title: 'New Request',
    description: 'A new request has been submitted',
    time: '5m ago',
  },
  {
    id: 2,
    title: 'System Update',
    description: 'System maintenance scheduled for tonight',
    time: '1h ago',
  },
];

interface NavbarProps {
  tenants: Array<{ id: string; name: string }>;
}

const Navbar = ({ tenants = [] }: NavbarProps) => {
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
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                {notifications.length > 0 && (
                  <span className="absolute top-1 right-1 flex h-2 w-2">
                    <span className="bg-primary absolute inline-flex h-full w-full animate-ping rounded-full opacity-75"></span>
                    <span className="bg-primary relative inline-flex h-2 w-2 rounded-full"></span>
                  </span>
                )}
                <span className="sr-only">Notifications</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel>Notifications</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {notifications.map((notification) => (
                <DropdownMenuItem key={notification.id} className="flex flex-col items-start">
                  <div className="flex w-full justify-between">
                    <span className="font-medium">{notification.title}</span>
                    <span className="text-muted-foreground text-xs">{notification.time}</span>
                  </div>
                  <p className="text-muted-foreground text-sm">{notification.description}</p>
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem className="w-full text-center font-medium">View all notifications</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export { Navbar };
