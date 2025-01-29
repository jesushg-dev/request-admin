'use client';

import { createContext, ReactNode, useContext, useMemo, useState } from 'react';
import { I18Link } from '@/i18n/routing';
import { useCreateMenuItem, useDeleteMenuItem, useFindManyMenuItem, useUpdateManyMenuItem } from '@/services/api/hooks';
import { Active, DndContext, DragEndEvent, DragOverlay } from '@dnd-kit/core';
import { MenuItem as DatabaseMenuItem, type Form } from '@prisma/client';
import { BookTextIcon, LucideIcon } from 'lucide-react';
import { TreeItem } from 'react-complex-tree';

import useTenantId from '@/hooks/use-tenant-id';
import { FormCard } from '@/components/builder-form/form-card';
import ClientOnlyPortal from '@/components/cient-only-portal';

export type ConvertedMenuItem = {
  title: string;
  icon?: LucideIcon;
  url: I18Link;
};

interface DragEndEventForm extends DragEndEvent {
  active: Active & { data: { current: Form } };
}

interface DndSubmissionContextProps {
  isLoading: boolean;
  currentForm: Form | null;
  formMenuItems: Record<string, TreeItem<ConvertedMenuItem>>;
  setCurrentForm: React.Dispatch<React.SetStateAction<Form | null>>;
  deleteMenuItemById: (id: string) => void;
  updateMenuItemsParentAndPosition: (itemId: string, newChildren: string[]) => void;
}

const DndSubmissionContext = createContext<DndSubmissionContextProps>({
  isLoading: true,
  formMenuItems: {},
  currentForm: null,
  setCurrentForm: () => {},
  deleteMenuItemById: () => {},
  updateMenuItemsParentAndPosition: () => {},
});

export function DndSubmissionProvider({ children }: { children: ReactNode }) {
  const tenantId = useTenantId();

  const { data, isLoading, isRefetching } = useFindManyMenuItem({
    where: { tenantId },
  });

  const { mutateAsync: addMenuItem } = useCreateMenuItem();
  const { mutateAsync: deleteMenuItem } = useDeleteMenuItem();
  const { mutateAsync: updateMenuItem } = useUpdateManyMenuItem();

  const [currentForm, setCurrentForm] = useState<Form | null>(null);

  const formMenuItems = useMemo(() => {
    return convertMenuItemsToTree(data ?? [], tenantId);
  }, [data, tenantId]);

  const handleDragEnd = (event: DragEndEventForm) => {
    const { active, over } = event;

    if (over && over.id === 'form-submissions') {
      setCurrentForm(null);
      const existingItem = data?.some((item) => item.slug === active.data.current.id);
      if (existingItem) return;

      addMenuItemToDatabase(active.data.current);
    }
  };

  const handleDragStart = (event: DragEndEventForm) => {
    setCurrentForm(event.active.data.current);
  };

  const addMenuItemToDatabase = async (form: Form) => {
    try {
      const newItem = await addMenuItem({
        data: {
          title: form.name,
          icon: 'BookTextIcon',
          isActive: true,
          pathname: '/admin/[tenantId]/form-designer/[slug]',
          slug: form.id,
          tenantId,
          parentId: null,
        },
      });

      if (!newItem) {
        throw new Error('Failed to add menu item');
      }
    } catch (error) {
      console.error(`Failed to add menu item with ID ${form.id}:`, error);
    }
  };

  const updateMenuItemsParentAndPosition = async (itemId: string, newChildren: string[]) => {
    console.log('🚀 ~ updateMenuItemsParentAndPosition ~ itemId:', itemId, newChildren);
    try {
      await Promise.all(
        newChildren.map((childId, index) =>
          updateMenuItem({
            where: { id: childId },
            data: {
              parentId: itemId === 'root' ? null : itemId,
              position: index,
            },
          })
        )
      );
      console.log('Menu items updated successfully');
    } catch (error) {
      console.error('Failed to update menu items:', error);
    }
  };

  const deleteMenuItemById = async (id: string) => {
    try {
      await updateMenuItem({ where: { parentId: id }, data: { parentId: null } });
      await deleteMenuItem({ where: { id } });
    } catch (error) {
      console.error(`Failed to delete menu item with ID ${id}:`, error);
    }
  };

  return (
    <DndSubmissionContext.Provider
      value={{
        isLoading: isLoading || isRefetching,
        formMenuItems,
        currentForm,
        setCurrentForm,
        deleteMenuItemById,
        updateMenuItemsParentAndPosition,
      }}>
      <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        {children}

        <ClientOnlyPortal selector="#body">
          <DragOverlay
            //disable effect that the item returns to its original position
            adjustScale={true}>
            {currentForm && <FormCard form={currentForm} className="cursor-pointer" />}
          </DragOverlay>
        </ClientOnlyPortal>
      </DndContext>
    </DndSubmissionContext.Provider>
  );
}

export function useDndSubmissionContext() {
  const context = useContext<DndSubmissionContextProps>(DndSubmissionContext);
  if (!context) {
    throw new Error('useDndSubmissionContext must be used within a DndSubmissionProvider');
  }
  return context;
}

function convertMenuItemsToTree(rawMenuItems: DatabaseMenuItem[], tenantId: string): Record<string, TreeItem<ConvertedMenuItem>> {
  const result: Record<string, TreeItem<ConvertedMenuItem>> = {};
  const itemsMap: Record<string, DatabaseMenuItem[]> = {};

  // Group items by parentId
  rawMenuItems.forEach((item) => {
    const parentId = item.parentId || 'root';
    itemsMap[parentId] = [...(itemsMap[parentId] || []), item];
  });

  // Process items recursively
  const processItem = (item: DatabaseMenuItem): string => {
    const children = itemsMap[item.id]?.map(processItem) || [];
    result[item.id] = {
      index: item.id,
      isFolder: children.length > 0,
      children,
      data: {
        title: item.title,
        icon: item.icon ? BookTextIcon : undefined,
        url: {
          pathname: item.pathname as '/admin/[tenantId]/form-designer/[slug]',
          params: { tenantId, slug: item.slug },
        },
      },
    };
    return item.id;
  };

  // Process root-level items
  const rootChildren = itemsMap['root']?.map(processItem) || [];

  // Add root node
  result['root'] = {
    index: 'root',
    isFolder: true,
    children: rootChildren,
    data: {
      title: 'Root item',
      icon: undefined,
      url: { pathname: '/' },
    },
  };

  return result;
}
