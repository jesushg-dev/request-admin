import React, { useCallback, useMemo } from 'react';
import {
  createOnDropHandler,
  dragAndDropFeature,
  DragTarget,
  hotkeysCoreFeature,
  insertItemsAtTarget,
  ItemInstance,
  keyboardDragAndDropFeature,
  removeItemsFromParents,
  renamingFeature,
  searchFeature,
  selectionFeature,
  syncDataLoaderFeature,
} from '@headless-tree/core';
import { AssistiveTreeDescription, useTree } from '@headless-tree/react';
import { ChevronDown, ChevronRight, Edit, File, FilePlus2, FileSearch, Folder, FolderPlus, MoreHorizontal, Trash } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { RequestHierarchyWithLevelsType } from '@/types/zenstackhq/hierarchy';
import { generateUuid } from '@/lib/id';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Hint } from '@/components/hint';

import { RequestCategoryValues } from './category-form';

const createCategoryTreeData = (categories: RequestCategoryValues[]) => {
  const data: Record<string, RequestCategoryValues> = {};
  const rootId = 'root';

  // First pass: Create all nodes with parent/child relationships
  categories.forEach((cat) => {
    data[cat.id] = {
      ...cat,
    } as RequestCategoryValues;
  });

  // Find root-level categories (no parent)
  const rootCategoryIds = categories.filter((c) => !c.parentCategoryId).map((c) => c.id);

  // Create root node
  data[rootId] = {
    id: rootId,
    name: 'root',
    children: rootCategoryIds,
    parentCategoryId: null,
    isActive: true,
    isEligibleForNewClients: false,
    isSubCategoryVisible: true,
    sla: { id: '', resolutionTime: 0, escalationTime: 0 },
    guides: [],
    requirements: [],
    forms: [],
    hierarchyLevelId: '',
    description: '',
  } as RequestCategoryValues;

  return {
    data,
    syncDataLoader: {
      getItem: (id: string) => data[id],
      getChildren: (id: string) => data[id]?.children ?? [],
    },
    rootId,
  };
};

export interface CategoryTreeViewProps {
  categories: RequestCategoryValues[];
  hierarchy: RequestHierarchyWithLevelsType;
  onEditCategory: (category: RequestCategoryValues) => void;
  onAddCategory: (hierarchyLevelId: string, parentCategoryId?: string | null) => void;
}

