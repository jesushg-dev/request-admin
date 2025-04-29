'use client';

import { FC, useEffect, useMemo, useState, useTransition } from 'react';
import { useRouter } from '@/i18n/routing';
import { BookCopyIcon, BookIcon, ContainerIcon, FileCogIcon, FileStackIcon, PackageOpenIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { SingleValue } from 'react-select';

import { RequestHierarchyWithLevelsType } from '@/types/prisma/hierarchy';
import useMessage from '@/lib/message';
import Select, { OptionType } from '@/components/custom-ui/select';
import EmptyState from '@/components/shared/empty-state';

import { CategoryForm, RequestCategoryValues } from './category-form';
import { CategoryList } from './category-list';

export type RequestCategory = RequestCategoryValues & {
  subcategories: RequestCategory[];
};

interface RequestTypeFormValues {
  hierarchyId: OptionType;
  categories: RequestCategory[];
}

interface RequestTypeFormProps {
  tenantId: string;
  forms: OptionType[];
  requirements: OptionType[];
  requestHierarchies: RequestHierarchyWithLevelsType[];
  initialValues?: RequestTypeFormValues | null;
  disableHierarchyChange?: boolean;
}

const RequestTypeForm: FC<RequestTypeFormProps> = ({ initialValues, requirements, forms, requestHierarchies, tenantId, disableHierarchyChange = false }) => {
  const t = useTranslations('admin.requestType.create');
  const router = useRouter();
  const message = useMessage();
  const [isPending, startTransition] = useTransition();
  const [currentState, setCurrentState] = useState<RequestTypeFormValues>();
  const [selectedHierarchy, setSelectedHierarchy] = useState<SingleValue<OptionType>>();

  const hierarchyOptions = useMemo(() => {
    return requestHierarchies.map((hierarchy) => ({
      label: hierarchy.name,
      value: hierarchy.id,
    }));
  }, [requestHierarchies]);

  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<RequestCategoryValues | null>(null);

  const handleAddCategory = () => {
    setIsAddingCategory(true);
    setSelectedCategory(null);
  };

  const handleEditCategory = (category: RequestCategoryValues) => {
    setSelectedCategory(category);
    setIsAddingCategory(false);
  };

  const handleCancelForm = () => {
    setIsAddingCategory(false);
    setSelectedCategory(null);
  };

  const handleHierarchyChange = (newValue: SingleValue<OptionType>) => {
    setSelectedHierarchy(newValue);
  };

  const handleSaveCategory = (formData: RequestCategoryValues) => {
    console.log('🚀 ~ formData:', formData);
  };

  useEffect(() => {
    if (initialValues) {
      setCurrentState(initialValues);
      setSelectedHierarchy(initialValues.hierarchyId);
    }
  }, [initialValues]);

  return (
    <div className="flex flex-1">
      {/* Left sidebar */}
      <div className="w-80 border-r p-6 flex flex-col">
        <h1 className="text-2xl font-bold mb-6">Request Categories</h1>

        {!initialValues && (
          <div className="mb-6">
            <h2 className="text-sm font-medium text-gray-500 mb-2">{t('hierarchyLabel')}</h2>
            <Select
              menuPortalTarget={null}
              isSearchable
              isClearable={!disableHierarchyChange && hierarchyOptions.length > 1}
              options={hierarchyOptions}
              isDisabled={disableHierarchyChange || hierarchyOptions.length === 1}
              onChange={handleHierarchyChange}
              value={selectedHierarchy}
            />
            <span className="text-xs text-gray-500">{t('hierarchyDescription')}</span>
          </div>
        )}

        {selectedHierarchy && (
          <div className="flex-1 overflow-hidden flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-medium text-gray-500">Categories</h2>
              <button onClick={handleAddCategory} className="text-xs px-2 py-1 rounded-md hover:bg-primary/90">
                Add New
              </button>
            </div>
            <div className="flex-1 overflow-auto">
              <CategoryList categories={currentState?.categories ?? []} hierarchyId={selectedHierarchy.value} onSelectCategory={handleEditCategory} selectedCategoryId={selectedCategory?.id} />
            </div>
          </div>
        )}
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-auto p-8">
        {selectedHierarchy ? (
          selectedCategory || isAddingCategory ? (
            <CategoryForm
              formsOptions={forms}
              onCancel={handleCancelForm}
              onSave={handleSaveCategory}
              initialData={selectedCategory}
              requirementsOptions={requirements}
              hierarchyId={selectedHierarchy.value}
            />
          ) : (
            <EmptyState
              title="Manage Request Categories"
              description='Select a category from the sidebar to edit or click "Add New" to create a new category.'
              icons={[FileStackIcon, BookCopyIcon, ContainerIcon]}
              actions={[
                {
                  label: 'Create New Category',
                  onClick: handleAddCategory,
                },
              ]}
            />
          )
        ) : (
          <EmptyState
            title="Select a Hierarchy"
            description="Please select a hierarchy from the sidebar to manage its categories."
            icons={[PackageOpenIcon, FileCogIcon, BookIcon]}
            actions={[
              {
                label: 'Create New Hierarchy',
                href: {
                  pathname: '/admin/[tenantId]/configurations/request-hierarchies/new',
                  params: { tenantId },
                },
              },
            ]}
          />
        )}
      </div>
    </div>
  );
};

export default RequestTypeForm;
