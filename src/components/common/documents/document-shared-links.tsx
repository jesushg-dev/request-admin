'use client';

import { useTransition } from 'react';
import { useFindManyLink, useUpdateLink } from '@/services/api/hooks';
import { format } from 'date-fns';
import { Copy, Download, ExternalLink, FileText, Image, LinkIcon, Lock, Mail, MoreHorizontal, Settings, Shield, Trash2, Users } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { EmptyCard } from '@/components/uploader/empty-card';

interface DocumentSharedLinksProps {
  documentId: string;
}

export function DocumentSharedLinks({ documentId }: DocumentSharedLinksProps) {
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
  const [pending, startTransition] = useTransition();
  const t = useTranslations('admin.document.view.sharedLinks');

  const handleArchiveLink = (id: string, archive: boolean) => {
    startTransition(async () => {
      const promise = update({ data: { isArchived: archive }, where: { id } });
      toast.promise(promise, {
        loading: t('toast.progress'),
        success: t('toast.success'),
        error: (error) => t('toast.error', { error: error.message }),
      });
    });
  };

  const handleCopyLink = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success(t('toast.copy_success'));
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
            <div key={link.id} className={`flex flex-col md:flex-row md:items-center justify-between p-4 border rounded-lg ${link.isArchived ? 'opacity-70 bg-muted/20' : ''}`}>
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
                <div className="flex items-center mt-1">
                  <span className="text-sm text-muted-foreground truncate max-w-[300px]">{link.url}</span>
                  <Button variant="ghost" size="icon" className="h-6 w-6 ml-1" onClick={() => handleCopyLink(link.url ?? '')}>
                    <Copy className="h-3 w-3" />
                  </Button>
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
                <Button variant="outline" size="sm" asChild>
                  <a href={link.url ?? ''} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="mr-2 h-3 w-3" />
                    {t('actions.open')}
                  </a>
                </Button>
                <Button variant="outline" size="sm">
                  <Settings className="mr-2 h-3 w-3" />
                  {t('actions.edit')}
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>{t('dropdown.actions')}</DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => handleCopyLink(link.url ?? '')}>
                      <Copy className="mr-2 h-4 w-4" />
                      {t('dropdown.copy')}
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Settings className="mr-2 h-4 w-4" />
                      {t('dropdown.settings')}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem disabled={pending} onClick={() => handleArchiveLink(link.id, !link.isArchived)}>
                      <LinkIcon className="mr-2 h-4 w-4" />
                      {pending ? t('dropdown.saving') : link.isArchived ? t('dropdown.unarchive') : t('dropdown.archive')}
                    </DropdownMenuItem>

                    <DropdownMenuItem className="text-destructive">
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
