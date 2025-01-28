'use client';

import * as React from 'react';
import { type Table } from '@tanstack/react-table';
import { Download, FileTextIcon, Loader, SheetIcon, TablePropertiesIcon, Trash2, X } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { exportTableToCSV, exportTableToExcel, exportTableToPDF } from '@/lib/export';
import { Button } from '@/components/ui/button';
import { Portal } from '@/components/ui/portal';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Kbd } from '@/components/kbd';

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';

interface DataTableFloatingBarProps<T> {
  table: Table<T>; // The table instance
  entityLabel?: string; // Singular label for the entity (e.g., "task")
  onDelete?: () => Promise<void>; // Optional delete action
}

export function DataTableFloatingBar<T>({ table, entityLabel = 'item', onDelete }: DataTableFloatingBarProps<T>) {
  const t = useTranslations('table.floating');
  const rows = table.getFilteredSelectedRowModel().rows;

  const [isPending, startTransition] = React.useTransition();
  const [action, setAction] = React.useState<'export' | 'delete'>();

  // Clear selection on Escape key press
  React.useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        table.toggleAllRowsSelected(false);
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [table]);

  return (
    <Portal>
      <div className="fixed inset-x-0 bottom-6 z-50 mx-auto w-fit px-2.5">
        <div className="w-full overflow-x-auto">
          <div className="bg-background text-foreground mx-auto flex w-fit items-center gap-2 rounded-md border p-2 shadow-sm">
            <div className="flex h-7 items-center rounded-md border border-dashed pr-1 pl-2.5">
              <span className="text-xs whitespace-nowrap">
                {rows.length} {rows.length === 1 ? entityLabel : `${entityLabel}s`} {t('selected')}
              </span>
              <Separator orientation="vertical" className="mr-1 ml-2" />
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="size-5 hover:border" onClick={() => table.toggleAllRowsSelected(false)}>
                    <X className="size-3.5 shrink-0" aria-hidden="true" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="bg-accent text-foreground flex items-center border px-2 py-1 font-semibold dark:bg-zinc-900">
                  <p className="mr-2">{t('clearSelection')}</p>
                  <Kbd abbrTitle="Escape" variant="outline">
                    Esc
                  </Kbd>
                </TooltipContent>
              </Tooltip>
            </div>
            <Separator orientation="vertical" className="hidden h-5 sm:block" />
            <div className="flex items-center gap-1.5">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="secondary" size="sm">
                    <Download className="size-4" aria-hidden="true" />
                    {t('export', { entity: entityLabel })}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem
                    className="cursor-pointer"
                    onClick={() => {
                      exportTableToCSV(table, {
                        excludeColumns: ['select', 'actions'],
                        onlySelected: true,
                      });
                    }}>
                    <TablePropertiesIcon className="size-4 mr-1" aria-hidden="true" />
                    CSV
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="cursor-pointer"
                    onClick={() => {
                      exportTableToExcel(table, {
                        excludeColumns: ['select', 'actions'],
                        onlySelected: true,
                      });
                    }}>
                    <SheetIcon className="size-4 mr-1" aria-hidden="true" />
                    Excel
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="cursor-pointer"
                    onClick={() => {
                      exportTableToPDF(table, {
                        excludeColumns: ['select', 'actions'],
                        onlySelected: true,
                      });
                    }}>
                    <FileTextIcon className="size-4 mr-1" aria-hidden="true" />
                    PDF
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              {onDelete && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="secondary"
                      size="icon"
                      className="size-7 border"
                      onClick={() => {
                        setAction('delete');

                        startTransition(async () => {
                          await onDelete();
                          table.toggleAllRowsSelected(false);
                        });
                      }}
                      disabled={isPending}>
                      {isPending && action === 'delete' ? <Loader className="size-3.5 animate-spin" aria-hidden="true" /> : <Trash2 className="size-3.5" aria-hidden="true" />}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="bg-accent text-foreground border font-semibold dark:bg-zinc-900">
                    <p>{t('delete', { entity: entityLabel })}</p>
                  </TooltipContent>
                </Tooltip>
              )}
            </div>
          </div>
        </div>
      </div>
    </Portal>
  );
}
