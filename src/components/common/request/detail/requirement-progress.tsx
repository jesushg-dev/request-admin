'use client';

import { useEffect, useState, useTransition } from 'react';
import { useFindManyRequirementComplianceTracking, useUpdateManyRequirementComplianceTracking } from '@/services/api/hooks';
import { Filter, SaveAllIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import Select from '@/components/custom-ui/select';
import { Hint } from '@/components/hint';
import EmptyState from '@/components/shared/empty-state';

const filterOptions = [
  { value: 'all', label: 'All' },
  { value: 'selected', label: 'Selected' },
  { value: 'unselected', label: 'Unselected' },
];

interface RequirementProgressProps {
  tenantId: string;
  requestId: string;
}

export default function RequirementProgress({ tenantId, requestId }: RequirementProgressProps) {
  const t = useTranslations('admin.request.view.requirements');

  const [filterOption, setFilterOption] = useState(filterOptions[0]);
  const [isPending, startTransition] = useTransition();
  const [localCompliances, setLocalCompliances] = useState<Record<string, boolean>>({});
  const [originalCompliances, setOriginalCompliances] = useState<Record<string, boolean>>({});

  const { data: requirementsData, isLoading } = useFindManyRequirementComplianceTracking({
    select: {
      id: true,
      isFulfilled: true,
      requirement: { select: { id: true, name: true, description: true } },
    },
    where: { tenantId, requestId },
  });

  const { mutateAsync: updateCompliances } = useUpdateManyRequirementComplianceTracking();

  useEffect(() => {
    if (requirementsData) {
      const initialCompliances = requirementsData.reduce(
        (acc, item) => {
          acc[item.requirement.id] = item.isFulfilled;
          return acc;
        },
        {} as Record<string, boolean>
      );

      setLocalCompliances(initialCompliances);
      setOriginalCompliances(initialCompliances);
    }
  }, [requirementsData]);

  const handleCheckboxChange = (requirementId: string, checked: boolean) => {
    setLocalCompliances((prev) => ({
      ...prev,
      [requirementId]: checked,
    }));
  };

  const handleSave = async () => {
    startTransition(async () => {
      try {
        const changes = Object.entries(localCompliances).filter(([key, val]) => val !== originalCompliances[key]);

        if (changes.length === 0) {
          toast.info(t('noChangesToSave'));
          return;
        }

        const compliant = changes.filter(([, val]) => val).map(([key]) => key);
        const nonCompliant = changes.filter(([, val]) => !val).map(([key]) => key);

        const promises = Promise.all([
          compliant.length > 0 &&
            updateCompliances({
              data: { isFulfilled: true },
              where: { tenantId, requestId, requirementId: { in: compliant } },
            }),
          nonCompliant.length > 0 &&
            updateCompliances({
              data: { isFulfilled: false },
              where: { tenantId, requestId, requirementId: { in: nonCompliant } },
            }),
        ]);

        toast.promise(promises, {
          loading: t('savingChanges'),
          success: () => {
            setOriginalCompliances(localCompliances);
            return t('changesSavedSuccessfully');
          },
          error: t('failedToSaveChanges'),
        });
      } catch (error) {
        toast.error(t('failedToSaveChanges'));
        console.error('Error saving compliances:', error);
        setLocalCompliances(originalCompliances);
      }
    });
  };

  const handleSelectAll = () => {
    const allChecked = Object.values(localCompliances).every(Boolean);
    const newState = Object.keys(localCompliances).reduce((acc, key) => ({ ...acc, [key]: !allChecked }), {});
    setLocalCompliances(newState);
  };

  const filteredRequirements = requirementsData
    ?.filter((req) => {
      if (filterOption.value === 'selected') return localCompliances[req.requirement.id];
      if (filterOption.value === 'unselected') return !localCompliances[req.requirement.id];
      return true;
    })
    ?.map((req) => ({
      id: req.requirement.id,
      name: req.requirement.name,
      description: req.requirement.description,
    }));

  const completionStats = Object.values(localCompliances).reduce(
    (acc, val) => {
      if (val) {
        acc.completed++;
      } else {
        acc.pending++;
      }
      return acc;
    },
    { completed: 0, pending: 0 }
  );

  const progress = (completionStats.completed / (requirementsData?.length || 1)) * 100;

  if (isLoading) return <RequirementProgressPlaceholder />;
  if (!requirementsData || requirementsData.length === 0) {
    return <EmptyState title={t('noRequirementsAvailable')} description={t('noRequirementsFoundForThisRequest')} />;
  }

  return (
    <Card className="flex-1 flex flex-col overflow-hidden">
      <CardHeader>
        <div className="flex justify-between items-start gap-4 flex-wrap">
          <div className="space-y-1">
            <CardTitle>
              {t('totalRequirements')} ({completionStats.completed}/{requirementsData.length})
            </CardTitle>
            <CardDescription className="flex gap-2 items-center">
              <span>{t('trackProgress')}</span>
              <span className="text-primary">·</span>
              <span className="text-emerald-600">
                {completionStats.completed} {t('completed')}
              </span>
              <span className="text-primary">·</span>
              <span className="text-amber-600">
                {completionStats.pending} {t('pending')}
              </span>
            </CardDescription>
          </div>

          <div className="flex gap-2 items-center flex-shrink-0">
            <div className="w-40">
              <Select
                value={filterOption}
                isSearchable={false}
                options={filterOptions}
                onChange={(newValue) => setFilterOption(newValue as (typeof filterOptions)[number])}
                components={{ DropdownIndicator: () => <Filter className="w-4 h-4" /> }}
              />
            </div>

            <Button onClick={handleSelectAll} variant="outline" size="sm" disabled={isPending}>
              {Object.values(localCompliances).every(Boolean) ? t('deselectAll') : t('selectAll')}
            </Button>

            <Hint label={t('saveAllChanges')}>
              <Button onClick={handleSave} variant="outline" size="sm" disabled={isPending || JSON.stringify(localCompliances) === JSON.stringify(originalCompliances)}>
                <SaveAllIcon className={`w-4 h-4 ${isPending ? 'animate-pulse' : ''}`} />
              </Button>
            </Hint>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex-col flex overflow-hidden">
        <div className="mb-4 space-y-2">
          <Progress value={progress} />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>
              {progress.toFixed(1)}% {t('completed')}
            </span>
            <span>
              {completionStats.pending} {t('remaining')}
            </span>
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="w-full flex flex-col gap-2 pr-4">
            {filteredRequirements?.map((requirement) => (
              <div key={requirement.id} className="group flex items-start space-x-3 p-4 border rounded-md shadow-sm hover:shadow-md transition-shadow">
                <Checkbox
                  id={`requirement-${requirement.id}`}
                  checked={localCompliances[requirement.id] ?? false}
                  onCheckedChange={(checked) => handleCheckboxChange(requirement.id, !!checked)}
                  disabled={isPending}
                  className="mt-0.5"
                />
                <div className="space-y-1 leading-none flex-1">
                  <label htmlFor={`requirement-${requirement.id}`} className="text-sm cursor-pointer flex flex-col">
                    <span className="font-semibold">{requirement.name}</span>
                    <span className="text-xs text-muted-foreground mt-1">{requirement.description}</span>
                  </label>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

export function RequirementProgressPlaceholder() {
  return (
    <Card className="flex-1 flex flex-col">
      <CardHeader>
        <span>
          <Skeleton className="h-6 w-1/2" />
        </span>
        <span>
          <Skeleton className="h-4 w-3/4" />
        </span>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        <Skeleton className="h-2 mb-4 w-full" />
        <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-2">
          {[...Array(4)].map((_, index) => (
            <div key={index} className="flex items-center space-x-2">
              <Skeleton className="h-5 w-5" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
