'use client';

import { ErrorMessage } from '@hookform/error-message';
import React, { useEffect, useMemo, useState } from 'react';
import { Control, FieldValues, FormState, Path, useController } from 'react-hook-form';

import ReactSelect, { StylesConfig } from 'react-select';
import type { Props as SelectProps } from 'react-select';

import { twMerge } from 'tailwind-merge';

type OmitProps = 'name' | 'ref' | 'value' | 'onChange' | 'onBlur';

interface ISelectProps<K, TFieldValues extends FieldValues = FieldValues> extends Omit<SelectProps<K>, OmitProps> {
  name: Path<TFieldValues>;
  formState: FormState<TFieldValues>;
  control: Control<TFieldValues>;
  required?: boolean;
  label?: string;
  rightLabel?: React.ReactNode;
  showHelper?: boolean;
  error?: any;
  className?: string;
  helperClass?: string;
  RightIcon?: React.FunctionComponent<any>;
  Icon?: React.FunctionComponent<any>;
  selectProps?: SelectProps;
  labelProps?: React.LabelHTMLAttributes<HTMLLabelElement>;
  containerClassName?: string;
}

const Select = <K, TFieldValues extends FieldValues = FieldValues>({
  name,
  control,
  label,
  labelProps,
  formState,
  rightLabel,
  error,
  Icon,
  RightIcon,
  className,
  containerClassName,
  helperClass,
  required = false,
  showHelper = true,
  ...rest
}: ISelectProps<K, TFieldValues>) => {
  const hasIcon = useMemo(() => !!Icon, [Icon]);
  const styles = useMemo(() => makeStyles<K, boolean>(hasIcon), [hasIcon]);
  const {
    field: { onChange, onBlur, value, ref },
  } = useController({
    name,
    control,
    rules: { required },
  });

  const [menuPortalTarget, setMenuPortalTarget] = useState<HTMLElement>();

  useEffect(() => {
    setMenuPortalTarget(document?.body);
  }, []);

  if (!menuPortalTarget) {
    return null;
  }

  return (
    <div className={twMerge('flex flex-col justify-between', containerClassName)}>
      {label && (
        <label htmlFor={rest?.id || name} {...labelProps} className={twMerge('mb-1 block text-sm font-medium text-black dark:text-white', labelProps?.className)}>
          {required && <span className="mr-1 text-red-400">*</span>}
          {label}
        </label>
      )}

      <div className="disabled:bg-whiter dark:bg-form-input relative block w-full rounded-md border-[1.5px] bg-transparent text-sm text-black shadow-sm outline-none transition focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 active:border-primary disabled:cursor-default dark:text-white">
        {Icon && (
          <div className="absolute z-10 flex h-full items-center justify-center pl-3 text-black">
            <Icon />
          </div>
        )}
        <ReactSelect menuPortalTarget={menuPortalTarget} styles={styles} {...rest} getOptionValue={rest.getOptionValue} ref={ref} value={value} onChange={onChange} onBlur={onBlur} id={rest?.id || name} />
      </div>
      {showHelper && formState && <ErrorMessage name={name as any} errors={formState} render={({ message }) => <p className="mt-2 text-xs text-red-600">{message}</p>} />}
    </div>
  );
};
const makeStyles = <T, _>(hasIcon: boolean): StylesConfig<T> => ({
  container: (provided) => ({
    ...provided,
    width: '100%',
    minHeight: '2rem',
    borderRadius: '0.1rem', // Tailwind's
    borderColor: '#cbd5e0', // Assuming this is your border-primary color
    backgroundColor: 'transparent',
    //paddingLeft: hasIcon ? "2.5rem" : "0.5rem", // Adjust based on icon presence
    // Ensuring the container mimics the input styling
    display: 'flex',
    alignItems: 'center',
    '&:hover': {
      borderColor: '#cbd5e0',
    },
  }),
  control: (provided, { isFocused }) => ({
    ...provided,
    borderWidth: '0px',
    borderColor: isFocused ? '#cbd5e0' : provided.borderColor,
    boxShadow: 'none',
    backgroundColor: 'transparent',
    // Full width and proper alignment
    width: '100%',
    minHeight: '2rem',
    '&:hover': {
      borderColor: '#cbd5e0',
    },
  }),
  valueContainer: (provided) => ({
    ...provided,
    padding: '0px',
    // Ensure the text and selected value are aligned properly, especially if an icon is present
    paddingLeft: hasIcon ? '2rem' : '.5rem',
  }),
  input: (provided) => ({
    ...provided,
    margin: '0px',
    // Removing default styles that might conflict with custom ones
  }),
  option: (provided, state) => ({
    ...provided,
    color: state.isSelected ? '#fff' : '#2d3748',
    backgroundColor: state.isSelected ? '#3182ce' : '#fff',
    fontSize: '0.875rem',
    '&:hover': {
      backgroundColor: '#3182ce',
      color: '#fff',
    },
  }),
  singleValue: (provided, state) => ({
    ...provided,
    color: '#2d3748',
    fontSize: '0.875rem',
  }),
  placeholder: (provided, state) => ({
    ...provided,
    color: '#a0aec0',
    fontSize: '0.875rem',
  }),
  indicatorSeparator: (provided, state) => ({
    ...provided,
    display: 'none',
  }),
  dropdownIndicator: (provided, state) => ({
    ...provided,
    color: '#a0aec0',
    padding: '0.5rem',
    // Adjusting for consistent appearance
  }),
  menu: (provided) => ({
    ...provided,
    zIndex: 9999,
    marginTop: '0',
    borderRadius: '0.75rem',
    boxShadow: '1px 4px 8px 1px rgba(94, 94, 94, 0.2)',
    // Ensuring the dropdown menu's style is consistent with the overall design
  }),
  menuList: (provided) => ({
    ...provided,
    padding: '0',
    // Maximizing the space for options
  }),
  menuPortal: (provided) => ({
    ...provided,
    zIndex: 9999,
    // Ensuring the dropdown is always on top
  }),
});

export default Select;
