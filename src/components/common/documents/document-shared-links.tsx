'use client';

import { useTransition } from 'react';
import { useFindManyLink, useUpdateLink, useDeleteLink } from '@/services/api/hooks';
import { format } from 'date-fns';
import { Copy, Download, ExternalLink, FileText, Image, LinkIcon, Lock, Mail, MoreHorizontal, Settings, Shield, Trash2, Users } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { Link } from '@/i18n/routing';
import { useTenantContext } from '@/components/hoc/tenant-provider';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { EmptyCard } from '@/components/uploader/empty-card';

interface DocumentSharedLinksProps {
  documentId: string;
}

export function DocumentSharedLinks({ documentId }: DocumentSharedLinksProps) {
  const { tenantId } = useTenantContext();
  const { data: links = [], isLoading } = useFindManyLink({
    include: {
      agreement: {
        select: { name: true },
      },
      group: true,
      _count: {
        select: { views: true },
      },
    },
    where: { documentId },
    orderBy: { createdAt: 'desc' },
  });

  const { mutateAsync: update } = useUpdateLink();
  const { mutateAsync: deleteLink } = useDeleteLink();
  const [pending, startTransition] = useTransition();
  const t = useTranslations('admin.document.view.sharedLinks');

  const handleArchiveLink = (id: string, archive: boolean) => {
    startTransition(async () => {
      try {
        const promise = update({ data: { isArchived: archive }, where: { id, tenantId } });
      toast.promise(promise, {
        loading: t('toast.progress'),
        success: t('toast.success'),
        error: (error) => t('toast.error', { error: error.message }),
      });
      } catch (error) {
        toast.error(t('toast.error', { error: error instanceof Error ? error.message : 'Unknown error' }));
      }
    });
  };

  const getPublicUrl = (slug: string | null) => {
    if (!slug) return '';
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    return `${origin}/l/${slug}`;
  };

  const handleCopyLink = (slug: string | null) => {
    if (!slug) {
      toast.error('Link does not have a valid slug. Please update the link.');
      return;
    }
    const url = getPublicUrl(slug);
    if (url) {
    navigator.clipboard.writeText(url);
    toast.success(t('toast.copy_success'));
    } else {
      toast.error('Failed to generate URL');
    }
  };

  const handleDeleteLink = (id: string) => {
    if (!confirm('Are you sure you want to delete this link? This action cannot be undone.')) {
      return;
    }

    startTransition(async () => {
      try {
        const promise = deleteLink({ where: { id, tenantId } });
        toast.promise(promise, {
          loading: 'Deleting link...',
          success: 'Link deleted successfully',
          error: (error) => `Failed to delete link: ${error.message}`,
        });
      } catch (error) {
        toast.error(`Failed to delete link: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="flex animate-pulse gap-4 p-4 border rounded-lg">
            <div className="flex-1 space-y-2 py-1">
              <div className="h-4 w-1/2 rounded bg-muted"></div>
              <div className="h-3 w-3/4 rounded bg-muted"></div>
              <div className="h-3 w-1/3 rounded bg-muted"></div>
            </div>
            <div className="h-8 w-24 rounded bg-muted"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <>
      {links.length === 0 ? (
        <EmptyCard title={t('empty_state.title')} description={t('empty_state.description')} />
      ) : (
        <div className="flex flex-col gap-4 overflow-y-auto">
          {links.map((link) => (
            <div
              key={link.id}
              className={`flex flex-col md:flex-row md:items-center justify-between p-4 border rounded-lg transition-all hover:shadow-md ${
                link.isArchived ? 'opacity-70 bg-muted/20' : 'bg-card'
              }`}>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{link.name}</span>
                  {link.isArchived && <Badge variant="outline">{t('badges.archived')}</Badge>}
                  {link.audienceType !== 'GENERAL' && (
                    <Badge variant="outline" className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {link.group?.name || t(`audience.${link.audienceType.toLowerCase() as 'general' | 'specific'}`)}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center mt-1 gap-2">
                  {link.slug ? (
                    <>
                      <span className="text-sm text-muted-foreground truncate max-w-[300px] font-mono">
                        {getPublicUrl(link.slug)}
                      </span>
                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleCopyLink(link.slug)}>
                    <Copy className="h-3 w-3" />
                  </Button>
                    </>
                  ) : (
                    <span className="text-sm text-muted-foreground italic">
                      No public URL available. Please update the link to generate a slug.
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {link.password && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Badge variant="outline" className="flex items-center gap-1">
                            <Lock className="h-3 w-3" />
                          </Badge>
                        </TooltipTrigger>
                        <TooltipContent>{t('tooltips.password')}</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                  {link.emailProtected && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Badge variant="outline" className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                          </Badge>
                        </TooltipTrigger>
                        <TooltipContent>{t('tooltips.email')}</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                  {link.emailAuthenticated && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Badge variant="outline" className="flex items-center gap-1">
                            <Mail className="h-3 w-3" /> {t('tooltips.verified')}
                          </Badge>
                        </TooltipTrigger>
                        <TooltipContent>{t('tooltips.email_verified')}</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                  {link.enableScreenshotProtection && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Badge variant="outline" className="flex items-center gap-1">
                            <Shield className="h-3 w-3" />
                          </Badge>
                        </TooltipTrigger>
                        <TooltipContent>{t('tooltips.screenshot')}</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                  {link.enableWatermark && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Badge variant="outline" className="flex items-center gap-1">
                            <Image className="h-3 w-3" />
                          </Badge>
                        </TooltipTrigger>
                        <TooltipContent>{t('tooltips.watermark')}</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                  {link.enableAgreement && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Badge variant="outline" className="flex items-center gap-1">
                            <FileText className="h-3 w-3" />
                          </Badge>
                        </TooltipTrigger>
                        <TooltipContent>{t('tooltips.agreement', { agreement: link.agreement?.name ?? '' })}</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                  {link.allowDownload && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Badge variant="outline" className="flex items-center gap-1">
                            <Download className="h-3 w-3" />
                          </Badge>
                        </TooltipTrigger>
                        <TooltipContent>{t('tooltips.download')}</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </div>
                <div className="text-xs text-muted-foreground mt-2 flex flex-wrap gap-x-4">
                  <span>{t('created', { date: format(link.createdAt, 'MMM d, yyyy') })}</span>
                  {link.expiresAt && <span>{t('expires', { date: format(link.expiresAt, 'MMM d, yyyy') })}</span>}
                  <span>{t('views', { count: link._count.views })}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-3 md:mt-0">
                {link.slug && (
                <Button variant="outline" size="sm" asChild>
                    <a href={getPublicUrl(link.slug)} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="mr-2 h-3 w-3" />
                    {t('actions.open')}
                  </a>
                </Button>
                )}
                <Button variant="outline" size="sm" asChild>
                  <Link href={{ pathname: '/admin/[tenantId]/links-and-documents/links/[slug]/edit', params: { tenantId, slug: link.id } }}>
                  <Settings className="mr-2 h-3 w-3" />
                  {t('actions.edit')}
                  </Link>
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>{t('dropdown.actions')}</DropdownMenuLabel>
                    {link.slug && (
                      <DropdownMenuItem onClick={() => handleCopyLink(link.slug)}>
                      <Copy className="mr-2 h-4 w-4" />
                      {t('dropdown.copy')}
                    </DropdownMenuItem>
                    )}
                    <DropdownMenuItem asChild>
                      <Link href={{ pathname: '/admin/[tenantId]/links-and-documents/links/[slug]/edit', params: { tenantId, slug: link.id } }} className="flex items-center">
                      <Settings className="mr-2 h-4 w-4" />
                      {t('dropdown.settings')}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem disabled={pending} onClick={() => handleArchiveLink(link.id, !link.isArchived)}>
                      <LinkIcon className="mr-2 h-4 w-4" />
                      {pending ? t('dropdown.saving') : link.isArchived ? t('dropdown.unarchive') : t('dropdown.archive')}
                    </DropdownMenuItem>

                    <DropdownMenuItem className="text-destructive" onClick={() => handleDeleteLink(link.id)}>
                      <Trash2 className="mr-2 h-4 w-4" />
                      {t('dropdown.delete')}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
