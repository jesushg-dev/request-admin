// File: src/components/CategoryList.tsx

import React, { Fragment } from 'react';
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
import { ChevronRight, FileIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { cn } from '@/lib/utils';

import type { RequestCategory } from './request-type-form';

export interface CategoryListProps {
  categories: RequestCategory[];
}

/**
 * Flatten RequestCategory[], build lookup map + children arrays,
 * and inject a virtual root node with a translated name.
 */
function createCategoryTreeData(categories: RequestCategory[], translate: (key: string) => string) {
  const data: Record<string, RequestCategory> = {};

  // Recursively flatten nested categories
  function flatten(cats: RequestCategory[]) {
    cats.forEach((cat) => {
      const childrenIds = cat.subcategories.map((sub) => sub.id);
      data[cat.id] = { ...cat, children: childrenIds };
      if (childrenIds.length > 0) flatten(cat.subcategories);
    });
  }
  flatten(categories);

  // Top-level categories have no parentCategoryId
  const rootIds = categories.filter((c) => c.parentCategoryId == null).map((c) => c.id);

  // Create virtual root node
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
  } as RequestCategory;

  const syncDataLoader = {
    getItem: (id: string) => data[id],
    getChildren: (id: string) => data[id]?.children ?? [],
  };

  return { data, syncDataLoader, rootId };
}

export const CategoryList: React.FC<CategoryListProps> = ({ categories }) => {
  const t = useTranslations();
  const { data, syncDataLoader, rootId } = createCategoryTreeData(categories, t);

  let newItemId = 0;
  // Insert a new item when dropped from outside
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
    } as RequestCategory;
    return newId;
  };

  const onDropForeignDragObject = (dt: DataTransfer, target: DragTarget<RequestCategory>) => {
    const newId = insertNewItem(dt);
    insertItemsAtTarget([newId], target, (item, newChildren) => {
      data[item.getId()].children = newChildren;
    });
  };

  const onCompleteForeignDrop = (items: ItemInstance<RequestCategory>[]) =>
    removeItemsFromParents(items, (item, newChildren) => {
      item.getItemData().children = newChildren;
    });

  const onRename = (item: ItemInstance<RequestCategory>, value: string) => {
    data[item.getId()].name = value;
  };

  // ShadCN-style item classes
  const getItemClasses = (item: ItemInstance<RequestCategory>) =>
    cn(
      'flex w-full items-center px-3 py-2 rounded-md text-sm shadow-sm transition-colors',
      'hover:bg-muted/70 cursor-pointer gap-2',
      item.isSelected() && 'bg-accent text-accent-foreground ring-2 ring-ring',
      item.isFocused() && 'outline outline-2 outline-primary',
      item.isDragTarget() && 'bg-muted',
      item.isMatchingSearch() && 'bg-muted'
    );

  const tree = useTree<RequestCategory>({
    rootItemId: rootId,
    dataLoader: syncDataLoader,
    getItemName: (item) => item.getItemData().name,
    isItemFolder: (item) => item.getItemData().children?.length > 0,
    canReorder: true,
    onDrop: createOnDropHandler((item, newChildren) => {
      data[item.getId()].children = newChildren;
    }),
    onRename,
    onDropForeignDragObject,
    onCompleteForeignDrop,
    createForeignDragObject: (items) => ({
      format: 'application/json',
      data: JSON.stringify(items.map((i) => i.getItemData())),
    }),
    canDropForeignDragObject: (_, target) => target.item.isFolder(),
    indent: 20,
    features: [syncDataLoaderFeature, selectionFeature, hotkeysCoreFeature, dragAndDropFeature, keyboardDragAndDropFeature, renamingFeature, searchFeature],
    initialState: { expandedItems: [rootId], selectedItems: [] },
  });

  return (
    <>
      {tree.isSearchOpen() && (
        <div className="mb-2 flex w-full items-center gap-2 rounded-md border px-3 py-2 text-sm">
          <input {...tree.getSearchInputElementProps()} className="flex-grow bg-transparent outline-none" placeholder={t('searchPlaceholder')} />
          <span>
            {tree.getSearchMatchingItems().length} {t('matches')}
          </span>
        </div>
      )}

      <div {...tree.getContainerProps()} className="tree max-w-sm">
        <AssistiveTreeDescription tree={tree} />

        {tree.getItems().map((item) => (
          <Fragment key={item.getId()}>
            {item.isRenaming() ? (
              <div className="mb-1 px-3 py-2 rounded-md bg-muted/50" style={{ marginLeft: `${item.getItemMeta().level * 20}px` }}>
                <input {...item.getRenameInputProps()} className="w-full bg-transparent outline-none" />
              </div>
            ) : (
              <button {...item.getProps()} className="w-full text-left" style={{ paddingLeft: `${item.getItemMeta().level * 20}px` }}>
                <div className={getItemClasses(item)}>
                  {item.isFolder() ? (
                    <ChevronRight className={`w-4 h-4 transition-transform ${item.isExpanded() ? 'rotate-90' : ''}`} strokeWidth={1.5} />
                  ) : (
                    <FileIcon className="w-4 h-4" strokeWidth={1.5} />
                  )}
                  <span className="flex-1">{item.getItemName()}</span>
                </div>
              </button>
            )}
          </Fragment>
        ))}

        <div
          style={tree.getDragLineStyle()}
          className="absolute h-0.5 bg-blue-600 before:absolute before:top-[-3px] before:left-0 before:w-2 before:h-2 before:bg-white before:border-2 before:border-blue-600 before:rounded-full"
        />
      </div>

      <div className="mt-2 flex flex-wrap items-center justify-center gap-1">
        <div
          className="flex h-7 cursor-grab items-center rounded border border-gray-500 px-2 text-sm text-gray-700 hover:bg-gray-50 active:cursor-grabbing"
          draggable
          onDragStart={(e) => {
            e.dataTransfer.setData('application/json', JSON.stringify(data[Object.keys(data)[1]]));
          }}>
          <ChevronRight className="w-4 h-4 mr-2 rotate-90" />
          Drag me into the tree!
        </div>

        <div
          className="flex h-7 items-center rounded border border-dashed border-gray-500 px-6 text-sm text-gray-700"
          onDrop={(e) => {
            alert(e.dataTransfer.getData('application/json'));
          }}
          onDragOver={(e) => e.preventDefault()}>
          Drop items here!
        </div>

        <button className="h-7 rounded border border-gray-500 px-2 text-sm text-gray-700 hover:bg-gray-50" onClick={() => tree.openSearch()}>
          Search items
        </button>

        <button className="h-7 rounded border border-gray-500 px-2 text-sm text-gray-700 hover:bg-gray-50" onClick={() => tree.getItemInstance(rootId).startRenaming()}>
          Rename All Categories
        </button>
      </div>
    </>
  );
};
