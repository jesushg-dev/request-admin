import { FC } from 'react';
import Image from 'next/image';
import { XIcon } from 'lucide-react';

import { Hint } from '../hint';

interface ImagePreviewProps {
  imagePreview: string;
  imageName?: string;
  disabled: boolean;
  onRemove: () => void;
  removeImageLabel: string;
  altLabel: string;
}

export const ImagePreview: FC<ImagePreviewProps> = ({ imagePreview, imageName, disabled, onRemove, removeImageLabel, altLabel }) => (
  <div className="p-2">
    <div className="group/image relative flex size-[62px] justify-center">
      <Hint label={removeImageLabel}>
        <button
          type="button"
          disabled={disabled}
          onClick={onRemove}
          className="absolute -top-2.5 -right-2.5 z-10 flex size-6 items-center justify-center rounded-full border-2 bg-background transition-opacity opacity-0 group-hover/image:opacity-100"
          aria-label={removeImageLabel}>
          <XIcon className="size-3.5" />
        </button>
      </Hint>
      <Image src={imagePreview} alt={altLabel} fill className="overflow-hidden rounded-xl border object-cover" />
    </div>
    {imageName && <div className="text-xs text-muted-foreground mt-1 truncate">{imageName}</div>}
  </div>
);
