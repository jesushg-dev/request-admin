'use client';

import { useMemo } from 'react';
import { Link } from '@/i18n/routing';
import { useDroppable } from '@dnd-kit/core';
import { ChevronDownIcon, ChevronUpIcon, LoaderCircle, Plus } from 'lucide-react';
import { Tree, TreeDataProvider, TreeItem, TreeItemIndex, UncontrolledTreeEnvironment } from 'react-complex-tree';
import { BiGridVertical } from 'react-icons/bi';

import { cn } from '@/lib/utils';
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuShortcut, ContextMenuTrigger } from '@/components/ui/context-menu';
import { SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuItem } from '@/components/ui/sidebar';

import { ConvertedMenuItem, useDndSubmissionContext } from './dnd-submission-provider';

interface NavFormSubmissionsProps {
  tenantId: string;
  currentPath: string;
}

export function NavFormSubmissions({ currentPath }: NavFormSubmissionsProps) {
  const { formMenuItems, isLoading, deleteMenuItemById, updateMenuItemsParentAndPosition } = useDndSubmissionContext();
  const activeKey = useMemo(() => {
    return Object.keys(formMenuItems).find((key) => {
      const menuItem = formMenuItems[key];
      if (!menuItem?.data.url) return false;
      const menuItemPathname = (menuItem.data.url as { pathname: string }).pathname;
      return menuItemPathname === currentPath;
    });
  }, [formMenuItems, currentPath]);

  const { setNodeRef, isOver } = useDroppable({
    id: 'form-submissions',
  });

  const dataProvider = useMemo(() => {
    const customData = new CustomDataProviderImplementation<ConvertedMenuItem>(formMenuItems, updateMenuItemsParentAndPosition);
    return customData;
  }, [formMenuItems]);

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>Form Submissions</SidebarGroupLabel>
      <SidebarMenu ref={setNodeRef} className={cn('transition-colors duration-200', isOver && 'bg-muted/50 rounded-lg')}>
        <SidebarMenuItem>
          {isLoading ? (
            <div className="rounded-lg border-2 border-dashed p-4">
              <div className="flex flex-col items-center gap-2 text-center">
                <LoaderCircle className="h-6 w-6 animate-spin" />
                <p className="text-sm font-medium">Loading forms...</p>
              </div>
            </div>
          ) : (
            <>
              {Object.keys(formMenuItems).length <= 1 ? (
                <div className="rounded-lg border-2 border-dashed p-4">
                  <div className="flex flex-col items-center gap-2 text-center">
                    <Plus className="h-6 w-6" />
                    <p className="text-sm font-medium">Drop forms here</p>
                    <p className="text-muted-foreground text-xs">Drag and drop forms to add them to your navigation</p>
                  </div>
                </div>
              ) : (
                <UncontrolledTreeEnvironment<ConvertedMenuItem>
                  viewState={{}}
                  dataProvider={dataProvider}
                  getItemTitle={(item) => item.data.title}
                  canDragAndDrop
                  canDropOnFolder
                  canDropOnNonFolder
                  canReorderItems
                  renderItem={({ item, title, arrow, depth, context, children }) => (
                    <>
                      <ContextMenu>
                        <ContextMenuTrigger className="">
                          <li style={{ paddingLeft: `${depth * 10}px`, marginLeft: `2px` }} {...context.itemContainerWithChildrenProps}>
                            <div
                              className={cn('hover:bg-sidebar-accent hover:text-sidebar-accent-foreground flex w-full items-center gap-1 space-x-3 overflow-hidden rounded-md text-xs')}
                              {...context.itemContainerWithoutChildrenProps}
                              {...context.interactiveElementProps}>
                              <div className="pl-1">
                                <BiGridVertical className="h-4 w-4" />
                              </div>
                              <Link
                                className={cn('flex-1 py-2', activeKey === String(item.data.url) ? 'bg-sidebar-accent text-sidebar-accent-foreground' : 'text-sidebar-foreground')}
                                {...context.itemContainerWithChildrenProps}
                                href={item.data.url}>
                                {title}
                              </Link>
                              {arrow}
                            </div>
                          </li>
                        </ContextMenuTrigger>
                        <ContextMenuContent className="w-64">
                          <ContextMenuItem inset onClick={() => deleteMenuItemById(String(item.index))}>
                            Delete
                            <ContextMenuShortcut>⌘D</ContextMenuShortcut>
                          </ContextMenuItem>
                          <ContextMenuItem inset disabled>
                            Rename
                            <ContextMenuShortcut>⌘R</ContextMenuShortcut>
                          </ContextMenuItem>
                        </ContextMenuContent>
                      </ContextMenu>
                      {children}{' '}
                    </>
                  )}
                  renderItemArrow={({ item, context }) =>
                    item.isFolder ? (
                      <span {...context.arrowProps} className="p-2">
                        {context.isExpanded ? <ChevronDownIcon className="h-4 w-4" /> : <ChevronUpIcon className="h-4 w-4" />}
                      </span>
                    ) : null
                  }>
                  <Tree treeId="tree-1" rootItem="root" treeLabel="Tree Example 2" />
                </UncontrolledTreeEnvironment>
              )}
            </>
          )}
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroup>
  );
}

class CustomDataProviderImplementation<T extends { title: string }> implements TreeDataProvider<T> {
  data: Record<TreeItemIndex, TreeItem<T>>;
  treeChangeListeners: ((changedItemIds: TreeItemIndex[]) => void)[] = [];
  updateMenuItemsParentAndPosition: (itemId: string, newChildren: string[]) => void;

  constructor(convertedItems: Record<TreeItemIndex, TreeItem<T>>, updateMenuItemsParentAndPosition: (itemId: string, newChildren: string[]) => void) {
    this.data = convertedItems;
    this.updateMenuItemsParentAndPosition = updateMenuItemsParentAndPosition;
  }

  async getTreeItem(itemId: TreeItemIndex): Promise<TreeItem<T>> {
    const node = this.data[itemId];
    return node as TreeItem<T>;
  }

  async onChangeItemChildren(itemId: TreeItemIndex, newChildren: TreeItemIndex[]): Promise<void> {
    if (this.data[itemId]) {
      this.data[itemId].children = newChildren;
      this.data[itemId].isFolder = newChildren.length > 0;
      this.treeChangeListeners.forEach((listener) => listener([itemId]));
      this.updateMenuItemsParentAndPosition(String(itemId), newChildren as string[]);
    }
  }

  onDidChangeTreeData(listener: (changedItemIds: TreeItemIndex[]) => void): { dispose: () => void } {
    this.treeChangeListeners.push(listener);
    return {
      dispose: () => {
        const index = this.treeChangeListeners.indexOf(listener);
        if (index > -1) {
          this.treeChangeListeners.splice(index, 1);
        }
      },
    };
  }

  async onRenameItem(item: TreeItem<T>, name: string): Promise<void> {
    if (item.index in this.data) {
      const itemData = this.data[item.index]?.data;
      if (itemData?.title) {
        itemData.title = name;
      }
    }
  }

  injectItem(name: T): void {
    if (this.data.root && this.data.root.children) {
      const rand: TreeItemIndex = `${Math.random()}`;
      this.data[rand] = { data: name, index: rand } as TreeItem<T>;
      this.data.root.children.push(rand as unknown as TreeItemIndex);
      this.treeChangeListeners.forEach((listener) => listener(['root']));
    }
  }
}
