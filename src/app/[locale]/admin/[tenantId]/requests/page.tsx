'use client';

import React, { memo } from 'react';
import { Link } from '@/i18n/routing';
import { CircleFadingArrowUpIcon, Plus } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useQueryState } from 'nuqs';

import useTenantId from '@/hooks/use-tenant-id';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import CalendarTab from '@/components/common/request/calendar-tab';
import { KanbanTab } from '@/components/common/request/kanban-tab';
import TableTab from '@/components/common/request/table-tab';

const RequestMainPage: React.FC = () => {
  const tenantId = useTenantId();
  const t = useTranslations('admin.request.main');
  const [view, setView] = useQueryState('view', { defaultValue: 'table' });

  return (
    <Tabs defaultValue={view} onValueChange={setView} className="flex w-full flex-1 flex-col gap-4 overflow-auto p-4">
      <div className="flex w-full items-center justify-between gap-y-2 lg:flex-row">
        <TabsList className="h-8 w-full lg:w-auto">
          <TabsTrigger value="table" className="h-7 text-xs">
            Table
          </TabsTrigger>
          {/* TODO: Enable Kanban view once implementation is complete */}
          {/* <TabsTrigger value="kanban" className="h-7 text-xs">
            Kanban
          </TabsTrigger> */}
          {/* TODO: Enable Calendar view once implementation is complete */}
          {/* <TabsTrigger value="calendar" className="h-7 text-xs">
            Calendar
          </TabsTrigger> */}
        </TabsList>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link
              href={{
                pathname: '/admin/[tenantId]/requests/assign-massively',
                params: { tenantId },
              }}>
              <CircleFadingArrowUpIcon className="size-4" aria-hidden="true" />
              {t('assignMassively')}
            </Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link
              href={{
                pathname: '/admin/[tenantId]/requests/new',
                params: { tenantId },
              }}>
              <Plus className="size-4" aria-hidden="true" />
              {t('new')}
            </Link>
          </Button>
        </div>
      </div>
      <Separator orientation="horizontal" />
      <TabsContent value="table" className={`mt-0 ${view === 'table' ? 'flex flex-1' : ''}`}>
        <TableTab />
      </TabsContent>
      {/* TODO: Enable Kanban tab content once implementation is complete */}
      {/* <TabsContent value="kanban" className={`mt-0 ${view === 'kanban' ? 'flex flex-1' : ''}`}>
        <KanbanTab />
      </TabsContent> */}
      {/* TODO: Enable Calendar tab content once implementation is complete */}
      {/* <TabsContent value="calendar" className={`mt-0 ${view === 'calendar' ? 'flex flex-1' : ''}`}>
        <CalendarTab />
      </TabsContent> */}
    </Tabs>
  );
};

export default memo(RequestMainPage);
