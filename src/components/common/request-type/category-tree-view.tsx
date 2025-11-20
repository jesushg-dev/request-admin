'use client';

import { useCallback, useState, useMemo, useEffect } from 'react';
import { useAtom, useAtomValue } from 'jotai';
import { AlertCircle, ChevronDown, ChevronRight, CheckCircle2, Circle, Edit, File, FileSearch, Folder, FolderPlus, MoreHorizontal, CheckCheck, Trash } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { RequestHierarchyWithLevelsType } from '@/types/zenstackhq/hierarchy';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Hint } from '@/components/hint';

import { RequestCategoryValues } from './category-form';
import { categoriesAtom, updateCategoriesAtom, creatingCategoriesAtom, selectedCategoryIdAtom } from './store/category-store';
import { updateCategoryActiveStatus } from '@/actions/request-type';
import { toast } from 'sonner';

export interface CategoryTreeViewProps {
  hierarchy: RequestHierarchyWithLevelsType;
  onEditCategory: (category: RequestCategoryValues) => void;
  onAddCategory: (hierarchyLevelId: string, parentCategoryId?: string | null) => void;
  tenantId: string;
  hierarchyId: string;
}

interface CategoryTreeNodeProps {
  category: RequestCategoryValues;
  level: number;
  hierarchy: RequestHierarchyWithLevelsType;
  categoryMap: Map<string, RequestCategoryValues>;
  expanded: Set<string>;
  selected: string | null;
  renamingId: string | null;
  renameValue: string;
  onRenameValueChange: (value: string) => void;
  onToggleExpand: (id: string) => void;
  onSelect: (category: RequestCategoryValues) => void;
  onStartRename: (category: RequestCategoryValues) => void;
  onFinishRename: (category: RequestCategoryValues) => void;
  onCancelRename: (category: RequestCategoryValues) => void;
  onAddCategory: (hierarchyLevelId: string, parentCategoryId?: string | null) => void;
  creatingCategories: Map<string, RequestCategoryValues>;
  hasCreatingCategory: boolean;
  t: ReturnType<typeof useTranslations<'component.categoryTreeView'>>;
}



