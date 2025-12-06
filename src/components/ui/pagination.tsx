'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export interface PaginationProps {
  currentPage: number;
  setCurrentPage: (page: number) => void;
  itemsPerPage: number;
  setItemsPerPage: (count: number) => void;
  totalItems: number;
  pageSizeOptions?: number[];
  translationKey?: string;
  t?: ReturnType<typeof useTranslations>;
  showPageSizeSelector?: boolean;
  maxVisiblePages?: number;
  className?: string;
}

export function Pagination({
  currentPage,
  setCurrentPage,
  itemsPerPage,
  setItemsPerPage,
  totalItems,
  pageSizeOptions = [5, 10, 20, 50],
  translationKey,
  t,
  showPageSizeSelector = true,
  maxVisiblePages = 5,
  className = '',
}: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));

  // Calculate which page numbers to show
  const getVisiblePages = () => {
    if (totalPages <= maxVisiblePages) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    if (currentPage <= Math.ceil(maxVisiblePages / 2)) {
      // Show first pages
      return Array.from({ length: maxVisiblePages }, (_, i) => i + 1);
    }

    if (currentPage >= totalPages - Math.floor(maxVisiblePages / 2)) {
      // Show last pages
      return Array.from({ length: maxVisiblePages }, (_, i) => totalPages - maxVisiblePages + i + 1);
    }

    // Show pages around current
    const start = currentPage - Math.floor(maxVisiblePages / 2);
    return Array.from({ length: maxVisiblePages }, (_, i) => start + i);
  };

  const visiblePages = getVisiblePages();
  const start = (currentPage - 1) * itemsPerPage + 1;
  const end = Math.min(currentPage * itemsPerPage, totalItems);

  // Get pagination text
  const getPaginationText = () => {
    if (t && translationKey) {
      return t(translationKey, {
        start,
        end,
        total: totalItems,
        defaultValue: 'Showing {start} - {end} of {total}',
      });
    }
    return `Showing ${start} - ${end} of ${totalItems}`;
  };

  return (
    <div className={`flex items-center justify-between ${className}`}>
      <div className="flex items-center gap-2">
        {t && (
          <p className="text-sm text-muted-foreground">{getPaginationText()}</p>
        )}
        {showPageSizeSelector && (
          <Select
            value={itemsPerPage.toString()}
            onValueChange={(value) => {
              setItemsPerPage(Number(value));
              setCurrentPage(1);
            }}>
            <SelectTrigger className="w-[100px]">
              <SelectValue placeholder={itemsPerPage.toString()} />
            </SelectTrigger>
            <SelectContent>
              {pageSizeOptions.map((size) => (
                <SelectItem key={size} value={size.toString()}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>
      <div className="flex items-center gap-1">
        <Button variant="outline" size="icon" onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage === 1}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="flex items-center gap-1">
          {visiblePages.map((page) => (
            <Button
              key={page}
              variant={currentPage === page ? 'default' : 'outline'}
              size="icon"
              className="h-8 w-8"
              onClick={() => setCurrentPage(page)}>
              {page}
            </Button>
          ))}
        </div>
        <Button variant="outline" size="icon" onClick={() => setCurrentPage(currentPage + 1)} disabled={currentPage === totalPages}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

