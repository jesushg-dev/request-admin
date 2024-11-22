import { FC } from 'react';
import type { FieldErrors, FieldValues, FormState } from 'react-hook-form';

interface ErrorListProps<TFieldValues extends FieldValues = FieldValues> {
  formState: FormState<TFieldValues>;
}

const renderErrors = (errors: FieldErrors): React.ReactNode => {
  return Object.entries(errors).map(([fieldName, error]) => {
    // If the error has a nested structure
    if (error && typeof error === 'object' && error.message === undefined) {
      return (
        <li key={fieldName}>
          <strong className="font-bold">{fieldName}:</strong>
          <ul>{renderErrors(error as FieldErrors)}</ul> {/* Recursive call for nested errors */}
        </li>
      );
    } else {
      // Base request: render the error message
      return (
        <li key={fieldName}>
          <strong className="font-bold">{fieldName}:</strong> {typeof error?.message === 'string' ? error.message : 'Unknown error'}
        </li>
      );
    }
  });
};

const ErrorList: FC<ErrorListProps> = ({ formState: { errors } }) => {
  if (!errors || Object.keys(errors).length === 0) {
    return null;
  }

  return (
    <div className="relative rounded border border-red-400 bg-red-100 px-4 py-3 text-sm text-red-700" role="alert">
      <strong className="font-bold">Error: </strong>
      <span className="block sm:inline">Please correct the following errors:</span>
      <ul className="mt-2 list-inside list-disc">{renderErrors(errors)}</ul>
    </div>
  );
};

export default ErrorList;
