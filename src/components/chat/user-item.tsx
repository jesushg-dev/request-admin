import Link from 'next/link';
import { cva, type VariantProps } from 'class-variance-authority';
import { useTranslations } from 'next-intl';

import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';

const userItemVariants = cva('flex h-7 items-center justify-start gap-1.5 overflow-hidden px-4 text-sm font-normal', {
  variants: {
    variant: {
      default: 'text-[#F9EDFFCC]',
      active: 'bg-white/90 text-[#482139] hover:bg-white/90',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});
interface UserItemProps {
  id: string;
  tenantId: string;
  label?: string;
  image?: string;
  variant?: VariantProps<typeof userItemVariants>['variant'];
}

export const UserItem = ({ id, image, label, variant, tenantId }: UserItemProps) => {
  const t = useTranslations('component.chat.userItem');
  const displayLabel = label || t('defaultLabel');
  const avatarFallback = displayLabel.charAt(0).toUpperCase();

  return (
    <Button asChild size="sm" variant="outline" className={cn(userItemVariants({ variant }))}>
      <Link href={`/workspace/${tenantId}/member/${id}`}>
        <Avatar className="mr-1 size-5">
          <AvatarImage src={image} />
          <AvatarFallback>{avatarFallback}</AvatarFallback>
        </Avatar>
        <span className="truncate text-sm">{displayLabel}</span>
      </Link>
    </Button>
  );
};
