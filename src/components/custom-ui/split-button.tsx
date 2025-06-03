// Location: components/SplitButton.tsx

import { useEffect, useState } from 'react';
import { I18Link, Link } from '@/i18n/routing';
import { ChevronDown, LucideIcon } from 'lucide-react';
// NOTE: if you’re on Framer Motion v10+, use "motion/react":
import { motion } from 'motion/react';

import { cn } from '@/lib/utils';
import { Button, type ButtonVariants } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

import { Hint } from '../hint';

//
// Props definitions:
//
// - Each action must have a `label` (string). If you want an icon-only item,
//   you can pass `label: ""` and rely on `icon` + `ariaLabel` (see below).
// - Optionally specify a `variant` (to control Shadcn button styling), and/or an `icon`.
// - An action must have either an `href` (for links) or an `onClick` (for JS logic).
// - If you supply `ariaLabel`, it will be applied when `label` is empty (icon-only).
//
type Action = {
  label: string;
  variant?: ButtonVariants;
  icon?: LucideIcon;
  ariaLabel?: string; // for icon-only buttons, e.g. "Delete" or "Copy Link"
} & ({ href: I18Link; onClick?: () => void } | { onClick: () => void; href?: I18Link });

export interface SplitButtonProps {
  /** List of actions. The “selected” action becomes the primary. */
  actions: Action[];

  disabled?: boolean;
  /**
   * If true, selecting a dropdown item will only swap the primary action.
   * The newly selected primary will fire when its button is clicked.
   * (Default: true)
   */
  swapPrimary?: boolean;

  /** If true, the primary button will always show its label. otherwise, it will only show as hint text when user hovers over it. */
  showPrimaryLabel?: boolean;

  /** Optional className for the outer container. */
  className?: string;
}

export function SplitButton({ actions, disabled = false, swapPrimary = false, showPrimaryLabel = false, className }: SplitButtonProps) {
  // Always call hooks at the top
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Ensure selectedIndex is within bounds if actions array changes
  useEffect(() => {
    if (selectedIndex >= actions.length) {
      setSelectedIndex(0);
    }
  }, [actions.length, selectedIndex]);

  // Determine which action is primary, and which belong in the dropdown
  const primaryAction = actions[selectedIndex];
  const menuActions = actions.filter((_, idx) => idx !== selectedIndex);

  // Use the same variant as primary for the chevron
  const chevronVariant = primaryAction.variant ?? 'default';

  // Render the primary button (either as a <Button> or <Button asChild> with <Link>)
  function renderPrimaryButton() {
    const { label, icon: Icon, variant, href, ariaLabel } = primaryAction;

    const needsAria = !label || label.trim() === '';

    if (href) {
      return (
        <Button disabled={disabled} variant={variant} className={`gap-2 ${actions.length > 1 ? 'rounded-r-none mr-0.5' : ''}`} asChild aria-label={needsAria ? ariaLabel : undefined}>
          <Link href={href} className="flex items-center gap-2">
            {Icon && <Icon className={cn(label ? 'h-4 w-4' : 'h-4 w-4')} />}
            {showPrimaryLabel ? label : <span className="sr-only">{ariaLabel}</span>}
          </Link>
        </Button>
      );
    }

    return (
      <Button
        disabled={disabled}
        variant={variant}
        className={`gap-2 ${actions.length > 1 ? 'rounded-r-none mr-0.5' : ''}`}
        onClick={primaryAction.onClick}
        aria-label={needsAria ? ariaLabel : undefined}>
        {Icon && <Icon className={cn(label ? 'h-4 w-4' : 'h-4 w-4')} />}
        {showPrimaryLabel ? label : <span className="sr-only">{ariaLabel}</span>}
      </Button>
    );
  }

  // If no actions provided, render nothing
  if (!actions || actions.length === 0) {
    console.warn('SplitButton: you must pass at least one action.');
    return null;
  }

  return (
    <DropdownMenu>
      <div className={cn('inline-flex items-center', className)}>
        {/** Render the primary button **/}
        {showPrimaryLabel ? renderPrimaryButton() : <Hint label={primaryAction.label}>{renderPrimaryButton()}</Hint>}

        {/** If there are no dropdown items, skip rendering the chevron **/}
        {menuActions.length > 0 && (
          <>
            {/*
              Right-hand chevron trigger (same variant as primary). We remove left border-radius so it stitches.
            */}
            <DropdownMenuTrigger asChild>
              <Button variant={chevronVariant} className="rounded-l-none px-2 " aria-label="Toggle actions">
                <ChevronDown />
              </Button>
            </DropdownMenuTrigger>

            {/*
              Animated dropdown menu (only swaps primary; does not fire onClick here).
            */}
            <DropdownMenuContent asChild align="end">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.18 }}
                className="w-48 bg-background rounded-md shadow-lg py-1">
                {menuActions.map((action) => {
                  // Find the real index in the original actions array
                  const realIndex = actions.findIndex((a) => a === action);
                  const { label, icon: Icon, href, ariaLabel } = action;

                  const menuItemContent = (
                    <div className="flex items-center">
                      {Icon && <Icon className={cn(label ? 'mr-2 h-4 w-4' : 'h-4 w-4')} />}
                      {label}
                    </div>
                  );

                  // Every dropdown item merely swaps primary—no immediate onClick
                  if (href) {
                    return (
                      <DropdownMenuItem
                        key={realIndex}
                        asChild
                        aria-label={!label ? ariaLabel : undefined}
                        onSelect={() => {
                          if (swapPrimary) {
                            setSelectedIndex(realIndex);
                          }
                        }}>
                        <Link href={href}>{menuItemContent}</Link>
                      </DropdownMenuItem>
                    );
                  }

                  return (
                    <DropdownMenuItem
                      key={realIndex}
                      onSelect={() => {
                        if (swapPrimary) {
                          setSelectedIndex(realIndex);
                        }
                      }}
                      aria-label={!label ? ariaLabel : undefined}
                      className="flex items-center">
                      {menuItemContent}
                    </DropdownMenuItem>
                  );
                })}
              </motion.div>
            </DropdownMenuContent>
          </>
        )}
      </div>
    </DropdownMenu>
  );
}
