'use client';

import { useFormContext } from 'react-hook-form';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function SummaryStep() {
  const { watch } = useFormContext();
  const formData = watch();

  const renderCategorySection = (title: string, data: any[]) => (
    <div className="mb-4">
      <h3 className="mb-2 text-lg font-semibold">{title}</h3>
      {data.map((category, index) => (
        <div key={index} className="ml-4">
          <p>
            <strong>Level {index + 1}:</strong> {category.value || 'Not selected'}
          </p>
        </div>
      ))}
    </div>
  );

  const renderRequirementsSection = () => (
    <div className="mb-4">
      <h3 className="mb-2 text-lg font-semibold">Requirements</h3>
      {Object.entries(formData.requirementCompliance).map(([key, value]) => (
        <div key={key} className="ml-4">
          <p>
            <strong>{key}:</strong> {value ? 'Fulfilled' : 'Not fulfilled'}
            {formData.documents[key] && ` - Document: ${formData.documents[key].name}`}
          </p>
        </div>
      ))}
    </div>
  );

  const renderRequestDetailsSection = () => (
    <div className="mb-4">
      <h3 className="mb-2 text-lg font-semibold">Request Details</h3>
      {Object.entries(formData.requestDetails).map(([key, value]) => (
        <div key={key} className="ml-4">
          <p>
            <strong>{key}:</strong> {String(value) || 'Not provided'}
          </p>
        </div>
      ))}
    </div>
  );

  const renderDynamicFormSection = () => (
    <div className="mb-4">
      <h3 className="mb-2 text-lg font-semibold">Dynamic Form</h3>
      {formData.dynamicForm &&
        Object.entries(formData.dynamicForm).map(([key, value]) => (
          <div key={key} className="ml-4">
            <p>
              <strong>{key}:</strong> {String(value) || 'Not provided'}
            </p>
          </div>
        ))}
    </div>
  );

  return (
    <div className="m-1 flex flex-col gap-2">
      {renderCategorySection('Service Category', formData.categories.requestCategory)}
      {renderCategorySection('Assignation Category', formData.categories.assignationCategory)}
      {renderRequirementsSection()}
      {renderRequestDetailsSection()}
      {renderDynamicFormSection()}
    </div>
  );
}
