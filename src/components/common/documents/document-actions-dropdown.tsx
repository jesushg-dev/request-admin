'use client';

import { Link } from '@/i18n/routing';
import { Edit, MoreHorizontal, Trash2, Upload } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

interface DocumentActionsDropdownProps {
  documentId: string;
  tenantId: string;
  canEdit: boolean;
  canDelete: boolean;
}

export function DocumentActionsDropdown({ documentId, tenantId, canEdit, canDelete }: DocumentActionsDropdownProps) {
  const t = useTranslations('admin.document.view.dropdown');

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button aria-label={t('actions')} variant="ghost" size="icon">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>{t('actions')}</DropdownMenuLabel>
        {canEdit && (
          <DropdownMenuGroup>
            <DropdownMenuItem asChild>
              <Link
                className="flex gap-2"
                href={{
                  pathname: '/admin/[tenantId]/links-and-documents/documents/[slug]/edit',
                  params: { tenantId, slug: documentId },
                }}>
                <Edit className="size-4" />
                {t('edit_document')}
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link
                className="flex gap-2"
                href={{
                  pathname: '/admin/[tenantId]/links-and-documents/documents/[slug]/upload-version',
                  params: { tenantId, slug: documentId },
                }}>
                <Upload className="size-4" />
                {t('uploadNewVersion')}
              </Link>
            </DropdownMenuItem>
          </DropdownMenuGroup>
        )}
        {canDelete && (
          <>
            {canEdit && <DropdownMenuSeparator />}
            <DropdownMenuItem>
              <Trash2 className="mr-2 h-4 w-4 text-destructive" />
              <span className="text-destructive">{t('deleteDocument')}</span>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
