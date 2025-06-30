'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { AnimatePresence, motion, type TargetAndTransition, type Transition } from 'motion/react';

import { cn } from '@/lib/utils';

type AnimationProps = {
  initial: TargetAndTransition;
  animate: TargetAndTransition;
  exit: TargetAndTransition;
  transition?: Transition;
};

// Section component with collapsible functionality
interface AccordionSectionProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
  className?: string;
  animation?: AnimationProps;
}

export const AccordionSection = ({
  title,
  icon,
  children,
  defaultOpen = true,
  className,
  animation = {
    initial: { height: 0, opacity: 0 },
    animate: { height: 'auto', opacity: 1 },
    exit: { height: 0, opacity: 0 },
    transition: { duration: 0.3, ease: 'easeInOut' },
  },
}: AccordionSectionProps) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const sectionId = `section-${title.replace(/\s+/g, '-').toLowerCase()}`;

  return (
    <div className={cn('border rounded-sm overflow-hidden', className)}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 bg-muted/20 hover:bg-muted/30 transition-colors"
        aria-expanded={isOpen}
        aria-controls={sectionId}
        id={`${sectionId}-header`}>
        <div className="flex items-center text-sm font-medium">
          <span className="mr-2" aria-hidden="true">
            {icon}
          </span>
          {title}
        </div>
        {isOpen ? <ChevronUp className="h-4 w-4" aria-hidden="true" /> : <ChevronDown className="h-4 w-4" aria-hidden="true" />}
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            id={sectionId}
            initial={animation.initial}
            animate={animation.animate}
            exit={animation.exit}
            transition={animation.transition}
            role="region"
            aria-labelledby={`${sectionId}-header`}
            className="overflow-hidden">
            <div className="p-4">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