export const CategoryTreeView: React.FC<CategoryTreeViewProps> = ({ onAddCategory, onEditCategory, categories, hierarchy }) => {
  const t = useTranslations('component.categoryTreeView');
  const { data, syncDataLoader, rootId } = useMemo(() => createCategoryTreeData(categories), [categories]);

  const insertNewItem = useCallback(
    (dt: DataTransfer) => {
      const newId = generateUuid();
      const base = JSON.parse(dt.getData('application/json'));

      data[newId] = {
        ...base,
        id: newId,
        children: [],
        isActive: true,
        isEligibleForNewClients: false,
        isSubCategoryVisible: true,
        sla: { id: '', resolutionTime: 0, escalationTime: 0 },
        executionSteps: [],
        guides: [],
        requirements: [],
        forms: [],
        parentCategoryId: null,
        hierarchyLevelId: '',
        description: '',
      } as RequestCategoryValues;

      return newId;
    },
    [data]
  );

  const handleDrop = useCallback(
    (dt: DataTransfer, target: DragTarget<RequestCategoryValues>) => {
      const newId = insertNewItem(dt);
      insertItemsAtTarget([newId], target, (item, newChildren) => {
        data[item.getId()].children = newChildren;
      });
    },
    [data, insertNewItem]
  );

  const handleForeignDrop = useCallback((items: ItemInstance<RequestCategoryValues>[]) => {
    removeItemsFromParents(items, (item, newChildren) => {
      item.getItemData().children = newChildren;
    });
  }, []);

  const handleRename = useCallback(
    (item: ItemInstance<RequestCategoryValues>, value: string) => {
      data[item.getId()].name = value;
    },
    [data]
  );

  const tree = useTree<RequestCategoryValues>({
    indent: 20,
    rootItemId: rootId,
    dataLoader: syncDataLoader,
    getItemName: (item) => item.getItemData().name,
    isItemFolder: (item) => item.getItemData().children.length > 0,
    canReorder: true,
    onDrop: createOnDropHandler((item, newChildren) => {
      data[item.getId()].children = newChildren;
    }),
    onRename: handleRename,
    onDropForeignDragObject: handleDrop,
    onCompleteForeignDrop: handleForeignDrop,
    createForeignDragObject: (items) => ({
      format: 'application/json',
      data: JSON.stringify(items.map((i) => i.getItemData())),
    }),
    canDropForeignDragObject: (_, target) => target.item.isFolder(),
    initialState: { expandedItems: [rootId], selectedItems: [] },
    features: [syncDataLoaderFeature, selectionFeature, hotkeysCoreFeature, dragAndDropFeature, keyboardDragAndDropFeature, renamingFeature, searchFeature],
  });

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between border-b bg-background/50 px-4 py-2">
        {tree.isSearchOpen() ? (
          <div className="flex w-full items-center gap-2 rounded-md border px-3 py-2 text-sm">
            <input {...tree.getSearchInputElementProps()} className="flex-grow bg-transparent outline-none" placeholder={t('searchPlaceholder')} />
            <span>
              {tree.getSearchMatchingItems().length} {t('matches')}
            </span>
          </div>
        ) : (
          <>
            <h2 className="text-lg font-semibold tracking-tight">{t('categories')}</h2>
            <div className="flex items-center gap-2">
              <Button type="button" variant="ghost" size="icon" onClick={() => onAddCategory(hierarchy.levels[0].id)}>
                <FilePlus2 />
              </Button>
              <Button type="button" variant="ghost" size="icon" onClick={() => tree.openSearch()}>
                <FileSearch />
              </Button>
            </div>
          </>
        )}
      </div>

      <div className="flex-1 flex flex-col overflow-y-auto p-2">
        <AssistiveTreeDescription tree={tree} />
        <div {...tree.getContainerProps()} className="space-y-1">
          {tree.getItems().map((item) => {
            const id = item.getId();
            const levelName = hierarchy.levels[item.getItemMeta().level];
            const nextLevel = hierarchy.levels[item.getItemMeta().level + 1];

            return (
              <div style={{ paddingLeft: item.getItemMeta().level * 25 }} key={id} {...item.getProps()} onClick={() => {}}>
                <Hint label={levelName.name} side="right">
                  <div
                    className={cn(
                      'group relative flex w-full items-center justify-start space-x-2 rounded-md text-sm font-medium min-w-[100px] flex-shrink-0 transition-colors',
                      item.isSelected() ? 'bg-primary text-primary-foreground' : 'hover:bg-accent hover:text-accent-foreground'
                    )}>
                    {item.isFolder() && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="ml-1 h-6 w-6"
                        onClick={(e) => {
                          e.stopPropagation();
                          // eslint-disable-next-line @typescript-eslint/no-unused-expressions
                          item.isExpanded() ? item.collapse() : item.expand();
                        }}>
                        {item.isExpanded() ? <ChevronDown className="h-4 w-4 text-inherit" /> : <ChevronRight className="h-4 w-4 text-inherit" />}
                      </Button>
                    )}

                    {item.isRenaming() ? (
                      <div className="flex w-full items-center gap-2 rounded-md bg-muted/50 px-3 py-2 cursor-pointer">
                        {item.isFolder() ? <Folder className="h-4 w-4 text-inherit" /> : <File className="h-4 w-4 text-inherit" />}
                        <input {...item.getRenameInputProps()} className="w-full bg-transparent outline-none" />
                      </div>
                    ) : (
                      <button
                        type="button"
                        className="flex-1 text-sm flex items-center space-x-2 px-3 py-2 cursor-pointer bg-transparent"
                        onClick={(e) => {
                          e.stopPropagation();
                          tree.setSelectedItems([item.getId()]);
                          onEditCategory(item.getItemData());
                        }}>
                        {item.isFolder() ? <Folder className="h-4 w-4 text-inherit" /> : <File className="h-4 w-4 text-inherit" />}
                        <span>{item.getItemName()}</span>
                      </button>
                    )}
                    <div className="absolute right-1 top-1/2 flex -translate-y-1/2 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                      {nextLevel && (
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => onAddCategory(nextLevel.id, item.getId())} title={t('addSubcategory', { levelName: nextLevel.name })}>
                          <FolderPlus className="h-3.5 w-3.5" />
                        </Button>
                      )}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-6 w-6">
                            <MoreHorizontal className="h-3.5 w-3.5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => tree.getItemInstance(item.getId()).startRenaming()}>
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
            );
          })}
        </div>
      </div>
    </div>
  );
};