export const CategoryTreeView = ({ onAddCategory, onEditCategory, hierarchy, tenantId, hierarchyId }: CategoryTreeViewProps) => {
  const t = useTranslations('component.categoryTreeView');
  const categories = useAtomValue(categoriesAtom);
  const creatingCategories = useAtomValue(creatingCategoriesAtom);
  const [, updateCategories] = useAtom(updateCategoriesAtom);
  const [selected, setSelected] = useAtom(selectedCategoryIdAtom);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  
  // Check if there's any category being created
  const hasCreatingCategory = creatingCategories.size > 0;
  
  // Auto-expand parent when creating a child
  useEffect(() => {
    creatingCategories.forEach((cat) => {
      if (cat.parentCategoryId) {
        setExpanded((prev) => {
          const next = new Set(prev);
          next.add(cat.parentCategoryId!);
          return next;
        });
      }
    });
  }, [creatingCategories]);

  // Create a map for quick category lookup (includes both real and creating categories)
  const categoryMap = useMemo(() => {
    const map = new Map<string, RequestCategoryValues>();
    categories.forEach((cat) => {
      map.set(cat.id, cat);
    });
    // Add creating categories to the map
    creatingCategories.forEach((cat) => {
      map.set(cat.id, cat);
    });
    return map;
  }, [categories, creatingCategories]);

  // Get root-level categories (no parent) - includes both real and creating
  const rootCategories = useMemo(() => {
    const allCategories = [...categories, ...Array.from(creatingCategories.values())];
    return allCategories.filter((cat) => !cat.parentCategoryId);
  }, [categories, creatingCategories]);

  // Initialize expanded state with all root-level categories expanded
  const [expanded, setExpanded] = useState<Set<string>>(() => {
    const initialExpanded = new Set<string>();
    const rootCats = categories.filter((cat) => !cat.parentCategoryId);
    rootCats.forEach((cat) => {
      initialExpanded.add(cat.id);
    });
    return initialExpanded;
  });


  // Filter categories by search query
  const filteredRootCategories = useMemo(() => {
    if (!searchQuery.trim()) return rootCategories;

    const query = searchQuery.toLowerCase();
    const matches = new Set<string>();

    const searchInCategory = (cat: RequestCategoryValues): boolean => {
      const matchesName = cat.name.toLowerCase().includes(query);
      if (matchesName) {
        matches.add(cat.id);
        // Add all children
        if (cat.children) {
          cat.children.forEach((childId) => {
            const child = categoryMap.get(childId);
            if (child) {
              matches.add(childId);
              searchInCategory(child);
            }
          });
        }
        return true;
      }

      // Check children
      if (cat.children) {
        let childMatches = false;
        cat.children.forEach((childId) => {
          const child = categoryMap.get(childId);
          if (child && searchInCategory(child)) {
            childMatches = true;
            matches.add(cat.id); // Expand parent if child matches
          }
        });
        return childMatches;
      }

      return false;
    };

    rootCategories.forEach((cat) => searchInCategory(cat));
    return rootCategories.filter((cat) => matches.has(cat.id));
  }, [rootCategories, searchQuery, categoryMap]);

  const handleToggleExpand = useCallback((id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const handleSelect = useCallback(
    (category: RequestCategoryValues) => {
      setSelected(category.id);
      onEditCategory(category);
    },
    [onEditCategory]
  );

  const handleRename = useCallback(
    (category: RequestCategoryValues) => {
      // Update the category in Jotai atom
      updateCategories((prev) => prev.map((c) => (c.id === category.id ? category : c)));
      // Also notify parent for any side effects
      onEditCategory(category);
    },
    [onEditCategory, updateCategories]
  );

  // State for renaming
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');

  const handleStartRename = useCallback((category: RequestCategoryValues) => {
    setRenamingId(category.id);
    setRenameValue(category.name);
  }, []);

  const handleFinishRename = useCallback(
    (category: RequestCategoryValues) => {
      if (renameValue.trim() && renameValue !== category.name) {
        handleRename({ ...category, name: renameValue.trim() });
      }
      setRenamingId(null);
      setRenameValue('');
    },
    [renameValue, handleRename]
  );

  const handleCancelRename = useCallback((category: RequestCategoryValues) => {
    setRenameValue(category.name);
    setRenamingId(null);
  }, []);

  // Helper function to check if a category has a complete chain of children
  const hasCompleteChildrenChain = useCallback(
    (category: RequestCategoryValues): boolean => {
      const allCategories = [...categories, ...Array.from(creatingCategories.values())];
      const catLevelIndex = hierarchy.levels.findIndex((l) => l.id === category.hierarchyLevelId);
      
      if (catLevelIndex === -1) return false;
      
      // If this is the last level, it's always complete (no children needed)
      if (catLevelIndex === hierarchy.levels.length - 1) {
        return true;
      }
      
      // Recursive function to check if there's a complete chain from this category to the last level
      const checkChain = (cat: RequestCategoryValues, targetLevelIndex: number): boolean => {
        const categoryLevelIndex = hierarchy.levels.findIndex((l) => l.id === cat.hierarchyLevelId);
        if (categoryLevelIndex === -1) return false;
        
        if (categoryLevelIndex >= targetLevelIndex) {
          return true;
        }
        
        const nextLevelId = hierarchy.levels[categoryLevelIndex + 1]?.id;
        if (!nextLevelId) return false;
        
        const children = allCategories.filter(
          (c) => c.parentCategoryId === cat.id && c.hierarchyLevelId === nextLevelId
        );
        
        if (children.length === 0) {
          return false;
        }
        
        return children.some((child) => checkChain(child, targetLevelIndex));
      };
      
      return checkChain(category, hierarchy.levels.length - 1);
    },
    [categories, creatingCategories, hierarchy.levels]
  );

  // Function to activate a category and all its children recursively
  const activateCategoryAndChildren = useCallback(
    async (categoryId: string) => {
      const allCategories = [...categories, ...Array.from(creatingCategories.values())];
      const category = allCategories.find((c) => c.id === categoryId);
      if (!category) return;

      const categoriesToActivate: RequestCategoryValues[] = [];
      
      // Recursive function to collect all categories to activate
      const collectCategories = (cat: RequestCategoryValues) => {
        if (!cat.isActive) {
          categoriesToActivate.push({ ...cat, isActive: true });
        }
        
        // Collect all children
        if (cat.children) {
          cat.children.forEach((childId) => {
            const child = allCategories.find((c) => c.id === childId);
            if (child) {
              collectCategories(child);
            }
          });
        }
      };
      
      collectCategories(category);
      
      // Update all categories at once in local state
      if (categoriesToActivate.length > 0) {
        const toastId = toast.loading(t('activatingCategories', { count: categoriesToActivate.length }));
        
        try {
          // Save each category to database (only isActive field)
          for (const catToActivate of categoriesToActivate) {
            await updateCategoryActiveStatus(catToActivate.id, true, tenantId);
          }
          
          // Update local state after successful save
          updateCategories((prev) => {
            const updated = [...prev];
            categoriesToActivate.forEach((catToActivate) => {
              const index = updated.findIndex((c) => c.id === catToActivate.id);
              if (index >= 0) {
                updated[index] = catToActivate;
              }
            });
            return updated;
          });
          
          // Notify parent for each updated category
          categoriesToActivate.forEach((cat) => {
            onEditCategory(cat);
          });
          
          toast.success(t('categoriesActivated', { count: categoriesToActivate.length }), { id: toastId });
        } catch (error) {
          toast.error(t('errorActivatingCategories'), { id: toastId });
        }
      }
    },
    [categories, creatingCategories, updateCategories, onEditCategory, tenantId, t]
  );

  // Check if selected category can be activated (inactive and has complete chain)
  const selectedCategory = useMemo(() => {
    if (!selected) return null;
    return categoryMap.get(selected) || null;
  }, [selected, categoryMap]);

  const canActivateSelected = useMemo(() => {
    if (!selectedCategory) return false;
    return !selectedCategory.isActive && hasCompleteChildrenChain(selectedCategory);
  }, [selectedCategory, hasCompleteChildrenChain]);
  
  // Expand all when searching
  useEffect(() => {
    if (searchQuery.trim()) {
      const allIds = new Set<string>();
      const collectIds = (cat: RequestCategoryValues) => {
        if (cat.children && cat.children.length > 0) {
          allIds.add(cat.id);
          cat.children.forEach((childId) => {
            const child = categoryMap.get(childId);
            if (child) collectIds(child);
          });
        }
      };
      filteredRootCategories.forEach(collectIds);
      setExpanded(allIds);
    }
  }, [searchQuery, filteredRootCategories, categoryMap]);
  
  // Keep root categories expanded when categories change
  useEffect(() => {
    setExpanded((prev) => {
      const next = new Set(prev);
      rootCategories.forEach((cat) => {
        next.add(cat.id);
      });
      return next;
    });
  }, [rootCategories]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between border-b bg-background/50 px-4 py-2">
        {isSearchOpen ? (
          <div className="flex w-full items-center gap-2 rounded-md border px-3 py-2 text-sm">
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-grow bg-transparent outline-none"
              placeholder={t('searchPlaceholder')}
              autoFocus
            />
            <Button variant="ghost" size="icon" className="h-4 w-4" onClick={() => setIsSearchOpen(false)}>
              ×
            </Button>
          </div>
        ) : (
          <>
            <h2 className="text-lg font-semibold tracking-tight">{t('categories')}</h2>
            <div className="flex items-center gap-2">
              {canActivateSelected && (
                <Hint label={t('activateCategoryAndChildren')} side="bottom">
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="icon"
                    onClick={() => selectedCategory && activateCategoryAndChildren(selectedCategory.id)}
                  >
                    <CheckCheck className="h-4 w-4" />
                  </Button>
                </Hint>
              )}
              <Button type="button" variant="ghost" size="icon" onClick={() => setIsSearchOpen(true)}>
                <FileSearch />
              </Button>
            </div>
          </>
        )}
      </div>

      <div className="flex-1 flex flex-col overflow-y-auto p-2 space-y-1">
        {filteredRootCategories.length === 0 ? (
          <>
            <div className="flex items-center justify-center h-full">
              <p className="text-muted-foreground text-sm">
                {searchQuery ? 'No se encontraron resultados' : 'No hay categorías'}
              </p>
            </div>
            {/* Add category button - only shown when there are no root categories (only one root allowed) */}
            {hierarchy.levels.length > 0 && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="border-2 border-dashed w-full"
                onClick={() => onAddCategory(hierarchy.levels[0].id)}
                disabled={hasCreatingCategory}>
                <FolderPlus className="h-4 w-4 mr-2" />
                {t('addCategoryButton', { categoryName: hierarchy.levels[0].name })}
              </Button>
            )}
          </>
        ) : (
          <>
            {filteredRootCategories.map((category) => (
              <CategoryTreeNode
                key={category.id}
                category={category}
                level={0}
                hierarchy={hierarchy}
                categoryMap={categoryMap}
                expanded={expanded}
                selected={selected}
                renamingId={renamingId}
                renameValue={renameValue}
                onRenameValueChange={setRenameValue}
                onToggleExpand={handleToggleExpand}
                onSelect={handleSelect}
                onStartRename={handleStartRename}
                onFinishRename={handleFinishRename}
                onCancelRename={handleCancelRename}
                onAddCategory={onAddCategory}
                creatingCategories={creatingCategories}
                hasCreatingCategory={hasCreatingCategory}
                t={t}
              />
            ))}
          </>
        )}
      </div>
    </div>
  );
};

const CategoryTreeNode = ({
  category,
  level,
  hierarchy,
  categoryMap,
  expanded,
  selected,
  renamingId,
  renameValue,
  onRenameValueChange,
  onToggleExpand,
  onSelect,
  onStartRename,
  onFinishRename,
  onCancelRename,
  onAddCategory,
  creatingCategories,
  hasCreatingCategory,
  t,
}: CategoryTreeNodeProps) => {
  const hasChildren = category.children && category.children.length > 0;
  const isExpanded = expanded.has(category.id);
  const isSelected = selected === category.id;
  const isRenaming = renamingId === category.id;
  const isCreating = creatingCategories.has(category.id);
  
  // Get the actual level index based on hierarchyLevelId (not the tree position)
  const actualLevelIndex = hierarchy.levels.findIndex((l) => l.id === category.hierarchyLevelId);
  const levelName = hierarchy.levels[actualLevelIndex];
  const nextLevel = hierarchy.levels[actualLevelIndex + 1];
  
  // Helper function to check if a category has incomplete children chain (missing levels down to last level)
  const hasIncompleteChildrenChain = (cat: RequestCategoryValues): boolean => {
    const allCategories = [...Array.from(categoryMap.values())];
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
      
      const children = allCategories.filter(
        (c) => c.parentCategoryId === category.id && c.hierarchyLevelId === nextLevelId
      );
      
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
  
  // Helper function to check if hierarchy chain is complete up to a given category
  const isHierarchyComplete = (cat: RequestCategoryValues): boolean => {
    if (actualLevelIndex === 0) return true; // Root level is always complete
    
    // Build ancestor chain
    const ancestorChain: RequestCategoryValues[] = [];
    let current: RequestCategoryValues | undefined = cat;
    
    while (current?.parentCategoryId) {
      const parent = categoryMap.get(current.parentCategoryId);
      if (!parent) return false; // Parent not found - invalid
      ancestorChain.push(parent);
      current = parent;
    }
    
    // Check that all levels from 0 to actualLevelIndex - 1 are present
    for (let i = 0; i < actualLevelIndex; i++) {
      const expectedLevelId = hierarchy.levels[i]?.id;
      if (!expectedLevelId) continue;
      
      const hasLevel = ancestorChain.some((ancestor) => ancestor.hierarchyLevelId === expectedLevelId);
      if (!hasLevel) return false; // Missing level in chain
    }
    
    // Check that parent is at immediately previous level
    if (cat.parentCategoryId) {
      const parent = categoryMap.get(cat.parentCategoryId);
      if (parent) {
        const parentLevelIndex = hierarchy.levels.findIndex((l) => l.id === parent.hierarchyLevelId);
        if (parentLevelIndex !== actualLevelIndex - 1) return false; // Gap in hierarchy
      }
    }
    
    return true;
  };
  
  // Only show "Add" button if hierarchy is complete and there's a next level
  const canAddNextLevel = isHierarchyComplete(category) && nextLevel !== undefined;
  
  // Disable selection if there's a creating category and this is not it
  const isSelectionDisabled = hasCreatingCategory && !isCreating;

  return (
    <div className={`flex flex-col gap-2 ${level > 0 ? 'pl-6' : ''}`}>
      <div className={`${level > 0 ? 'border-l-2 border-dashed pl-2' : ''} group relative`}>
        <Hint label={levelName?.name || ''} side="right">
          <div
            className={cn(
              'flex w-full items-center justify-start space-x-2 rounded-md text-sm font-medium min-w-[100px] flex-shrink-0 transition-colors',
              isSelected && isCreating
                ? 'bg-muted text-muted-foreground'
                : isSelected
                ? 'bg-primary text-primary-foreground'
                : 'hover:bg-accent hover:text-accent-foreground'
            )}>
            {hasChildren && (
              <Button
                variant="ghost"
                size="icon"
                className="ml-1 h-6 w-6"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleExpand(category.id);
                }}>
                {isExpanded ? <ChevronDown className="h-4 w-4 text-inherit" /> : <ChevronRight className="h-4 w-4 text-inherit" />}
              </Button>
            )}

            {isRenaming ? (
              <div className="flex w-full items-center gap-2 rounded-md bg-muted/50 px-3 py-2 cursor-pointer">
                {hasChildren ? <Folder className="h-4 w-4 text-inherit" /> : <File className="h-4 w-4 text-inherit" />}
                <input
                  value={renameValue}
                  onChange={(e) => onRenameValueChange(e.target.value)}
                  onBlur={() => onFinishRename(category)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      onFinishRename(category);
                    } else if (e.key === 'Escape') {
                      onCancelRename(category);
                    }
                  }}
                  className="w-full bg-transparent outline-none"
                  autoFocus
                />
              </div>
            ) : (
              <button
                type="button"
                className={cn(
                  "flex-1 text-sm flex items-center space-x-2 px-3 py-2 bg-transparent",
                  isSelectionDisabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"
                )}
                onClick={() => !isSelectionDisabled && onSelect(category)}
                disabled={isSelectionDisabled}>
                {hasChildren ? <Folder className="h-4 w-4 text-inherit" /> : <File className="h-4 w-4 text-inherit" />}
                <span className={cn(isCreating && 'italic text-muted-foreground')}>
                  {isCreating ? (category.name || t('creating', { levelName: levelName?.name || '' })) : category.name}
                </span>
                {isCreating && (
                  <span className="text-xs text-muted-foreground ml-1">
                    ({t('creating', { levelName: levelName?.name || '' })})
                  </span>
                )}
                {/* Active/Inactive indicator */}
                {!isCreating && (
                  <Hint 
                    label={category.isActive ? t('active') : t('inactive')} 
                    side="right"
                  >
                    {category.isActive ? (
                      <CheckCircle2 className={cn(
                        "h-3.5 w-3.5 flex-shrink-0",
                        isSelected 
                          ? "text-green-300 dark:text-green-400" 
                          : "text-green-600 dark:text-green-500"
                      )} />
                    ) : (
                      <Circle className={cn(
                        "h-3.5 w-3.5 flex-shrink-0",
                        isSelected 
                          ? "text-primary-foreground/60" 
                          : "text-muted-foreground/70"
                      )} />
                    )}
                  </Hint>
                )}
                {hasIncompleteChildrenChain(category) && (
                  <Hint label={t('incompleteChildrenChainWarning', { levelName: levelName?.name || '' })} side="right">
                    <AlertCircle className={cn(
                      "h-4 w-4 flex-shrink-0",
                      isSelected 
                        ? "text-yellow-300 dark:text-yellow-400" 
                        : "text-yellow-600 dark:text-yellow-400"
                    )} />
                  </Hint>
                )}
              </button>
            )}

            <div className="absolute right-1 top-1/2 flex -translate-y-1/2 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-6 w-6">
                    <MoreHorizontal className="h-3.5 w-3.5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onStartRename(category)}>
                    <Edit className="h-4 w-4 mr-2" />
                    {t('rename')}
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-destructive">
                    <Trash className="h-4 w-4 mr-2" />
                    {t('delete')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </Hint>
      </div>

      {hasChildren && isExpanded && (
        <div className={cn(level > 0 ? 'border-l-2 border-dashed' : '')}>
          {category.children.map((childId) => {
            const child = categoryMap.get(childId);
            if (!child) return null;
            return (
              <CategoryTreeNode
                key={childId}
                category={child}
                level={level + 1}
                hierarchy={hierarchy}
                categoryMap={categoryMap}
                expanded={expanded}
                selected={selected}
                renamingId={renamingId}
                renameValue={renameValue}
                onRenameValueChange={onRenameValueChange}
                onToggleExpand={onToggleExpand}
                onSelect={onSelect}
                onStartRename={onStartRename}
                onFinishRename={onFinishRename}
                onCancelRename={onCancelRename}
                onAddCategory={onAddCategory}
                creatingCategories={creatingCategories}
                hasCreatingCategory={hasCreatingCategory}
                t={t}
              />
            );
          })}
        </div>
      )}
      {/* Add category button - only shown if hierarchy is complete and there's a next level */}
      {canAddNextLevel && (isExpanded || !hasChildren) && (
        <div className={level > 0 ? 'pl-6 border-l-2 border-dashed' : 'pl-6'}>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="border-2 border-dashed w-full"
            onClick={() => onAddCategory(nextLevel.id, category.id)}
            disabled={hasCreatingCategory}>
            <FolderPlus className="h-4 w-4 mr-2" />
            {t('addCategoryButton', { categoryName: nextLevel.name })}
          </Button>
        </div>
      )}
      {/* Show warning if hierarchy is incomplete */}
      {!isHierarchyComplete(category) && actualLevelIndex > 0 && (
        <div className={level > 0 ? 'pl-4 border-l-2 border-dashed' : 'pl-6'}>
          <div className="text-xs text-muted-foreground bg-muted/50 px-3 py-2 rounded-md border border-dashed">
            {t('incompleteHierarchyWarning', { levelName: levelName?.name || '' })}
          </div>
        </div>
      )}
    </div>
  );
};
