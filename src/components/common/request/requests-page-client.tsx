'use client';

import React, { memo } from 'react';
import { Link } from '@/i18n/routing';
import { CircleFadingArrowUpIcon, Plus } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useQueryState } from 'nuqs';

import { useTenantContext } from '@/components/hoc/tenant-provider';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import CalendarTab from '@/components/common/request/calendar-tab';
import { KanbanTab } from '@/components/common/request/kanban-tab';
import TableTab from '@/components/common/request/table-tab';

interface RequestsPageClientProps {
  canCreate: boolean;
  canAssign: boolean;
}

const RequestsPageClient: React.FC<RequestsPageClientProps> = ({ canCreate, canAssign }) => {
  const { tenantId } = useTenantContext();
  const t = useTranslations('admin.request.main');
  const tRoleErrors = useTranslations('system.roleGate.errors');
  const [view, setView] = useQueryState('view', { defaultValue: 'table' });

  return (
    <Tabs defaultValue={view} onValueChange={setView} className="flex w-full flex-1 flex-col gap-4 overflow-auto p-4">
      <div className="flex w-full items-center justify-between gap-y-2 lg:flex-row">
        <TabsList className="h-8 w-full lg:w-auto">
          <TabsTrigger value="table" className="h-7 text-xs">
            {t('tabs.table')}
          </TabsTrigger>
          <TabsTrigger value="kanban" className="h-7 text-xs">
            {t('tabs.kanban')}
          </TabsTrigger>
          <TabsTrigger value="calendar" className="h-7 text-xs">
            {t('tabs.calendar')}
          </TabsTrigger>
        </TabsList>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" asChild disabled={!canAssign} title={!canAssign ? tRoleErrors('noPermission') : undefined} aria-disabled={!canAssign}>
            <Link
              href={{
                pathname: '/admin/[tenantId]/requests/assign-massively',
                params: { tenantId },
              }}>
              <CircleFadingArrowUpIcon className="size-4" aria-hidden="true" />
              {t('assignMassively')}
            </Link>
          </Button>
          <Button variant="outline" size="sm" asChild disabled={!canCreate} title={!canCreate ? tRoleErrors('noPermission') : undefined} aria-disabled={!canCreate}>
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
      <TabsContent value="kanban" className={`mt-0 ${view === 'kanban' ? 'flex flex-1' : ''}`}>
        <KanbanTab />
      </TabsContent> 
      <TabsContent value="calendar" className={`mt-0 ${view === 'calendar' ? 'flex flex-1' : ''}`}>
        <CalendarTab />
      </TabsContent>
    </Tabs>
  );
};

export default memo(RequestsPageClient);

