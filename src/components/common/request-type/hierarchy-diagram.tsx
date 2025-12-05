'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAtomValue } from 'jotai';
import { AlertCircle, ChevronRight, RotateCcw } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useTranslations } from 'next-intl';

import { RequestHierarchyWithLevelsType } from '@/types/zenstackhq/hierarchy';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Hint } from '@/components/hint';

import { RequestCategoryValues } from './category-form';
import { categoriesAtom, creatingCategoriesAtom } from './store/category-store';

interface HierarchyDiagramProps {
  hierarchy: RequestHierarchyWithLevelsType;
  className?: string;
}
export function HierarchyDiagram({ hierarchy, className = '' }: HierarchyDiagramProps) {
  const t = useTranslations('admin.requestType.create');
  const categories = useAtomValue(categoriesAtom);
  const creatingCategories = useAtomValue(creatingCategoriesAtom);

  // Find incomplete categories
  const incompleteCategories = useMemo(() => {
    const allCategories = [...categories, ...Array.from(creatingCategories.values())];

    // Helper function to check if a category has incomplete children chain
    const checkIncomplete = (cat: RequestCategoryValues): boolean => {
      const catLevelIndex = hierarchy.levels.findIndex((l) => l.id === cat.hierarchyLevelId);

      if (catLevelIndex === -1) return true; // Invalid level

      // If this is the last level, it's always complete (no children needed)
      if (catLevelIndex === hierarchy.levels.length - 1) {
        return false;
      }

      // Recursive function to check if there's a complete chain from this category to the last level
      const checkChain = (category: RequestCategoryValues, targetLevelIndex: number): boolean => {
        const categoryLevelIndex = hierarchy.levels.findIndex((l) => l.id === category.hierarchyLevelId);
        if (categoryLevelIndex === -1) return false;

        // If we've reached or passed the target level, the chain is complete
        if (categoryLevelIndex >= targetLevelIndex) {
          return true;
        }

        // Check if this category has at least one child at the next level
        const nextLevelId = hierarchy.levels[categoryLevelIndex + 1]?.id;
        if (!nextLevelId) return false;

        const children = allCategories.filter((c) => c.parentCategoryId === category.id && c.hierarchyLevelId === nextLevelId);

        if (children.length === 0) {
          // No children at the next level - chain is incomplete
          return false;
        }

        // Check if at least one child has a complete chain to the target level
        return children.some((child) => checkChain(child, targetLevelIndex));
      };

      // Check if there's a complete chain from this category to the last level
      return !checkChain(cat, hierarchy.levels.length - 1);
    };

    return allCategories.filter((cat) => checkIncomplete(cat));
  }, [categories, creatingCategories, hierarchy.levels]);

  return (
    <ScrollArea className={`w-full h-full ${className}`}>
      <div className="w-full max-w-4xl mx-auto p-6 space-y-6">
        {/* Hierarchy Levels Breadcrumb */}
        <div className="flex flex-wrap items-center gap-2 p-3 bg-muted rounded-lg">
          <span className="text-sm font-medium text-foreground">{hierarchy.name}</span>
          {hierarchy.levels.map((level, index) => (
            <div key={level.id} className="flex items-center gap-2">
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground px-2 py-1 bg-background rounded border border-border">{level.name}</span>
            </div>
          ))}
        </div>

        {/* Incomplete Categories Error */}
        {incompleteCategories.length > 0 && (
          <div className="space-y-3">
            <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
              <div className="flex gap-3">
                <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                <div className="text-sm text-destructive flex-1">
                  <p className="font-semibold mb-2">{t('hierarchyDiagram.incompleteCategoriesTitle')}</p>
                  <p className="mb-3">{t('hierarchyDiagram.incompleteCategoriesDescription')}</p>
                  <ul className="space-y-2">
                    {incompleteCategories.map((cat) => {
                      const levelIndex = hierarchy.levels.findIndex((l) => l.id === cat.hierarchyLevelId);
                      const levelName = levelIndex >= 0 ? hierarchy.levels[levelIndex]?.name : '';
                      return (
                        <li key={cat.id} className="flex items-center gap-2 p-2 bg-background rounded border border-destructive/20">
                          <span className="font-medium">{cat.name}</span>
                          <span className="text-xs opacity-75">({levelName})</span>
                          <Hint label={t('hierarchyDiagram.incompleteChildrenChainWarning', { levelName: levelName || '' })} side="right">
                            <AlertCircle className="w-4 h-4 text-destructive" />
                          </Hint>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Interactive Problem Demonstration - Only show if there are incomplete categories */}
        {incompleteCategories.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-xl font-bold text-destructive">{t('hierarchyDiagram.problemDemoTitle')}</h3>
            <ProblemDemonstration hierarchy={hierarchy} />
          </div>
        )}
      </div>
    </ScrollArea>
  );
}

// Component for demonstrating the problem of incomplete hierarchy
export function ProblemDemonstration({ hierarchy }: { hierarchy: RequestHierarchyWithLevelsType }) {
  const t = useTranslations('admin.requestType.create');

  const categories = useAtomValue(categoriesAtom);
  const creatingCategories = useAtomValue(creatingCategoriesAtom);

  // Memoize all categories to avoid recreating array on every render
  const allCategories = useMemo(() => {
    return [...categories, ...Array.from(creatingCategories.values())];
  }, [categories, creatingCategories]);

  // Helper to check if category has incomplete chain
  const hasIncompleteChildrenChain = useCallback(
    (cat: RequestCategoryValues): boolean => {
      const catLevelIndex = hierarchy.levels.findIndex((l) => l.id === cat.hierarchyLevelId);
      if (catLevelIndex === -1 || catLevelIndex === hierarchy.levels.length - 1) return false;

      const checkChain = (category: RequestCategoryValues, targetLevelIndex: number): boolean => {
        const categoryLevelIndex = hierarchy.levels.findIndex((l) => l.id === category.hierarchyLevelId);
        if (categoryLevelIndex === -1) return false;
        if (categoryLevelIndex >= targetLevelIndex) return true;

        const nextLevelId = hierarchy.levels[categoryLevelIndex + 1]?.id;
        if (!nextLevelId) return false;

        const children = allCategories.filter((c) => c.parentCategoryId === category.id && c.hierarchyLevelId === nextLevelId);
        if (children.length === 0) return false;
        return children.some((child) => checkChain(child, targetLevelIndex));
      };

      return !checkChain(cat, hierarchy.levels.length - 1);
    },
    [allCategories, hierarchy.levels]
  );

  // Find all incomplete categories (memoized)
  const incompleteCategories = useMemo(() => {
    return allCategories.filter((cat) => hasIncompleteChildrenChain(cat));
  }, [allCategories, hasIncompleteChildrenChain]);

  // Find first incomplete category and build path to it (memoized)
  const incompleteCategory = useMemo(() => {
    return incompleteCategories[0];
  }, [incompleteCategories]);

  // Build path from root to incomplete category (memoized)
  const categoryPath = useMemo(() => {
    if (!incompleteCategory) return [];

    const path: RequestCategoryValues[] = [];
    const traverse = (cat: RequestCategoryValues): void => {
      path.unshift(cat);
      if (cat.parentCategoryId) {
        const parent = allCategories.find((c) => c.id === cat.parentCategoryId);
        if (parent) {
          traverse(parent);
        }
      }
    };

    traverse(incompleteCategory);
    return path;
  }, [incompleteCategory, allCategories]);

  const incompleteLevelIndex = useMemo(() => {
    return incompleteCategory ? hierarchy.levels.findIndex((l) => l.id === incompleteCategory.hierarchyLevelId) : 1; // Default to level 2 if no incomplete category
  }, [incompleteCategory, hierarchy.levels]);

  // The step where "No options" appears (next level after incomplete category)
  const noOptionsStep = useMemo(() => incompleteLevelIndex + 1, [incompleteLevelIndex]);

  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedLevels, setSelectedLevels] = useState<(string | null)[]>([]);

  // Stop at the "No options" step (when we try to select the problematic level)
  const maxSteps = noOptionsStep + 2; // Stop after showing "No options"

  // Auto-play on mount
  useEffect(() => {
    setIsPlaying(true);
  }, []);

  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        // Stop after showing "No options"
        if (prev >= noOptionsStep + 1) {
          setIsPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, 2000); // 2 seconds per step

    return () => clearInterval(interval);
  }, [isPlaying, noOptionsStep]);

  useEffect(() => {
    // Update selected levels based on current step and real category path
    // Show values progressively:
    // - When currentStep === i + 1, we're selecting level i (show "Seleccionando..." in field, name in green message)
    // - When currentStep > i + 1, level i is already selected (show value in field, no green message)
    const newSelected: (string | null)[] = [];
    for (let i = 0; i < hierarchy.levels.length; i++) {
      const categoryInPath = categoryPath.find((cat) => {
        const catLevelIndex = hierarchy.levels.findIndex((l) => l.id === cat.hierarchyLevelId);
        return catLevelIndex === i;
      });

      // Show value only after we've passed the selection step (currentStep > i + 1)
      // At currentStep === i + 1, we show "Seleccionando..." in field and name in green message
      if (categoryInPath && currentStep > i + 1) {
        newSelected.push(categoryInPath.name);
      } else {
        newSelected.push(null);
      }
    }
    setSelectedLevels(newSelected);
  }, [currentStep, hierarchy.levels, categoryPath]);

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentStep(0);
    setSelectedLevels([]);
    // Automatically start playing after reset
    setTimeout(() => {
      setIsPlaying(true);
    }, 100);
  };

  // Level is active when we're currently selecting it (currentStep === levelIndex + 1)
  const isActiveLevel = (levelIndex: number) => currentStep === levelIndex + 1;
  // Level is selected when we've already selected it (currentStep > levelIndex + 1)
  const isSelectedLevel = (levelIndex: number) => currentStep > levelIndex + 1 && selectedLevels[levelIndex] !== null;
  // Show "No options" when we try to select the problematic level
  const showNoOptions = currentStep === noOptionsStep + 1;

  return (
    <div className="p-6 bg-card rounded-lg border border-border">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-muted-foreground">{t('hierarchyDiagram.problemDemoDescription')}</p>
        <Button type="button" variant="ghost" size="sm" onClick={handleReset}>
          <RotateCcw className="h-4 w-4 mr-2" />
          {t('hierarchyDiagram.problemDemoReset')}
        </Button>
      </div>

      <div className="space-y-4">
        <div className="text-sm font-medium text-foreground mb-2">{t('hierarchyDiagram.problemDemoFormTitle')}</div>

        <div
          className="grid gap-3"
          style={{
            gridTemplateColumns: `repeat(${Math.min(hierarchy.levels.length, 5)}, minmax(0, 1fr))`,
          }}>
          {hierarchy.levels.map((level, index) => {
            const isSelected = isSelectedLevel(index);
            const isActive = isActiveLevel(index);
            const value = selectedLevels[index];
            const showNoOptionsHere = showNoOptions && index === noOptionsStep;

            const shouldShowValue = value !== null;

            // Get the category name that will be selected at this level
            const categoryInPath = categoryPath.find((cat) => {
              const catLevelIndex = hierarchy.levels.findIndex((l) => l.id === cat.hierarchyLevelId);
              return catLevelIndex === index;
            });
            const categoryNameToSelect = categoryInPath?.name || null;

            return (
              <div key={level.id} className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground">{level.name}</label>
                <div className="relative">
                  <motion.div
                    className={cn(
                      'w-full px-3 py-2 rounded-md border-2 text-sm',
                      isActive ? 'border-primary bg-primary/10' : isSelected ? 'border-primary bg-primary/10' : 'border-border bg-background',
                      showNoOptionsHere && 'border-destructive'
                    )}>
                    <AnimatePresence mode="wait">
                      {shouldShowValue ? (
                        <motion.div
                          key={value}
                          initial={{ opacity: 0, y: -5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 5 }}
                          transition={{ duration: 0.3 }}
                          className="flex items-center justify-between">
                          <span className="font-medium">{value}</span>
                          <span className="text-xs text-muted-foreground">×</span>
                        </motion.div>
                      ) : isActive && categoryNameToSelect ? (
                        <motion.span key="selecting" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-muted-foreground text-xs">
                          {t('hierarchyDiagram.problemDemoSelecting')}
                        </motion.span>
                      ) : (
                        <motion.span key="placeholder" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-muted-foreground text-xs">
                          {t('hierarchyDiagram.problemDemoSelectPlaceholder')}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </motion.div>

                  {/* Selection confirmation message (green) - shows the category name being selected */}
                  <AnimatePresence>
                    {isActive && categoryNameToSelect && !showNoOptionsHere && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3 }}
                        className="mt-2 p-2 bg-green-500/10 border border-green-500/20 rounded-md">
                        <div className="flex items-center gap-2 text-xs text-green-600 dark:text-green-400">
                          <span className="font-medium">{categoryNameToSelect}</span>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* No options message */}
                  <AnimatePresence>
                    {showNoOptionsHere && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3 }}
                        className="mt-2 p-2 bg-destructive/10 border border-destructive/20 rounded-md">
                        <div className="flex items-center gap-2 text-xs text-destructive">
                          <AlertCircle className="h-3 w-3" />
                          <span className="font-medium">{t('hierarchyDiagram.problemDemoNoOptions')}</span>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Selection indicator */}
                  {isActive && !showNoOptionsHere && (
                    <motion.div
                      className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full"
                      animate={{
                        scale: [1, 1.5, 1],
                        opacity: [1, 0.5, 1],
                      }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        ease: 'easeInOut',
                      }}
                    />
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Explanation text with incomplete categories list */}
        <AnimatePresence>
          {showNoOptions && incompleteCategory && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.3 }}
              className="mt-4 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
              <div className="flex gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-yellow-900 dark:text-yellow-100 flex-1">
                  <p className="font-semibold mb-1">{t('hierarchyDiagram.problemDemoExplanationTitle')}</p>
                  <p className="mb-3">
                    {t('hierarchyDiagram.problemDemoExplanation', {
                      categoryName: incompleteCategory.name,
                      levelName: hierarchy.levels[incompleteLevelIndex]?.name || `Nivel ${incompleteLevelIndex + 1}`,
                      nextLevelName: hierarchy.levels[noOptionsStep]?.name || `Nivel ${noOptionsStep + 1}`,
                    })}
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Fallback message if no incomplete categories exist */}
        {showNoOptions && !incompleteCategory && (
          <div className="mt-4 p-4 bg-muted border border-border rounded-lg">
            <div className="flex gap-3">
              <AlertCircle className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
              <div className="text-sm text-muted-foreground">
                <p>{t('hierarchyDiagram.problemDemoNoIncompleteCategories')}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
