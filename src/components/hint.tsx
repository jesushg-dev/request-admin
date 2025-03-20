'use client';

import { ReactNode } from 'react';

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';

interface HintProps {
  label: string;
  children: ReactNode;
  side?: 'top' | 'right' | 'bottom' | 'left';
  align?: 'center' | 'end' | 'start';
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export const Hint = ({ children, label, align, side, open, onOpenChange }: HintProps) => {
  return (
    <TooltipProvider>
      <Tooltip delayDuration={50} open={open} onOpenChange={onOpenChange}>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent side={side} align={align} className="border-white/5 bg-[#1F1F1F] text-white z-[1000] max-w-44">
          <p className="text-medium text-xs">{label}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
