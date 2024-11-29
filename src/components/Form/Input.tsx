import React from 'react';
import { ErrorMessage } from '@hookform/error-message';
import { FieldValues, FormState, Path, UseFormRegister } from 'react-hook-form';
import { twMerge } from 'tailwind-merge';

interface IInputProps<TFieldValues extends FieldValues = FieldValues>
  extends Omit<React.DetailedHTMLProps<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>, 'name' | 'ref' | 'required'> {
  name: Path<TFieldValues>;
  formState: FormState<TFieldValues>;
  register: UseFormRegister<TFieldValues>;
  required?: boolean;
  label?: string;
  rightLabel?: React.ReactNode;
  showHelper?: boolean;
  error?: any;
  className?: string;
  helperClass?: string;
  containerClassName?: string;
  RightIcon?: React.FunctionComponent<any>;
  Icon?: React.FunctionComponent<any>;
  labelProps?: React.LabelHTMLAttributes<HTMLLabelElement>;
}

const Input = <TFieldValues extends FieldValues = FieldValues>({
  name,
  formState,
  register,
  label,
  labelProps,
  rightLabel,
  error,
  Icon,
  RightIcon,
  className,
  helperClass,
  required = false,
  showHelper = true,
  containerClassName,
  ...rest
}: IInputProps<TFieldValues>) => {
  const { isDirty, isSubmitting, isValid, disabled, errors } = formState;

  const valueAsNumber = rest.type === 'number';

  const finalInputProps = {
    ...rest,
    ...register(name, { required, valueAsNumber }),
  };

  if (rest.type === 'hidden') {
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

      <div className="relative flex w-full flex-wrap items-stretch">
        {Icon && <Icon className="absolute z-[1] h-full w-8 items-center justify-center rounded-md bg-transparent py-2 pl-3 text-center text-base font-normal leading-snug text-black" />}
        <input
          {...finalInputProps}
          className={twMerge(
            `disabled:bg-whiter dark:bg-form-input block rounded-md border-[1.5px] bg-transparent px-5 py-2 text-sm text-black shadow-sm outline-none transition focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 active:border-primary disabled:cursor-default dark:text-white ${Icon ? 'pl-10' : 'pl-2'} ${finalInputProps?.type === 'checkbox' ? 'h-5 w-5' : 'w-full'}`,
            className
          )}
          id={rest?.id || name}
          aria-invalid={!!errors[name]}
          disabled={isSubmitting || disabled}
        />
        {RightIcon && (
          <RightIcon className="absolute right-4 z-10 h-full w-8 items-center justify-center rounded-md bg-transparent py-2 pl-3 text-center text-base font-normal leading-snug text-black" />
        )}
      </div>
      {showHelper && <ErrorMessage name={name as any} errors={errors} render={({ message }) => <p className="mt-2 text-xs text-red-600">{message}</p>} />}
    </div>
  );
};

export default Input;
