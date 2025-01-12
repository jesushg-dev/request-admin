'use client';

import { FC } from 'react';
import { useParams } from 'next/navigation';

const UpdateIdentificationTypePage: FC = () => {
  const params = useParams<{ slug: string }>();

  return <div className="flex w-full flex-1 flex-col gap-4">{params.slug}</div>;
};

export default UpdateIdentificationTypePage;
