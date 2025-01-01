'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { defaultLocale, getSiblingRoutes, IsExistingRoute, Locale } from '@/i18n/routing';
import { ChevronDown, ChevronsRight } from 'lucide-react';
import { useLocale } from 'next-intl';

import { useResolvedUrl } from '@/hooks/use-resolved-url';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

interface Tenant {
  id: string;
  name: string;
}

interface AdvancedBreadcrumbProps {
  tenants?: Tenant[];
}

interface BreadcrumbItem {
  href: string;
  label: string;
  localeHref: string;
  IsExistingRoute: boolean;
  siblings?: BreadcrumbItem[];
}

export function AdvancedBreadcrumb({ tenants = [] }: AdvancedBreadcrumbProps) {
  const locale = useLocale() as Locale;

  const { bracketedPath, resolvedUrl, getParam } = useResolvedUrl();
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([]);

  function resolveDynamicSegmentLabel(resolvedSegment: string, bracketedSegment: string, tenants: Tenant[]): string {
    let label: string;

    switch (bracketedSegment) {
      case '[tenantId]':
        const matched = tenants.find((t) => t.id === resolvedSegment);
        label = matched ? matched.name : resolvedSegment;
        break;
      default:
        label = resolvedSegment;
        break;
    }

    // Format the label to be user-friendly
    return label.charAt(0).toUpperCase() + label.slice(1).replace(/-/g, ' ');
  }

  function buildResolvedPath(routeKey: string): string {
    const parts = routeKey.split('/').filter(Boolean); // Split path into non-empty segments

    const replaced = parts
      .map((part) => {
        if (part.startsWith('[') && part.endsWith(']')) {
          const key = part.slice(1, -1); // Remove brackets to get the key
          return getParam(key) || part; // Replace dynamic segment or keep original
        }
        return part; // Keep static segment
      })
      .join('/');

    if (replaced.includes('[') || replaced.includes(']')) return ''; // Unresolved dynamic segments

    // Add locale prefix unless it's the default locale
    const localePrefix = locale !== defaultLocale ? `/${locale}` : '';
    return `${localePrefix}/${replaced}`;
  }

  useEffect(() => {
    const resolvedPathSegments = resolvedUrl.split('/').filter(Boolean);
    const bracketedPathSegments = bracketedPath.split('/').filter(Boolean);

    let currentResolvedPath = '';
    let currentBracketedPath = '';
    const builtCrumbs: BreadcrumbItem[] = [];

    const buildSiblingCrumbs = (siblingRoutes: string[]): BreadcrumbItem[] => {
      return siblingRoutes.map((sibling) => {
        const siblingResolvedPath = buildResolvedPath(sibling);

        // Extract the last segment for label resolution
        const siblingLabel = sibling.split('/').filter(Boolean).pop() || '';
        const siblingResolvedLabel = siblingResolvedPath.split('/').filter(Boolean).pop() || '';

        return {
          label: resolveDynamicSegmentLabel(siblingResolvedLabel, siblingLabel, tenants),
          href: siblingResolvedPath,
          localeHref: sibling,
          IsExistingRoute: IsExistingRoute(sibling),
        };
      });
    };

    for (let i = 0; i < bracketedPathSegments.length; i++) {
      currentBracketedPath += `/${bracketedPathSegments[i]}`;
      currentResolvedPath += `/${resolvedPathSegments[i]}`;

      const isTheLast = i === bracketedPathSegments.length - 1;
      const label = resolveDynamicSegmentLabel(resolvedPathSegments[i] ?? '', bracketedPathSegments[i] ?? '', tenants);
      const siblingRoutes = getSiblingRoutes(currentBracketedPath, locale, isTheLast);
      const siblingCrumbs = buildSiblingCrumbs(siblingRoutes);

      builtCrumbs.push({
        label,
        siblings: siblingCrumbs,
        localeHref: currentBracketedPath,
        href: buildResolvedPath(currentResolvedPath),
        IsExistingRoute: IsExistingRoute(currentBracketedPath),
      });
    }

    setBreadcrumbs(builtCrumbs);
  }, [resolvedUrl, bracketedPath, tenants, locale]);

  return (
    <nav className="flex items-center space-x-1 text-sm font-medium">
      {breadcrumbs.map((crumb, index) => {
        const isLast = index === breadcrumbs.length - 1;

        if (!crumb.IsExistingRoute) {
          return (
            <React.Fragment key={index}>
              {index > 0 && <ChevronsRight className="h-4 w-4 text-muted-foreground" />}
              <span className="text-muted-foreground">{crumb.label}</span>
            </React.Fragment>
          );
        }

        // If we cannot fully build a stable link, we just show text (fallback)
        if (crumb.href.includes('[') && crumb.href.includes(']')) {
          return (
            <React.Fragment key={index}>
              {index > 0 && <ChevronsRight className="h-4 w-4" />}
              <span className="text-muted-foreground">{crumb.label}</span>
            </React.Fragment>
          );
        }

        // If it has siblings, show them in a dropdown
        if (crumb.siblings && crumb.siblings.length > 0) {
          return (
            <React.Fragment key={index}>
              {index > 0 && <ChevronsRight className="h-4 w-4" />}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="link" className="gap-1 p-0 font-normal">
                    {crumb.label}
                    <ChevronDown className="h-2 w-2 text-muted-foreground" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  {crumb.siblings.map((sibling) => (
                    <DropdownMenuItem key={sibling.href} asChild>
                      <Link href={sibling.href}>{sibling.label}</Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </React.Fragment>
          );
        }

        // If no siblings, it's just a normal link or the final crumb
        return (
          <React.Fragment key={index}>
            {index > 0 && <ChevronsRight className="h-4 w-4" />}
            {isLast ? (
              <span className="text-muted-foreground">{crumb.label}</span>
            ) : (
              <Link href={crumb.href} className="hover:underline">
                {crumb.label}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}
