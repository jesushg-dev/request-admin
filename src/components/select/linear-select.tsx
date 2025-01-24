'use client';

import * as React from 'react';
import { CheckIcon } from 'lucide-react';

import { useHotkeys } from '@/hooks/use-hot-keys';
import { Button } from '@/components/ui/button';
import { Command, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

import { Kbd } from '../kbd';

interface Option {
  value: string;
  label: string;
  icon?: React.ComponentType<{ className?: string; title?: string }>;
}

interface SelectComboboxProps {
  options: Option[];
  value?: string;
  defaultValue?: string;
  defaultIcon?: React.ComponentType<{ className?: string; title?: string }>;
  hotkey?: string;
  placeholder?: string;
  buttonText?: string;
  onChange?: (value: string) => void;
  onSelectOption?: (option: Option | null) => void;
}

export const SelectCombobox: React.FC<SelectComboboxProps> = ({
  options,
  value,
  defaultValue,
  defaultIcon: DefaultIcon,
  hotkey = 'p',
  placeholder = 'Search...',
  buttonText = 'Select option',
  onChange,
  onSelectOption,
}) => {
  const [openPopover, setOpenPopover] = React.useState(false);
  const [openTooltip, setOpenTooltip] = React.useState(false);
  const [internalValue, setInternalValue] = React.useState(defaultValue || '');
  const [searchValue, setSearchValue] = React.useState('');

  const isControlled = typeof value !== 'undefined';
  const currentValue = isControlled ? value : internalValue;

  const selectedOption = options.find((option) => option.value === currentValue) || null;
  const isSearching = searchValue.length > 0;

  useHotkeys([
    [
      hotkey,
      () => {
        setOpenTooltip(false);
        setOpenPopover(true);
      },
    ],
  ]);

  const handleSelectOption = (option: Option | null) => {
    const newValue = option?.value || '';
    if (!isControlled) {
      setInternalValue(newValue);
    }
    onChange?.(newValue);
    onSelectOption?.(option);
    setOpenTooltip(false);
    setOpenPopover(false);
    setSearchValue('');
  };

  return (
    <Popover open={openPopover} onOpenChange={setOpenPopover}>
      <Tooltip delayDuration={500} open={openTooltip} onOpenChange={setOpenTooltip}>
        <TooltipTrigger asChild>
          <PopoverTrigger asChild>
            <Button aria-label="Select option" variant="ghost" size="sm" className="text-primary h-8 w-fit px-2 text-[0.8125rem] leading-normal font-medium">
              {selectedOption ? (
                <>
                  {selectedOption.icon && <selectedOption.icon className="mr-2 size-4 stroke-current" aria-hidden="true" />}
                  {selectedOption.label}
                </>
              ) : (
                <>
                  {DefaultIcon && <DefaultIcon className="mr-2 size-4 stroke-current" aria-hidden="true" title="Select option" />}
                  {buttonText}
                </>
              )}
            </Button>
          </PopoverTrigger>
        </TooltipTrigger>
        <TooltipContent hideWhenDetached side="bottom" align="start" sideOffset={6} className="bg-background flex h-8 items-center gap-2 border px-2 text-xs">
          <span className="text-primary">Change option</span>
          <Kbd />
        </TooltipContent>
      </Tooltip>
      <PopoverContent className="w-[206px] rounded-lg p-0" align="start" onCloseAutoFocus={(e) => e.preventDefault()} sideOffset={6}>
        <Command className="rounded-lg">
          <CommandInput
            value={searchValue}
            onValueChange={(value) => {
              const numericValue = Number.parseInt(value, 10);
              if (!isNaN(numericValue) && numericValue >= 0 && numericValue < options.length) {
                handleSelectOption(options[numericValue] || null);
                return;
              }
              setSearchValue(value);
            }}
            className="text-[0.8125rem] leading-normal"
            placeholder={placeholder}
          />
          <CommandList>
            <CommandGroup>
              {options.map((option, index) => (
                <CommandItem
                  key={option.value}
                  value={option.value}
                  onSelect={(value) => {
                    handleSelectOption(options.find((o) => o.value === value) || null);
                  }}
                  className="group text-primary flex w-full items-center justify-between rounded-md text-[0.8125rem] leading-normal">
                  <div className="flex items-center">
                    {option.icon && <option.icon title={option.label} className="stroke-muted-foreground group-hover:stroke-primary mr-2 size-4" />}
                    <span>{option.label}</span>
                  </div>
                  <div className="flex items-center">
                    {selectedOption?.value === option.value && <CheckIcon className="stroke-muted-foreground group-hover:stroke-primary mr-3 size-4" />}
                    {!isSearching && <span className="text-xs">{index}</span>}
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
