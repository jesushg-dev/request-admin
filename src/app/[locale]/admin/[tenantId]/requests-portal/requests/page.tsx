'use client';

import React, { memo } from 'react';
import { Link } from '@/i18n/routing';
import { Plus } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useQueryState } from 'nuqs';

import useTenantId from '@/hooks/use-tenant-id';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import CalendarTab from '@/components/common/request/calendar-tab';
import TableTab from '@/components/common/request/table-tab';
import KanbanBoard from '@/components/kanban/kanban-board';

const RequestMainPage: React.FC = () => {
  const tenantId = useTenantId();
  const t = useTranslations('admin.request.main');
  const [view, setView] = useQueryState('main-request-view', { defaultValue: 'table' });

  return (
    <Tabs defaultValue={view} onValueChange={setView} className="flex w-full flex-1 flex-col gap-4 overflow-auto p-4">
      <div className="flex w-full items-center justify-between gap-y-2 lg:flex-row">
        <TabsList className="h-8 w-full lg:w-auto">
          <TabsTrigger value="table" className="h-7 text-xs">
            Table
          </TabsTrigger>
          <TabsTrigger value="kanban" className="h-7 text-xs">
            Kanban
          </TabsTrigger>
          <TabsTrigger value="calendar" className="h-7 text-xs">
            Calendar
          </TabsTrigger>
        </TabsList>
        <Button variant="outline" size="sm" className="gap-2" asChild>
          <Link
            href={{
              pathname: '/admin/[tenantId]/requests-portal/requests/new',
              params: { tenantId },
            }}>
            <Plus className="size-4" aria-hidden="true" />
            {t('new')}
          </Link>
        </Button>
      </div>
      <Separator orientation="horizontal" />
      <TabsContent value="table" className={`mt-0 ${view === 'table' ? 'flex flex-1' : ''}`}>
        <TableTab />
      </TabsContent>
      <TabsContent value="kanban" className={`mt-0 ${view === 'kanban' ? 'flex flex-1' : ''}`}>
        <KanbanBoard />
      </TabsContent>
      <TabsContent value="calendar" className={`mt-0 ${view === 'calendar' ? 'flex flex-1' : ''}`}>
        <CalendarTab />
      </TabsContent>
    </Tabs>
  );
};

export default memo(RequestMainPage);
