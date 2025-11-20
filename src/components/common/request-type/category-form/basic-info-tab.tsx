// BasicInfoTab.tsx
'use client';

import { useCallback, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useFormContext } from 'react-hook-form';
import { useAtomValue } from 'jotai';

import { FormField } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { FormCheckboxItem, FormItem, FormSection } from '@/components/shared/form-root';
import { RequestLevelType } from '@/types/zenstackhq/hierarchy';

import { RequestCategoryValues } from '.';
import { categoriesAtom, creatingCategoriesAtom } from '../store/category-store';
import { ProblemDemonstration } from '../hierarchy-diagram';
import { RequestHierarchyWithLevelsType } from '@/types/zenstackhq/hierarchy';

interface BasicInfoTabProps {
  levels: RequestLevelType[];
  hierarchy: RequestHierarchyWithLevelsType;
}

export function BasicInfoTab({ levels, hierarchy }: BasicInfoTabProps) {
  const { control, setValue, getValues } = useFormContext<RequestCategoryValues>();
  const t = useTranslations('admin.requestType.create');
  
  const categories = useAtomValue(categoriesAtom);
  const creatingCategories = useAtomValue(creatingCategoriesAtom);
  const [showModal, setShowModal] = useState(false);
  const [incompleteCategoryInfo, setIncompleteCategoryInfo] = useState<{
    categoryName: string;
    levelName: string;
    nextLevelName: string;
  } | null>(null);
  
  // Create a map for quick level lookup by ID
  const levelsMap = useMemo(() => {
    const map = new Map<string, { level: RequestLevelType; index: number }>();
    levels.forEach((level, index) => {
      map.set(level.id, { level, index });
    });
    return map;
  }, [levels]);

  // Validate that a category has a complete chain of children down to the last level
  const hasCompleteChildrenChain = useCallback(
    (category: Partial<RequestCategoryValues> & { id: string; hierarchyLevelId: string }): boolean => {
      const allCategories = [...categories, ...Array.from(creatingCategories.values())];
      const currentLevelInfo = levelsMap.get(category.hierarchyLevelId);
      
      if (!currentLevelInfo) return false;
      
      // If this is the last level, it's always valid (no children needed)
      if (currentLevelInfo.index === levels.length - 1) {
        return true;
      }
      
      // Recursive function to check if there's a complete chain from this category to the last level
      const checkChain = (cat: { id: string; hierarchyLevelId: string; parentCategoryId?: string | null }, targetLevelIndex: number): boolean => {
        const catLevelInfo = levelsMap.get(cat.hierarchyLevelId);
        if (!catLevelInfo) return false;
        
        if (catLevelInfo.index >= targetLevelIndex) {
          return true;
        }
        
        // Check if this category has at least one child at the next level
        const nextLevelId = levels[catLevelInfo.index + 1]?.id;
        if (!nextLevelId) return false;
        
        const children = allCategories.filter(
          (c) => c.parentCategoryId === cat.id && c.hierarchyLevelId === nextLevelId
        );
        
        if (children.length === 0) {
          return false;
        }
        
        return children.some((child) => checkChain(child, targetLevelIndex));
      };
      
      return checkChain(category, levels.length - 1);
    },
    [categories, creatingCategories, levelsMap, levels]
  );

  const handleIsActiveChange = useCallback(
    (checked: boolean) => {
      if (checked) {
        // User is trying to activate the category
        const currentCategory = getValues() as RequestCategoryValues;
        // Only validate if we have the required fields
        if (currentCategory.id && currentCategory.hierarchyLevelId) {
          const canActivate = hasCompleteChildrenChain(currentCategory);
          if (!canActivate) {
            // Find which level is missing
            const currentLevelIndex = levels.findIndex((l) => l.id === currentCategory.hierarchyLevelId);
            const nextLevelIndex = currentLevelIndex + 1;
            const nextLevel = levels[nextLevelIndex];
            
            // Set info for modal
            setIncompleteCategoryInfo({
              categoryName: currentCategory.name || t('hierarchyDiagram.defaultCategoryName'),
              levelName: levels[currentLevelIndex]?.name || `${t('hierarchyDiagram.levelLabel')} ${currentLevelIndex + 1}`,
              nextLevelName: nextLevel?.name || `${t('hierarchyDiagram.levelLabel')} ${nextLevelIndex + 1}`,
            });
            setShowModal(true);
            return; // Don't update the value
          }
        }
      }
      // If validation passes or deactivating, update normally
      setValue('isActive', checked);
    },
    [getValues, hasCompleteChildrenChain, setValue, levels, t]
  );

  return (
    <FormSection className="flex-1 flex flex-col overflow-y-auto">
      <FormField
        control={control}
        name="name"
        render={({ field }) => (
          <FormItem label={t('basicTab.name')} description={t('basicTab.nameDescription')}>
            <Input placeholder={t('basicTab.namePlaceholder')} {...field} />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="description"
        render={({ field }) => (
          <FormItem label={t('basicTab.description')} description={t('basicTab.descriptionDescription')}>
            <Textarea placeholder={t('basicTab.descriptionPlaceholder')} {...field} value={field.value || ''} />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={control}
          name="isActive"
          render={({ field }) => (
            <FormCheckboxItem label={t('basicTab.active')} description={t('basicTab.activeDescription')}>
              <Switch 
                checked={field.value} 
                onCheckedChange={(checked) => {
                  handleIsActiveChange(checked);
                }} 
              />
            </FormCheckboxItem>
          )}
        />

        <FormField
          control={control}
          name="isEligibleForNewClients"
          render={({ field }) => (
            <FormCheckboxItem label={t('basicTab.newClients')} description={t('basicTab.newClientsDescription')}>
              <Switch checked={field.value} onCheckedChange={field.onChange} />
            </FormCheckboxItem>
          )}
        />
      </div>
      
      {/* Modal for incomplete category warning */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            {incompleteCategoryInfo && (
              <>
                <DialogTitle className="text-xl">
                  {t('category.errors.cannotActivateIncomplete', { categoryName: incompleteCategoryInfo.categoryName })}
                </DialogTitle>
                <DialogDescription className="pt-2 text-base">
                  {t('hierarchyDiagram.cannotActivateDescription')}
                </DialogDescription>
              </>
            )}
          </DialogHeader>
          
          <div className="space-y-4 mt-4">
            {/* "¿En qué afecta?" title in red */}
            <h3 className="text-xl font-bold text-destructive">
              {t('hierarchyDiagram.problemDemoTitle')}
            </h3>
            
            {/* Interactive Problem Demonstration */}
            <ProblemDemonstration hierarchy={hierarchy} />
          </div>
        </DialogContent>
      </Dialog>
    </FormSection>
  );
}
