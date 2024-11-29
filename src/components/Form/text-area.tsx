import React from 'react';
import { twMerge } from 'tailwind-merge';
import { ErrorMessage } from '@hookform/error-message';
import { FieldValues, FormState, Path, UseFormRegister } from 'react-hook-form';

interface ITextareaProps<TFieldValues extends FieldValues = FieldValues> extends Omit<React.DetailedHTMLProps<React.TextareaHTMLAttributes<HTMLTextAreaElement>, HTMLTextAreaElement>, 'name' | 'ref' | 'required'> {
  name: Path<TFieldValues>;
  formState: FormState<TFieldValues>;
  register: UseFormRegister<TFieldValues>;
  required?: boolean;
  label?: string;
  rightLabel?: React.ReactNode;
  error?: any;
  className?: string;
  containerClassName?: string;
  helperClass?: string;
  RightIcon?: React.FunctionComponent<any>;
  Icon?: React.FunctionComponent<any>;
  textareaProps?: Omit<React.DetailedHTMLProps<React.TextareaHTMLAttributes<HTMLTextAreaElement>, HTMLTextAreaElement>, 'name' | 'ref' | 'required'>;
  labelProps?: React.LabelHTMLAttributes<HTMLLabelElement>;
}

const Textarea = <TFieldValues extends FieldValues = FieldValues>({
  name,
  formState,
  register,
  label,
  labelProps,
  rightLabel,
  error,
  Icon,
  RightIcon,
  textareaProps,
  className,
  helperClass,
  containerClassName,
  required = false,
  ...rest
}: ITextareaProps<TFieldValues>) => {
  const { isSubmitting, errors } = formState;

  const finalTextareaProps = {
    ...rest,
    ...textareaProps,
    ...register(name, { required }),
  };

  return (
    <div className={twMerge('flex flex-col justify-between', containerClassName)}>
      {label && (
        <label htmlFor={textareaProps?.id || name} {...labelProps} className={twMerge('mb-1 block text-sm font-medium text-black dark:text-white', labelProps?.className)}>
          {required && <span className="mr-1 text-red-400">*</span>}
          {label}
          {rightLabel && <span className="ml-2 text-sm">{rightLabel}</span>}
        </label>
      )}

      <div className="relative flex w-full flex-wrap items-stretch">
        {Icon && <Icon className="absolute z-[1] h-full w-8 items-center justify-center rounded-md bg-transparent py-2 pl-3 text-center text-base font-normal leading-snug text-black" />}
        <textarea
          {...finalTextareaProps}
          className={twMerge(
            `resize-vertical disabled:bg-whiter dark:bg-form-input w-full rounded-md border-[1.5px] border-gray-300 bg-transparent px-5 py-2 text-sm text-black shadow-sm outline-none transition focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 active:border-primary disabled:cursor-not-allowed dark:text-white ${Icon ? 'pl-10' : 'pl-2'}`,
            textareaProps?.className,
            className
          )}
          aria-invalid={!!errors[name]}
          disabled={isSubmitting}
          id={rest?.id || name}
        />
        {RightIcon && <RightIcon className="absolute right-4 z-10 h-full w-8 items-center justify-center rounded-md bg-transparent py-2 pl-3 text-center text-xs font-normal leading-snug text-black" />}
      </div>

      <ErrorMessage name={name as any} errors={errors} render={({ message }) => <p className={twMerge('mt-2 text-xs text-red-600', helperClass)}>{message}</p>} />
    </div>
  );
};

export default Textarea;
