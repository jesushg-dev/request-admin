import { ReactNode, useState } from 'react';
import EmojiPicker, { EmojiClickData, Theme } from 'emoji-picker-react';
import { useTheme } from 'next-themes';

import { Hint } from '../hint';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';

interface EmojiPopoverProps {
  children: ReactNode;
  hint?: string;
  onEmojiSelect: (emoji: EmojiClickData) => void;
}

export const EmojiPopover = ({ children, onEmojiSelect, hint = 'Emoji' }: EmojiPopoverProps) => {
  const { theme } = useTheme();
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [tooltipOpen, setTooltipOpen] = useState(false);

  const onSelect = (emoji: EmojiClickData) => {
    onEmojiSelect(emoji);
    setPopoverOpen(false);

    setTimeout(() => {
      setTooltipOpen(false);
    }, 500);
  };

  return (
    <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
      <Hint label={hint} open={tooltipOpen} onOpenChange={setTooltipOpen}>
        <PopoverTrigger asChild>{children}</PopoverTrigger>
      </Hint>
      <PopoverContent className="w-full border-none p-0 shadow-none">
        <EmojiPicker theme={theme === 'dark' ? Theme.DARK : Theme.LIGHT} onEmojiClick={onSelect} />
      </PopoverContent>
    </Popover>
  );
};
