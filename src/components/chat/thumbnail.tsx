import { Dialog, DialogContent, DialogTrigger } from '../ui/dialog';

/* eslint-disable @next/next/no-img-element */
interface ThumbnailProps {
  url: string | null | undefined;
}

export const Thumbnail = ({ url }: ThumbnailProps) => {
  if (!url) return null;
  return (
    <Dialog>
      <DialogTrigger>
        <div className="relative my-2 max-w-[260px] cursor-zoom-in overflow-hidden rounded-lg border">
          <img src={url} className="size-full rounded-md object-cover" alt="Message img" />
        </div>
      </DialogTrigger>
      <DialogContent className="max-w-[800px] border-none bg-transparent p-0 shadow-none">
        <img src={url} className="size-full rounded-md object-cover" alt="Message img" />
      </DialogContent>
    </Dialog>
  );
};
