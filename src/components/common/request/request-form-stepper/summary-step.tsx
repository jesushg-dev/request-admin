'use client';

import type { FC } from 'react';
import { useFindManyForm, useFindManyRequirement } from '@/services/api/hooks';
import { FlagIcon, MapPin, TagIcon, TagsIcon, UserIcon } from 'lucide-react';
import { useFormContext } from 'react-hook-form';

import type { AssignmentLevelType, RequestLevelType } from '@/types/prisma/hierarchy';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MetadataItem } from '@/components/metadata-item';

import { RequestFormStepperType } from '.';
import RequirementProgress from '../detail/requirement-progress';
import FormSubmissionsViewer, { FormSubmission } from '../detail/submissions-viewer';

interface CategoryData {
  value: string;
  label?: string;
}

function DetailsSection({ issueSubject, priorityId, statusId, areaId }: RequestFormStepperType) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Request Details</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(150px,1fr))] gap-4">
          <MetadataItem icon={<UserIcon className="h-4 w-4" />} label="Issue Subject" value={issueSubject} />
          <MetadataItem icon={<FlagIcon className="h-4 w-4" />} label="Priority" value={priorityId.label} />
          <MetadataItem icon={<TagIcon className="h-4 w-4" />} label="Status" value={statusId.label} />
          <MetadataItem icon={<MapPin className="h-4 w-4" />} label="Area" value={areaId.label} />
        </div>
      </CardContent>
    </Card>
  );
}

function CategorySection({ title, data, levelTypes }: { title: string; data?: CategoryData[]; levelTypes: (RequestLevelType | AssignmentLevelType)[] }) {
  if (!data?.length) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-2">
          {data.map((category, index) => (
            <CategoryItem key={category.value} category={category} level={levelTypes[index]} depth={index} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// Function to render each category
const CategoryItem: React.FC<{ category: CategoryData; level: RequestLevelType | AssignmentLevelType; depth: number }> = ({ category, level, depth }) => (
  <div
    className="flex items-center justify-between py-0.5 border-l-2 border-dashed"
    style={{
      marginLeft: `${depth * 20}px`,
      paddingLeft: '10px',
    }}>
    <MetadataItem icon={<TagsIcon className="h-4 w-4" />} label={category.label ?? 'N/A'} value={level?.name} />
  </div>
);

function RequirementsSection({ requirementCompliances }: { requirementCompliances?: Record<string, boolean> }) {
  const { data, isLoading } = useFindManyRequirement({
    select: { id: true, name: true },
    where: { id: { in: Object.keys(requirementCompliances || {}) } },
  });

  const requirements =
    data?.map((requirement) => ({
      id: requirement.id,
      description: requirement.name,
      completed: requirementCompliances?.[requirement.id] || false,
    })) || [];

  if (!requirementCompliances) return null;

  return <RequirementProgress requirements={requirements} isLoading={isLoading} />;
}

function SubmissionsSection({ submissions }: { submissions?: Record<string, Record<string, string | number | boolean>> }) {
  const { data, isLoading } = useFindManyForm({
    select: { id: true, name: true, content: true },
    where: { id: { in: Object.keys(submissions || {}) } },
  });

  const formSubmissions: FormSubmission[] =
    data?.map((form) => {
      const elements = JSON.parse(form.content || '[]') as { id: string; extraAttributes: { label: string } }[];

      const submissionContent: Record<string, string> = Object.entries(submissions?.[form.id] || {}).reduce(
        (acc, [key, value]) => {
          const element = elements.find((element) => element.id === key);
          if (element && element.extraAttributes.label) {
            acc[element.extraAttributes.label] = String(value);
          }
          return acc;
        },
        {} as Record<string, string>
      );

      return {
        id: form.id,
        formName: form.name,
        submittedAt: Date().toString(),
        content: submissionContent,
      };
    }) || [];

  return <FormSubmissionsViewer submissions={formSubmissions} isLoading={isLoading} />;
}

interface SummaryStepProps {
  requestLevelTypes: RequestLevelType[];
  assignmentLevelTypes: AssignmentLevelType[];
}

const SummaryStep: FC<SummaryStepProps> = ({ requestLevelTypes, assignmentLevelTypes }) => {
  const { watch } = useFormContext<RequestFormStepperType>();
  const formData = watch();

  return (
    <ScrollArea className="flex-1">
      <div className="w-full flex flex-col gap-4 px-1">
        <DetailsSection {...formData} />

        <div className="grid md:grid-cols-2 gap-4">
          <CategorySection title="Service Category" data={formData.requestCategory} levelTypes={requestLevelTypes} />
          <CategorySection title="Assignment Category" data={formData.assignmentCategory} levelTypes={assignmentLevelTypes} />
        </div>

        <Tabs defaultValue="compliances" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="compliances">Compliances</TabsTrigger>
            <TabsTrigger value="submissions">Submissions</TabsTrigger>
            <TabsTrigger value="attachments">Attachments</TabsTrigger>
          </TabsList>
          <TabsContent value="compliances">
            <RequirementsSection requirementCompliances={formData.requirementCompliances} />
          </TabsContent>
          <TabsContent value="submissions">
            <SubmissionsSection submissions={formData.submissions} />
          </TabsContent>
          <TabsContent value="attachments">
            <p>Attachments</p>
          </TabsContent>
        </Tabs>
      </div>
    </ScrollArea>
  );
};

export default SummaryStep;
