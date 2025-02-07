'use client';

import { createContext, ReactNode, useContext, useOptimistic, useState, useTransition } from 'react';
import { I18Link } from '@/i18n/routing';
import { useCreateMenuItem, useDeleteMenuItem, useFindManyMenuItem, useUpdateManyMenuItem } from '@/services/api/hooks';
import { Active, DndContext, DragEndEvent, DragOverlay } from '@dnd-kit/core';
import { MenuItem as DatabaseMenuItem, type Form } from '@prisma/client';
import { BookTextIcon, LucideIcon } from 'lucide-react';
import { TreeItem } from 'react-complex-tree';

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
  formMenuItems: Record<string, TreeItem<ConvertedMenuItem>>;
  currentForm: Form | null;
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

type OptimisticAction = { type: 'updatePositions'; itemId: string; newChildren: string[] } | { type: 'delete'; id: string } | { type: 'add'; menuItem: TreeItem<ConvertedMenuItem> };

function optimisticReducer(state: Record<string, TreeItem<ConvertedMenuItem>>, action: OptimisticAction): Record<string, TreeItem<ConvertedMenuItem>> {
  switch (action.type) {
    case 'updatePositions': {
      if (action.itemId === 'root') {
        return {
          ...state,
          root: {
            ...state.root,
            children: action.newChildren,
          },
        };
      } else if (state[action.itemId]) {
        return {
          ...state,
          [action.itemId]: {
            ...state[action.itemId],
            children: action.newChildren,
          },
        };
      }
      return state;
    }
    case 'delete': {
      const newState = { ...state };
      delete newState[action.id];
      Object.keys(newState).forEach((key) => {
        if (newState[key].children && newState[key].children.includes(action.id)) {
          newState[key] = {
            ...newState[key],
            children: newState[key].children.filter((childId) => childId !== action.id),
          };
        }
      });
      return newState;
    }
    case 'add': {
      const newState = { ...state };
      newState[action.menuItem.index] = action.menuItem;
      newState['root'] = {
        ...newState['root'],
        children: [...(newState['root'].children || []), action.menuItem.index],
      };
      return newState;
    }
    default:
      return state;
  }
}

export function DndSubmissionProvider({ children, tenantId }: { children: ReactNode; tenantId: string; data: DatabaseMenuItem[] }) {
  const { mutateAsync: addMenuItem } = useCreateMenuItem();
  const { mutateAsync: deleteMenuItem } = useDeleteMenuItem();
  const { mutateAsync: updateMenuItem } = useUpdateManyMenuItem();
  const { data } = useFindManyMenuItem({ where: { tenantId } });
  const [currentForm, setCurrentForm] = useState<Form | null>(null);
  const [optimisticMenuItems, updateOptimisticMenuItems] = useOptimistic(convertMenuItemsToTree(data ?? [], tenantId), optimisticReducer);
  const [isPending, startTransition] = useTransition();

  const handleDragEnd = (event: DragEndEventForm) => {
    const { active, over } = event;
    if (over && over.id === 'form-submissions') {
      setCurrentForm(null);
      const existingItem = data?.some((item) => item.slug === active.data.current.id);
      if (existingItem) return;
      const newMenuItem: TreeItem<ConvertedMenuItem> = {
        index: active.data.current.id,
        isFolder: false,
        children: [],
        data: {
          title: active.data.current.name,
          icon: BookTextIcon,
          url: {
            pathname: '/admin/[tenantId]/form-designer/[slug]',
            params: { tenantId, slug: active.data.current.id },
          },
        },
      };
      startTransition(async () => {
        updateOptimisticMenuItems({ type: 'add', menuItem: newMenuItem });
        await addMenuItemToDatabase(active.data.current);
      });
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
    startTransition(async () => {
      updateOptimisticMenuItems({ type: 'updatePositions', itemId, newChildren });

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
      } catch (error) {
        console.error('Failed to update menu items:', error);
      }
    });
  };

  const deleteMenuItemById = async (id: string) => {
    startTransition(async () => {
      updateOptimisticMenuItems({ type: 'delete', id });
      try {
        await updateMenuItem({ where: { parentId: id }, data: { parentId: null } });
        await deleteMenuItem({ where: { id } });
      } catch (error) {
        console.error(`Failed to delete menu item with ID ${id}:`, error);
      }
    });
  };

  return (
    <DndSubmissionContext.Provider
      value={{
        isLoading: isPending,
        formMenuItems: optimisticMenuItems,
        currentForm,
        setCurrentForm,
        deleteMenuItemById,
        updateMenuItemsParentAndPosition,
      }}>
      <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        {children}
        <ClientOnlyPortal selector="#body">
          <DragOverlay adjustScale={true}>{currentForm && <FormCard form={currentForm} className="cursor-pointer" />}</DragOverlay>
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
  rawMenuItems.forEach((item) => {
    const parentId = item.parentId || 'root';
    itemsMap[parentId] = [...(itemsMap[parentId] || []), item];
  });
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
  const rootChildren = itemsMap['root']?.map(processItem) || [];
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
