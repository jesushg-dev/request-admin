'use client';

import type { ComponentProps } from 'react';

interface ExternalWebsiteLinkProps extends Omit<ComponentProps<'span'>, 'onClick'> {
  href: string;
}

export function ExternalWebsiteLink({ href, className, children, ...props }: ExternalWebsiteLinkProps) {
  const handleClick = (e: React.MouseEvent<HTMLSpanElement>) => {
    e.stopPropagation();
    e.preventDefault();
    window.open(href, '_blank', 'noopener,noreferrer');
  };

  return (
    <span
      role="link"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          e.stopPropagation();
          window.open(href, '_blank', 'noopener,noreferrer');
        }
      }}
      className={`cursor-pointer ${className ?? ''}`}
      {...props}
    >
      {children}
    </span>
  );
}

