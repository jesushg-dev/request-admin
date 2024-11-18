'use client';

import React, { type ComponentProps } from 'react';

import { useSelectedLayoutSegment } from 'next/navigation';
import { type IconType } from 'react-icons';

import { cn } from '@/services/lib/utils';
import { Link, type pathnames } from '@/navigation';

interface NavItemProps<Pathname extends keyof typeof pathnames> extends ComponentProps<typeof Link<Pathname>> {
  icon?: IconType;
  text: string;
}

// Adapting the function component to include your additional props
function NavItem<Pathname extends keyof typeof pathnames>({ href, icon: Icon, text, ...rest }: NavItemProps<Pathname>) {
  const selectedLayoutSegment = useSelectedLayoutSegment();
  const pathname = selectedLayoutSegment ? `${selectedLayoutSegment}` : '/';
  // eslint-disable-next-line @typescript-eslint/no-base-to-string
  const segment = href.toString().split('/').pop() || '/';
  const isActive = pathname === segment;

  return (
    <li>
      <Link
        aria-current={isActive ? 'page' : undefined}
        href={href}
        {...rest}
        className={cn(
          'text-bodydark1 hover:bg-graydark dark:hover:bg-meta-4 group relative flex items-center gap-2.5 rounded-sm px-4 py-2 duration-300 ease-in-out',
          rest.className,
          isActive ? 'bg-graydark dark:bg-meta-4' : ''
        )}>
        {rest.children}
        {Icon && <Icon />}
        {text}
      </Link>
    </li>
  );
}

export default NavItem;
