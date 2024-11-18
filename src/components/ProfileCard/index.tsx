'use client';

import React from 'react';
import type { FC } from 'react';

import Image from 'next/image';
import { useSession } from 'next-auth/react';
import { MdOutlinePerson } from 'react-icons/md';

interface IProfileCardProps {}

const ProfileCard: FC<IProfileCardProps> = ({}) => {
  const session = useSession();
  return (
    <>
      <span className="hidden text-right lg:block">
        <span className="block text-sm font-medium text-black dark:text-white">{session.data?.user.name || 'User'}</span>
        <span className="block text-xs">{session.data?.user.email || 'Email'}</span>
      </span>

      <span className="h-12 w-12 rounded-full">
        {session.data?.user.image ? (
          <Image src={session.data.user.image} alt="User Image" width={48} height={48} className="rounded-full" />
        ) : (
          <span className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full bg-gray-500 text-white transition-colors">
            <MdOutlinePerson />
          </span>
        )}
      </span>
    </>
  );
};

export default ProfileCard;
