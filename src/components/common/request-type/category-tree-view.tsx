'use client';

import React from 'react';
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
import { ChevronDown, ChevronRight, FileIcon, FilePlus2, FileSearch } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { RequestHierarchyWithLevelsType } from '@/types/prisma/hierarchy';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuShortcut, ContextMenuTrigger } from '@/components/ui/context-menu';
import { Hint } from '@/components/hint';

import type { RequestCategory } from './request-type-form';

interface TreeRequestCategory extends RequestCategory {
  children: string[];
}

function createCategoryTreeData(categories: RequestCategory[]) {
  const data: Record<string, TreeRequestCategory> = {};

  function flatten(cats: RequestCategory[]) {
    cats.forEach((cat) => {
      const childrenIds = cat.subcategories.map((sub) => sub.id);
      data[cat.id] = {
        ...cat,
        children: childrenIds,
        parentCategoryId: cat.parentCategoryId || null,
      } as TreeRequestCategory;
      if (childrenIds.length > 0) flatten(cat.subcategories);
    });
  }
  flatten(categories);

  const rootIds = categories.filter((c) => !c.parentCategoryId).map((c) => c.id);
  const rootId = 'root';

  data[rootId] = {
    id: rootId,
    name: 'root',
    subcategories: rootIds.map((id) => data[id]),
    children: rootIds,
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
  } as TreeRequestCategory;

  const syncDataLoader = {
    getItem: (id: string) => data[id],
    getChildren: (id: string) => data[id]?.children ?? [],
  };

  return { data, syncDataLoader, rootId };
}

export interface CategoryTreeViewProps {
  onAddCategory: () => void;
  onEditCategory: (category: RequestCategory) => void;
  categories: RequestCategory[];
  hierarchy: RequestHierarchyWithLevelsType;
}

export const CategoryTreeView: React.FC<CategoryTreeViewProps> = ({ onAddCategory, onEditCategory, categories, hierarchy }) => {
  const t = useTranslations('component.categoryTreeView');
  const { data, syncDataLoader, rootId } = createCategoryTreeData(categories);

  let newItemId = 0;
  const insertNewItem = (dt: DataTransfer) => {
    const newId = `new-${newItemId++}`;
    const base = JSON.parse(dt.getData('application/json'));

    data[newId] = {
      ...base,
      id: newId,
      subcategories: [],
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
    } as TreeRequestCategory;

    return newId;
  };

  const handleDrop = (dt: DataTransfer, target: DragTarget<TreeRequestCategory>) => {
    const newId = insertNewItem(dt);
    insertItemsAtTarget([newId], target, (item, newChildren) => {
      data[item.getId()].children = newChildren;
    });
  };

  const handleForeignDrop = (items: ItemInstance<TreeRequestCategory>[]) => {
    removeItemsFromParents(items, (item, newChildren) => {
      item.getItemData().children = newChildren;
    });
  };

  const handleRename = (item: ItemInstance<TreeRequestCategory>, value: string) => {
    data[item.getId()].name = value;
  };

  const tree = useTree<TreeRequestCategory>({
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
              <Button type="button" variant="ghost" size="icon" onClick={onAddCategory}>
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
            const isFolder = item.isFolder();

            return (
              <ContextMenu key={id}>
                <ContextMenuTrigger asChild>
                  <div style={{ paddingLeft: item.getItemMeta().level * 16 }}>
                    {item.isRenaming() ? (
                      <div className="flex items-center px-3 py-2 rounded-md bg-muted/50 w-full gap-2">
                        <FileIcon className="w-4 h-4 opacity-50" />
                        <input {...item.getRenameInputProps()} className="w-full bg-transparent outline-none" />
                      </div>
                    ) : (
                      <Hint side="right" label={hierarchy.levels[item.getItemMeta().level]?.name ?? ''}>
                        <button
                          {...item.getProps()}
                          type="button"
                          className="w-full"
                          onClick={(e) => {
                            onEditCategory(item.getItemData());
                            item.getProps().onClick(e);
                          }}>
                          <div
                            className={cn(
                              'cursor-pointer flex w-full items-center justify-between rounded-md px-3 py-2 text-sm font-medium ' + 'min-w-[100px] flex-shrink-0',
                              item.isSelected() ? 'bg-accent text-accent-foreground' : 'hover:bg-accent/50'
                            )}>
                            <span className="flex items-center gap-2 flex-1 text-left text-xs">
                              <FileIcon className="w-4 h-4 flex-shrink-0 opacity-50" />
                              {item.getItemName()}
                            </span>
                            {isFolder && (item.isExpanded() ? <ChevronDown className="w-4 h-4 flex-shrink-0" /> : <ChevronRight className="w-4 h-4 flex-shrink-0" />)}
                          </div>
                        </button>
                      </Hint>
                    )}
                  </div>
                </ContextMenuTrigger>
                <ContextMenuContent>
                  <ContextMenuItem onClick={() => tree.getItemInstance(id).startRenaming()}>
                    {t('rename')} <ContextMenuShortcut>⌘R</ContextMenuShortcut>
                  </ContextMenuItem>
                  <ContextMenuItem>{t('delete')}</ContextMenuItem>
                </ContextMenuContent>
              </ContextMenu>
            );
          })}
        </div>
      </div>
    </div>
  );
};
