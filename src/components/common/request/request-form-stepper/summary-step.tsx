'use client';

import { Fragment, useState, type FC } from 'react';
import { useFindFirstAssignmentHierarchy, useFindFirstRequestHierarchy } from '@/services/api/hooks';
import { ChevronDown, ChevronRight, FlagIcon, MapPin, TagIcon, TagsIcon, UserIcon } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useTranslations } from 'next-intl';
import { useFormContext } from 'react-hook-form';

import type { AssignmentLevelType, RequestLevelType } from '@/types/prisma/hierarchy';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MetadataItem } from '@/components/shared/metadata-item';

import { RequestFormStepperType } from '.';
import AttachmentsViewer from './attachments-viewer';
import RequirementProgress from './requirement-progress';
import FormSubmissionsViewer from './submissions-viewer';

interface CategoryData {
  value: string;
  label?: string;
}

function DetailsSection({ title, issueSubject, priorityId, statusId, areaId }: RequestFormStepperType & { title: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(150px,1fr))] gap-4">
          <MetadataItem icon={<UserIcon className="h-4 w-4" />} label="Issue Subject" value={issueSubject} />
          <MetadataItem icon={<FlagIcon className="h-4 w-4" />} label="Priority" value={priorityId.label} />
          {statusId?.value && <MetadataItem icon={<TagIcon className="h-4 w-4" />} label="Status" value={statusId.label} />}
          <MetadataItem icon={<MapPin className="h-4 w-4" />} label="Area" value={areaId.label} />
        </div>
      </CardContent>
    </Card>
  );
}

function CategorySection({ title, data, levelTypes }: { title: string; data?: CategoryData[]; levelTypes: (RequestLevelType | AssignmentLevelType)[] }) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!data?.length) return null;

  const toggleExpand = () => setIsExpanded(!isExpanded);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="flex items-center">
          <TagsIcon className="h-4 w-4 mr-2" />
          {title}
        </CardTitle>
        <Button type="button" variant="ghost" size="icon" onClick={toggleExpand} className="h-8 w-8 p-0">
          <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isExpanded ? 'transform rotate-180' : ''}`} />
        </Button>
      </CardHeader>
      <CardContent>
        <motion.div initial={false} animate={{ height: isExpanded ? 'auto' : '40px' }} transition={{ duration: 0.3 }} className="overflow-hidden">
          {isExpanded ? (
            <AnimatePresence>
              {data.map((category, index) => (
                <motion.div key={category.value} initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2, delay: index * 0.05 }}>
                  <CategoryItem category={category} level={levelTypes[index]} depth={index} />
                </motion.div>
              ))}
            </AnimatePresence>
          ) : (
            <CollapsedView categories={data} />
          )}
        </motion.div>
      </CardContent>
    </Card>
  );
}
// Function to render each category
const CategoryItem: FC<{
  category: CategoryData;
  level: RequestLevelType | AssignmentLevelType;
  depth: number;
}> = ({ category, level, depth }) => (
  <div
    className="flex items-center justify-between py-0.5 border-l-2 border-dashed"
    style={{
      marginLeft: `${depth * 20}px`,
      paddingLeft: '10px',
    }}>
    <MetadataItem icon={<TagsIcon className="h-4 w-4" />} label={category.label ?? ''} value={level?.name} />
  </div>
);

const CollapsedView: FC<{ categories: CategoryData[] }> = ({ categories }) => (
  <div className="flex items-center gap-2">
    {categories.map((category, index) => (
      <Fragment key={category.value}>
        <span className="text-sm font-medium">{category.label}</span>
        {index < categories.length - 1 && <ChevronRight className="h-4 w-4 mx-1" />}
      </Fragment>
    ))}
  </div>
);

interface SummaryStepProps {
  tenantId: string;
}

export const SummaryStep: FC<SummaryStepProps> = ({ tenantId }) => {
  const t = useTranslations('admin.request.form.summaryStep');
  const { watch } = useFormContext<RequestFormStepperType>();
  const formData = watch();

  const { data: requestLevelTypes, isLoading: isRequestLevelTypesLoading } = useFindFirstRequestHierarchy({
    select: { levels: { select: { id: true, name: true, position: true }, orderBy: { position: 'asc' } } },
    where: { tenantId, categories: { some: { id: { in: formData.requestCategory?.map((category) => category.value) } } } },
  });
  const { data: assignmentLevelTypes, isLoading: isAssignmentLevelTypesLoading } = useFindFirstAssignmentHierarchy({
    select: { levels: { select: { id: true, name: true, position: true }, orderBy: { position: 'asc' } } },
    where: { tenantId, categories: { some: { id: { in: formData.assignmentCategory?.map((category) => category.value) } } } },
  });

  return (
    <ScrollArea className="flex-1">
      <div className="w-full flex flex-col gap-4 px-1">
        <DetailsSection title={t('requestDetails')} {...formData} />

        <div className="grid md:grid-cols-2 gap-4">
          {isRequestLevelTypesLoading ? (
            <Skeleton className="h-6 w-full" />
          ) : (
            <CategorySection title={t('service_category')} data={formData.requestCategory} levelTypes={requestLevelTypes?.levels ?? []} />
          )}
          {isAssignmentLevelTypesLoading ? (
            <Skeleton className="h-6 w-full" />
          ) : (
            <CategorySection title={t('assignment_category')} data={formData.assignmentCategory} levelTypes={assignmentLevelTypes?.levels ?? []} />
          )}
        </div>

        <Tabs defaultValue="compliances" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="compliances">{t('tabs.compliances')}</TabsTrigger>
            <TabsTrigger value="submissions">{t('tabs.submissions')}</TabsTrigger>
            <TabsTrigger value="attachments">{t('tabs.attachments')}</TabsTrigger>
          </TabsList>
          <TabsContent value="compliances">
            <RequirementProgress tenantId={tenantId} requirementCompliances={formData.requirementCompliances} />
          </TabsContent>
          <TabsContent value="submissions">
            <FormSubmissionsViewer submissions={formData.submissions} />
          </TabsContent>
          <TabsContent value="attachments">
            <AttachmentsViewer files={formData.additionalDocuments ?? []} />
          </TabsContent>
        </Tabs>
      </div>
    </ScrollArea>
  );
};

export default SummaryStep;
