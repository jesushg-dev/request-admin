'use client';

import React, { memo } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

import { api, RouterOutputs } from '@/trpc/react';
import { Link } from '@/i18n/routing';
import { triggerConfirm } from '@/services/lib/message';
import useSubmit from '@/hooks/use-submit.hook';
import ErrorRetryFallback from '@/components/common/error-retry-fallback';
import { useFindManyArea } from '@/services/api/hooks';

type AreaOutputType = RouterOutputs['area']['findMany'][0];

const AreaMainPage: React.FC = () => {
  const router = useRouter();

  //const { mutateAsync: deleteAreaAsync } = api.area.delete.useMutation();
  const { data, isLoading, error, refetch } = useFindManyArea();

  return (
    <div className="flex flex-1 flex-col gap-10">
      <div className="border-stroke dark:border-strokedark border-b px-6 py-4">
        <h3 className="font-medium text-black dark:text-white"></h3>

        <span className="flex gap-1 text-sm text-gray-500 dark:text-gray-400">
          data: <pre>{JSON.stringify(data, null, 2)}</pre>
        </span>
        <span className="flex gap-1 text-sm text-gray-500 dark:text-gray-400">
          isLoading:
          <pre>{JSON.stringify(isLoading, null, 2)}</pre>
        </span>
        <span className="flex gap-1 text-sm text-gray-500 dark:text-gray-400">
          error
          <pre>{JSON.stringify(error, null, 2)}</pre>
        </span>
        <table className="w-full">
          <thead>
            <tr>
              <th>Id</th>
              <th>Name</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {data?.map((area: AreaOutputType) => (
              <tr key={area.id}>
                <td>{area.id}</td>
                <td>{area.name}</td>
                <td></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default memo(AreaMainPage);
