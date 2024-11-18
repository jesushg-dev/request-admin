import React, { useState } from 'react';
import type { FC } from 'react';

import { FiList } from 'react-icons/fi';

import { Button } from '@/components/Form';
import Scrollable from '@/components/Scrollable';
import LoadingComponent from './LoadingComponent';
import HandleListState from '@/components/HandleDataState';
import BackAndContinue from '@/components/common/BackAndContinue';

import type { UpdateRequirementInputs as RequirementInputs } from '@/connections/requirement';

interface IRequirementsFormProps {
  loading: boolean;
  requirements: RequirementInputs[];
  defaultValues?: Record<string, boolean> | null;
  onChange: (data: Record<string, boolean>) => void;
  goBack: () => void;
}

const RequirementsForm: FC<IRequirementsFormProps> = ({ loading, requirements, goBack, onChange, defaultValues }) => {
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>(defaultValues || {});

  const handleCheckChange = (id: string, isChecked: boolean) => {
    setCheckedItems((prev) => ({ ...prev, [id]: isChecked }));
  };

  const handleSubmit = () => {
    onChange(checkedItems);
  };

  const handleSelectAll = () => {
    const allChecked = requirements.every((item) => checkedItems[item.requirementId]);
    const newCheckedItems = requirements.reduce(
      (acc, item) => {
        acc[item.requirementId] = !allChecked;
        return acc;
      },
      {} as Record<string, boolean>
    );
    setCheckedItems(newCheckedItems);
  };

  return (
    <div className="flex flex-1 flex-col gap-4 p-6">
      <div className="col-span-1 flex w-full flex-1 flex-col md:col-span-1 lg:col-span-2">
        <div className="mb-2 flex w-full items-center justify-between">
          <h2 className="flex items-center gap-2 pb-6 text-sm font-bold">
            <FiList className="text-primary" /> Requirements {requirements.length > 0 && `(${requirements.length})`}
          </h2>
          <Button type="button" onClick={handleSelectAll} className="mx-2 py-1 text-sm">
            {requirements.every((item) => checkedItems[item.requirementId]) ? 'Unselect All' : 'Select All'}
          </Button>
        </div>
        <HandleListState isLoading={loading} isError={false} isEmpty={requirements.length === 0} skeleton={<LoadingComponent />}>
          <Scrollable>
            <ul className="space-y-4 overflow-x-hidden">
              {requirements.map((item) => (
                <li key={item.requirementId} className="flex w-full items-center gap-2.5 rounded-lg border bg-white py-2 pl-6 hover:border-gray-400">
                  <input
                    type="checkbox"
                    id={item.requirementId}
                    className="peer relative left-0 h-5 w-5 shrink-0 appearance-none rounded-sm border outline-none after:absolute after:left-0 after:top-0 after:h-full after:w-full after:bg-[url('data:image/svg+xml;base64,PHN2ZyBoZWlnaHQ9JzMwMHB4JyB3aWR0aD0nMzAwcHgnICBmaWxsPSIjZmZmZmZmIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB2aWV3Qm94PSIwIDAgMTAwIDEwMCIgdmVyc2lvbj0iMS4xIiB4PSIwcHgiIHk9IjBweCI+PHRpdGxlPmljb25fYnlfUG9zaGx5YWtvdjEwPC90aXRsZT48ZGVzYz5DcmVhdGVkIHdpdGggU2tldGNoLjwvZGVzYz48ZyBzdHJva2U9Im5vbmUiIHN0cm9rZS13aWR0aD0iMSIgZmlsbD0ibm9uZSIgZmlsbC1ydWxlPSJldmVub2RkIj48ZyBmaWxsPSIjZmZmZmZmIj48ZyB0cmFuc2Zvcm09InRyYW5zbGF0ZSgyNi4wMDAwMDAsIDI2LjAwMDAwMCkiPjxwYXRoIGQ9Ik0xNy45OTk5ODc4LDMyLjQgTDEwLjk5OTk4NzgsMjUuNCBDMTAuMjI2Nzg5MSwyNC42MjY4MDE0IDguOTczMTg2NDQsMjQuNjI2ODAxNCA4LjE5OTk4Nzc5LDI1LjQgTDguMTk5OTg3NzksMjUuNCBDNy40MjY3ODkxNCwyNi4xNzMxOTg2IDcuNDI2Nzg5MTQsMjcuNDI2ODAxNCA4LjE5OTk4Nzc5LDI4LjIgTDE2LjU4NTc3NDIsMzYuNTg1Nzg2NCBDMTcuMzY2ODIyOCwzNy4zNjY4MzUgMTguNjMzMTUyOCwzNy4zNjY4MzUgMTkuNDE0MjAxNCwzNi41ODU3ODY0IEw0MC41OTk5ODc4LDE1LjQgQzQxLjM3MzE4NjQsMTQuNjI2ODAxNCA0MS4zNzMxODY0LDEzLjM3MzE5ODYgNDAuNTk5OTg3OCwxMi42IEw0MC41OTk5ODc4LDEyLjYgQzM5LjgyNjc4OTEsMTEuODI2ODAxNCAzOC41NzMxODY0LDExLjgyNjgwMTQgMzcuNzk5OTg3OCwxMi42IEwxNy45OTk5ODc4LDMyLjQgWiI+PC9wYXRoPjwvZz48L2c+PC9nPjwvc3ZnPg==')] after:bg-[length:40px] after:bg-center after:bg-no-repeat after:content-[''] checked:bg-gray-500 hover:ring hover:ring-gray-300"
                    checked={!!checkedItems[item.requirementId]}
                    onChange={(e) => handleCheckChange(item.requirementId, e.target.checked)}
                  />
                  <label htmlFor={item.requirementId} className="inline-block w-full cursor-pointer font-medium text-gray-600 peer-checked:text-gray-400 peer-checked:line-through">
                    <div className="flex w-full flex-row items-center justify-between px-4">
                      <div>
                        <h3 className="text-sm font-bold">{item.name}</h3>
                        <p className="text-xs text-gray-400">{item.description}</p>
                      </div>
                    </div>
                  </label>
                </li>
              ))}
            </ul>
          </Scrollable>
        </HandleListState>
      </div>
      <BackAndContinue goBack={goBack} type="button" goContinue={handleSubmit} />
    </div>
  );
};

export default RequirementsForm;
