import Link from 'next/link';
import { useFindFirstPerson } from '@/services/api/hooks';
import { AlertTriangle, MailIcon, XIcon } from 'lucide-react';

import useTenantId from '@/hooks/use-tenant-id';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Spinner } from '@/components/spinner';

interface ProfileProps {
  userId: string;
  onClose: () => void;
}

export const Profile = ({ userId, onClose }: ProfileProps) => {
  const tenantId = useTenantId();

  const { data: user, isLoading: userLoading } = useFindFirstPerson({
    where: { userTenant: { tenantId, userId } },
  });

  if (userLoading) {
    return (
      <div className="flex h-full flex-col">
        <div className="flex h-[49px] items-center justify-between border-b border-gray-500/80 px-4">
          <p className="text-lg font-bold">Profile</p>
          <Button onClick={onClose} size="sm" variant="ghost">
            <XIcon className="stoke-[1.5] size-5" />
          </Button>
        </div>
        <Spinner />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex h-full flex-col">
        <div className="flex h-[49px] items-center justify-between border-b border-gray-500/80 px-4">
          <p className="text-lg font-bold">Profile</p>
          <Button onClick={onClose} size="sm" variant="ghost">
            <XIcon className="stoke-[1.5] size-5" />
          </Button>
        </div>
        <div className="flex h-full flex-col items-center justify-center gap-y-2">
          <AlertTriangle className="size-5 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Profile not found</p>
        </div>
      </div>
    );
  }

  const avatarFallback = user.firstName[0] ?? 'U';

  return (
    <>
      <div className="flex h-full flex-col">
        <div className="flex h-[49px] items-center justify-between border-b border-gray-500/80 px-4">
          <p className="text-lg font-bold">Profile</p>
          <Button onClick={onClose} size="sm" variant="ghost">
            <XIcon className="stoke-[1.5] size-5" />
          </Button>
        </div>
        <div className="flex flex-col items-center justify-center p-4">
          <Avatar className="size-full max-h-[256px] max-w-[256px]">
            <AvatarImage src={user.image ?? ''} alt={`${user.firstName} ${user.lastName}`} />
            <AvatarFallback className="aspect-square text-6xl">{avatarFallback}</AvatarFallback>
          </Avatar>
        </div>
        <div className="flex flex-col p-4">
          <p className="text-xl font-bold">
            {user.firstName} {user.lastName}
          </p>
        </div>
        <Separator className="bg-gray-100/70" />
        <div className="flex flex-col p-4">
          <p className="mb-4 text-sm font-bold">Contact Information</p>
          <div className="flex items-center gap-2">
            <div className="flex size-9 items-center justify-center rounded-md bg-accent">
              <MailIcon className="size-4" />
            </div>
            <div className="flex flex-col">
              <p className="text-[13px] font-semibold text-accent-foreground">Email Address</p>
              <Link href={`mailto:${user.email}`} className="text-seablue-300 text-sm hover:underline">
                {user.email}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
