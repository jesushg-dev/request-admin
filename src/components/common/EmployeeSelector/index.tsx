import React, { FC, useState, useEffect, useRef } from 'react';

import { api } from '@/hoc/tanstack-query-provider';
import EmployeeCard from './EmployeeCard';
import { type IEmployee } from '@/utils/types';

import { useVirtualizer } from '@tanstack/react-virtual';

interface IEmployeeSelectorProps {
  values?: IEmployee[];
  onChange?: (values: IEmployee[]) => void;
}

const EmployeeSelector: FC<IEmployeeSelectorProps> = ({ values, onChange }) => {
  const parentRef = useRef(null);
  const [selected, setSelected] = useState<IEmployee[]>(values || []);

  const { status, data, error, isFetching, isFetchingNextPage, fetchNextPage, hasNextPage } = api.user.infinite.useInfiniteQuery(
    { limit: 50 },
    { getNextPageParam: (lastPage) => lastPage.nextCursor }
  );

  // Flatten the pages of data into a single array of employees
  const employees = data ? data.pages.flatMap((page) => page.items) : [];

  const rowVirtualizer = useVirtualizer({
    count: hasNextPage ? employees.length + 1 : employees.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 65, // Adjust based on your EmployeeCard height
    overscan: 5,
  });

  useEffect(() => {
    if (values) {
      setSelected(values);
    }
  }, [values]);

  useEffect(() => {
    const [lastItem] = [...rowVirtualizer.getVirtualItems()].reverse();
    if (lastItem && lastItem.index >= employees.length - 1 && hasNextPage && !isFetchingNextPage) {
      fetchNextPage().then(console.log).catch(console.error);
    }
  }, [hasNextPage, fetchNextPage, employees.length, isFetchingNextPage, rowVirtualizer]);

  const handleAddOrRemove = (employee: IEmployee) => {
    const index = selected.findIndex((e) => e.id === employee.id);
    const newSelected = index === -1 ? [...selected, employee] : [...selected.slice(0, index), ...selected.slice(index + 1)];
    setSelected(newSelected);
    onChange?.(newSelected);
  };

  return (
    <div ref={parentRef} className="relative h-full flex-grow overflow-y-auto" style={{ height: '100%' }}>
      <div
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}>
        {rowVirtualizer.getVirtualItems().map((virtualRow) => {
          const isLoaderRow = virtualRow.index > employees.length - 1;
          const employee = employees[virtualRow.index];

          if (isLoaderRow) {
            <div key="loader" style={{ height: `35px` }}>
              Loading more...
            </div>;
          }

          return employee ? (
            <EmployeeCard
              {...employee}
              key={employee?.id}
              onClick={() => handleAddOrRemove(employee)}
              isSelected={selected.some((e) => e.id === employee.id)}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: `${virtualRow.size}px`,
                transform: `translateY(${virtualRow.start}px)`,
              }}
            />
          ) : (
            <div key="loader" style={{ height: `35px` }}>
              Loading more...
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default EmployeeSelector;
