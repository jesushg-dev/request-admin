import Image from 'next/image';
import { useTranslations } from 'next-intl';

import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';

interface ThumbnailProps {
  src: string | null | undefined;
}

export const Thumbnail = ({ src }: ThumbnailProps) => {
  const t = useTranslations('component.chat.thumbnail');
  if (!src) return null;

  return (
    <div className="group/thumbnail relative flex size-[62px] justify-center">
      <Dialog>
        <DialogTrigger asChild>
          <div className="w-full h-full cursor-zoom-in">
            <Image src={src} alt={t('alt')} fill className="overflow-hidden rounded-xl border object-cover" />
          </div>
        </DialogTrigger>
        <DialogContent className="max-w-[800px] border-none bg-transparent p-0 shadow-none flex items-center justify-center">
          {/* eslint-disable @next/next/no-img-element */}
          <img src={src} alt={t('alt')} className="max-h-[80vh] max-w-full rounded-xl object-contain" />
        </DialogContent>
      </Dialog>
    </div>
  );
};
