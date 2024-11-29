'use client';

import React, { useEffect, useState, type FC } from 'react';
import { FolderTreeItemWrapper, SortableTree, TreeItemComponentProps } from 'dnd-kit-sortable-tree';

import { Button } from '@/components/form';
import { api, RouterOutputs } from '@/components/hoc/tanstack-query-provider';
import { TreeHierarchyProvider, useTreeHierarchyContext } from '@/components/hoc/tree-hierarchy-context';

type UserHierarchies = RouterOutputs['user']['getByAreaIdAndHierarchy'];
type UserHierarchyItem = UserHierarchies[0];

interface IHierarchyTreeProps {
  areaId: string;
  userId?: string;
  goBack: () => void;
  defaultValues?: UserHierarchies;
  submitForm?: (data: UserHierarchies) => void;
}

const HierarchyTree: FC<IHierarchyTreeProps> = ({ areaId, userId, defaultValues, submitForm, goBack }) => {
  const { data, isLoading, error } = api.user.getByAreaIdAndHierarchy.useQuery({
    areaId,
  });

  const [items, setItems] = useState<UserHierarchies>(defaultValues || []);

  useEffect(() => {
    if (data && items.length === 0) {
      setItems(data);
    }
  }, [data]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  const handleSubmit = () => {
    if (submitForm) {
      submitForm(items);
    }
  };

  return (
    <>
      <TreeHierarchyProvider userId={userId}>
        <SortableTree items={items} onItemsChanged={setItems} TreeItemComponent={MinimalTreeItemComponent} />
      </TreeHierarchyProvider>
      <div className="mt-5 flex w-full items-center justify-between">
        <Button type="button" onClick={goBack} className="rounded bg-white px-4 py-2 font-bold text-gray-800 hover:bg-gray-100 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700">
          Back
        </Button>
        <Button type="button" onClick={handleSubmit}>
          Continue
        </Button>
      </div>
    </>
  );
};

const MinimalTreeItemComponent = React.forwardRef<HTMLDivElement, TreeItemComponentProps<UserHierarchyItem>>((props, ref) => {
  const { userId } = useTreeHierarchyContext();
  const enableDrag = props.item.id === userId;
  const isCoordinator = props.item.children && props.item.children.length > 0;

  const name = props.item.name || 'Unnamed';
  const initialName = name
    .split(' ')
    .map((n) => n[0])
    .join('');

  return (
    <FolderTreeItemWrapper {...props} manualDrag showDragHandle={enableDrag} ref={ref}>
      <div className="px-6">
        <div className="text-xs font-bold uppercase text-gray-600">{isCoordinator ? 'Coordinator' : 'Employee'}</div>
        <div className="flex items-center pt-3">
          {props.item.image ? (
            <img src={props.item.image} alt={initialName} className="h-12 w-12 rounded-full" />
          ) : (
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-700 font-bold uppercase text-white">{initialName}</div>
          )}
          <div className="ml-4">
            <p className="font-bold">{name}</p>
            <p className="text-xs text-gray-700">{props.item.position || 'No position'}</p>
          </div>
        </div>
      </div>
    </FolderTreeItemWrapper>
  );
});

MinimalTreeItemComponent.displayName = 'MinimalTreeItemComponent';

export default HierarchyTree;
