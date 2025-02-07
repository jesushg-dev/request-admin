import { JSX, useEffect, useState } from 'react';
import { AlertCircle, X } from 'lucide-react';
import { useFormState } from 'react-hook-form';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

export function ZodErrorAlert() {
  const { errors } = useFormState();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (Object.keys(errors).length > 0) {
      setIsVisible(true);
    }
  }, [errors]);

  const renderErrors = (errorObj: unknown): JSX.Element[] => {
    return Object.entries(errorObj as { [key: string]: unknown })
      .map(([key, value]) => {
        if (value && typeof value === 'object') {
          if ('message' in value) {
            return (
              <div key={key} className="ml-4 mt-1 flex items-start">
                <span className="mr-2">•</span>
                <span className="capitalize">{key}</span>: {(value as { message: string }).message}
              </div>
            );
          }
          if (Array.isArray(value)) {
            return value.map((item, index) => (
              <div key={`${key}-${index}`} className="ml-4">
                <div className="font-medium mt-2 text-sm">
                  {key.slice(0, -1)} {index + 1}
                </div>
                {renderErrors(item)}
              </div>
            ));
          }
          return (
            <div key={key} className="ml-4">
              {renderErrors(value)}
            </div>
          );
        }
        return null;
      })
      .filter(Boolean) as JSX.Element[];
  };

  if (!isVisible || !errors || Object.keys(errors).length === 0) return null;

  return (
    <Alert variant="destructive" className="relative">
      <AlertCircle className="h-4 w-4" />
      <Button variant="outline" onClick={() => setIsVisible(false)} className="absolute right-2 top-2 ">
        Close
        <X />
      </Button>
      <AlertDescription className="mt-1">
        <div className="font-semibold mb-2">Please fix the following errors:</div>
        <div className="text-sm">{renderErrors(errors)}</div>
      </AlertDescription>
    </Alert>
  );
}
